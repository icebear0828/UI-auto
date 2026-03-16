import OpenAI from 'openai';
import { IAIProvider, GenerationConfig, RefineConfig, FixConfig } from './IAIProvider';
import { UINode } from '@/types';
import { telemetry } from '@/services/telemetry';
import { safeJsonParse, errMsg } from './jsonUtils';
import {
    buildGenerationPrompt, buildRefinementPrompt, buildFixPrompt,
    getSystemInstruction, JSON_ENFORCEMENT,
} from './promptBuilder';
import { getUINodeJsonSchema } from './responseSchema';

export class OpenAIProvider implements IAIProvider {
    readonly name = 'OpenAI';
    private client: OpenAI;

    constructor(apiKey: string, baseUrl?: string) {
        const needsProxy = !!baseUrl && typeof window !== 'undefined' && !baseUrl.startsWith('/');
        const proxyBase = needsProxy ? `${window.location.origin}/api/ai-proxy` : undefined;
        this.client = new OpenAI({
            apiKey,
            baseURL: proxyBase ?? baseUrl ?? undefined,
            dangerouslyAllowBrowser: true,
            defaultHeaders: needsProxy ? { 'X-Proxy-Target': baseUrl } : undefined,
        });
    }

    async *generateStream(config: GenerationConfig): AsyncGenerator<string, void, unknown> {
        const contextPrompt = buildGenerationPrompt(config);
        const traceId = telemetry.startTrace('generate_ui_stream_openai');
        let firstTokenReceived = false;
        let accumulatedSize = 0;

        try {
            const modelName = config.modelConfig.model || 'gpt-4o';

            const stream = await this.client.chat.completions.create({
                model: modelName,
                messages: [
                    { role: 'system', content: getSystemInstruction() + JSON_ENFORCEMENT },
                    { role: 'user', content: contextPrompt },
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'UINode',
                        strict: false,
                        schema: getUINodeJsonSchema(),
                    },
                },
                temperature: 0.3,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;

                if (!firstTokenReceived && content) {
                    const startTime = telemetry.getStartTime(traceId);
                    if (startTime) {
                        telemetry.logMetric(traceId, 'TTFT', performance.now() - startTime);
                    }
                    firstTokenReceived = true;
                }

                if (content) {
                    accumulatedSize += content.length;
                    yield content;
                }
            }
        } catch (error: unknown) {
            console.error("OpenAI Stream Error:", error);
            telemetry.logEvent(traceId, 'ERROR', { error: String(error) });

            yield JSON.stringify({
                container: {
                    layout: 'COL', padding: true,
                    children: [{
                        alert: {
                            title: "Generation Error",
                            description: `Failed to stream content: ${errMsg(error)}`,
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
        const traceId = telemetry.startTrace('openai_refine');
        try {
            const response = await this.client.chat.completions.create({
                model: config.modelConfig.model || 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a JSON-only UI generator.' + JSON_ENFORCEMENT },
                    { role: 'user', content: buildRefinementPrompt(config) },
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'UINode',
                        strict: false,
                        schema: getUINodeJsonSchema(),
                    },
                },
                temperature: 0.2,
            });

            const text = response.choices[0]?.message?.content;
            if (!text) {
                telemetry.logEvent(traceId, 'ERROR', { reason: 'empty_response' });
                throw new Error("Empty response from refine model");
            }

            const parsed = safeJsonParse<UINode>(text, 'OpenAIProvider.refine');
            telemetry.endTrace(traceId);
            return parsed;
        } catch (error: unknown) {
            telemetry.logEvent(traceId, 'ERROR', { error: errMsg(error) });
            telemetry.endTrace(traceId);
            return { alert: { title: "Refinement Failed", description: errMsg(error), variant: "WARNING" } } as UINode;
        }
    }

    async fix(config: FixConfig): Promise<UINode> {
        const traceId = telemetry.startTrace('openai_fix');
        try {
            const response = await this.client.chat.completions.create({
                model: config.modelConfig.model || 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a code fixer. Output raw JSON only.' + JSON_ENFORCEMENT },
                    { role: 'user', content: buildFixPrompt(config) },
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'UINode',
                        strict: false,
                        schema: getUINodeJsonSchema(),
                    },
                },
                temperature: 0.1,
            });

            const text = response.choices[0]?.message?.content;
            if (!text) {
                telemetry.logEvent(traceId, 'ERROR', { reason: 'empty_response' });
                throw new Error("Empty response from fix model");
            }

            const parsed = safeJsonParse<UINode>(text, 'OpenAIProvider.fix');
            telemetry.endTrace(traceId);
            return parsed;
        } catch (err: unknown) {
            telemetry.logEvent(traceId, 'ERROR', { error: errMsg(err) });
            telemetry.endTrace(traceId);
            return { alert: { title: "Auto-Repair Failed", description: `Could not fix: ${errMsg(err)}`, variant: "ERROR" } } as UINode;
        }
    }
}
