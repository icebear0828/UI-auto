import { GoogleGenAI } from "@google/genai";
import { IAIProvider, GenerationConfig, RefineConfig, FixConfig } from './IAIProvider';
import { UINode } from '@/types';
import { telemetry } from '@/services/telemetry';
import { safeJsonParse, errMsg } from './jsonUtils';
import { buildGenerationPrompt, buildRefinementPrompt, buildFixPrompt, getSystemInstruction } from './promptBuilder';

export class GeminiProvider implements IAIProvider {
    readonly name = 'Gemini';
    private ai: GoogleGenAI;

    constructor(apiKey: string, baseUrl?: string) {
        this.ai = new GoogleGenAI({
            apiKey,
            ...(baseUrl ? { httpOptions: { baseUrl } } : {}),
        });
    }

    async *generateStream(config: GenerationConfig): AsyncGenerator<string, void, unknown> {
        const contextPrompt = buildGenerationPrompt(config);
        const traceId = telemetry.startTrace('generate_ui_stream_gemini');
        let firstTokenReceived = false;
        let accumulatedSize = 0;

        try {
            const modelName = config.modelConfig.model || 'gemini-3-flash-preview';

            const responseStream = await this.ai.models.generateContentStream({
                model: modelName,
                contents: contextPrompt,
                config: {
                    systemInstruction: getSystemInstruction(),
                    responseMimeType: 'application/json',
                    temperature: 0.3,
                }
            });

            for await (const chunk of responseStream) {
                const content = chunk.text;

                if (!firstTokenReceived && content) {
                    const startTime = telemetry.getStartTime(traceId);
                    if (startTime) {
                        const ttft = performance.now() - startTime;
                        telemetry.logMetric(traceId, 'TTFT', ttft);
                    }
                    firstTokenReceived = true;
                }

                if (content) {
                    accumulatedSize += content.length;
                    yield content;
                }
            }
        } catch (error: unknown) {
            console.error("Gemini Stream Error:", error);
            telemetry.logEvent(traceId, 'ERROR', { error: String(error) });

            yield JSON.stringify({
                container: {
                    layout: 'COL',
                    padding: true,
                    children: [{
                        alert: {
                            title: "Generation Error",
                            description: `Failed to stream content: ${errMsg(error) || "Unknown error"}`,
                            variant: 'ERROR'
                        }
                    }]
                }
            });
        } finally {
            telemetry.logMetric(traceId, 'SIZE', accumulatedSize);
            telemetry.endTrace(traceId);
        }
    }

    async refine(config: RefineConfig): Promise<UINode> {
        const traceId = telemetry.startTrace('gemini_refine');
        const refinementPrompt = buildRefinementPrompt(config);

        try {
            const response = await this.ai.models.generateContent({
                model: config.modelConfig.model || 'gemini-3-flash-preview',
                contents: refinementPrompt,
                config: {
                    systemInstruction: "You are a JSON-only UI generator.",
                    responseMimeType: "application/json",
                    temperature: 0.2
                }
            });

            const text = response.text;
            if (!text) {
                telemetry.logEvent(traceId, 'ERROR', { reason: 'empty_response' });
                throw new Error("Empty response from refine model");
            }

            const parsed = safeJsonParse<UINode>(text, 'GeminiProvider.refine');
            telemetry.endTrace(traceId);
            return parsed;
        } catch (error: unknown) {
            telemetry.logEvent(traceId, 'ERROR', { error: errMsg(error) });
            telemetry.endTrace(traceId);
            return { alert: { title: "Refinement Failed", description: errMsg(error), variant: "WARNING" } } as UINode;
        }
    }

    async fix(config: FixConfig): Promise<UINode> {
        const traceId = telemetry.startTrace('gemini_fix');
        const fixPrompt = buildFixPrompt(config);

        try {
            const response = await this.ai.models.generateContent({
                model: config.modelConfig.model || 'gemini-3-flash-preview',
                contents: fixPrompt,
                config: {
                    systemInstruction: "You are a code fixer. Output raw JSON only.",
                    responseMimeType: "application/json",
                    temperature: 0.1
                }
            });

            const text = response.text;
            if (!text) {
                telemetry.logEvent(traceId, 'ERROR', { reason: 'empty_response' });
                throw new Error("Empty response from fix model");
            }

            const parsed = safeJsonParse<UINode>(text, 'GeminiProvider.fix');
            telemetry.endTrace(traceId);
            return parsed;
        } catch (err: unknown) {
            telemetry.logEvent(traceId, 'ERROR', { error: errMsg(err) });
            telemetry.endTrace(traceId);
            return { alert: { title: "Auto-Repair Failed", description: `Could not fix: ${errMsg(err)}`, variant: "ERROR" } } as UINode;
        }
    }
}
