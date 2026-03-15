/**
 * Gemini AI Provider
 * 
 * Clean Architecture: Infrastructure layer implementation
 * Implements IAIProvider interface for Google Gemini API
 */

import { GoogleGenAI } from "@google/genai";
import {
    IAIProvider,
    GenerationConfig,
    RefineConfig,
    FixConfig
} from './IAIProvider';
import { COMPONENT_SPECS, SYSTEM_INSTRUCTION, FEW_SHOT_EXAMPLES } from '@/constants';
import { UINode } from '@/types';
import { telemetry } from '@/services/telemetry';

const errMsg = (e: unknown): string => e instanceof Error ? e.message : String(e);

/**
 * Safe JSON parsing with detailed error reporting
 */
function safeJsonParse<T = any>(text: string, context: string): T {
    try {
        let cleanedText = text.trim();

        // Remove markdown code blocks if present
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.slice(7);
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.slice(3);
        }
        if (cleanedText.endsWith('```')) {
            cleanedText = cleanedText.slice(0, -3);
        }
        cleanedText = cleanedText.trim();

        return JSON.parse(cleanedText);
    } catch (parseError: unknown) {
        console.error(`[${context}] JSON Parse Error:`, errMsg(parseError));

        // Attempt to extract valid JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch {
                // Fall through to error
            }
        }

        throw new Error(
            `Failed to parse JSON in ${context}: ${errMsg(parseError)}`
        );
    }
}

export class GeminiProvider implements IAIProvider {
    readonly name = 'Gemini';
    private ai: GoogleGenAI;

    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({ apiKey });
    }

    async *generateStream(config: GenerationConfig): AsyncGenerator<string, void, unknown> {
        const { prompt, context, modelConfig, previousState } = config;

        let contextPrompt = `
      CURRENT USER CONTEXT:
      Role: ${context.role}
      Device: ${context.device}
      Theme: ${context.theme}
      Mode: ${context.mode || 'default'}

      AVAILABLE COMPONENT LIBRARY (PROTOBUF DEFINITIONS):
      ${COMPONENT_SPECS}

      FEW-SHOT EXAMPLES:
      ${FEW_SHOT_EXAMPLES}
    `;

        // Inject Galgame specific instructions
        if (context.mode === 'galgame') {
            contextPrompt += `
      
      *** GALGAME ENGINE ACTIVE ***
      You are running in Visual Novel Mode.
      1. YOUR OUTPUT MUST BE A 'vn_stage' COMPONENT.
      2. Do not generate standard UI widgets (containers, cards) unless they are part of the game UI.
      3. Act as a Creative Director / Game Master.
      4. Use 'EXTERNAL_URL' (Pollinations) for backgrounds to ensure variety.
      `;
        }

        // Inject previous state if exists
        if (previousState) {
            contextPrompt += `
      
      CURRENT UI STATE (JSON):
      ${JSON.stringify(previousState, null, 2)}

      UPDATE INSTRUCTION:
      The user wants to modify the CURRENT UI STATE based on the USER REQUEST below.
      1. KEEP existing logic, data, and visual style unless explicitly asked to change.
      2. MERGE new requirements into the existing structure.
      3. Return the COMPLETE updated JSON tree.
      `;
        }

        contextPrompt += `
      USER REQUEST:
      ${prompt}

      INSTRUCTIONS:
      Generate the JSON UI Tree. Ensure layout adapts to ${context.device}.
      Do NOT output Markdown. Output raw JSON.
    `;

        const traceId = telemetry.startTrace('generate_ui_stream_gemini');
        let firstTokenReceived = false;
        let accumulatedSize = 0;

        try {
            const modelName = modelConfig.model || 'gemini-3-flash-preview';

            const responseStream = await this.ai.models.generateContentStream({
                model: modelName,
                contents: contextPrompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
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
                    children: [
                        {
                            alert: {
                                title: "Generation Error",
                                description: `Failed to stream content: ${errMsg(error) || "Unknown error"}`,
                                variant: 'ERROR'
                            }
                        }
                    ]
                }
            });
        } finally {
            telemetry.logMetric(traceId, 'SIZE', accumulatedSize);
            telemetry.endTrace(traceId);
        }
    }

    async refine(config: RefineConfig): Promise<UINode> {
        const { prompt, currentNode, modelConfig } = config;
        const traceId = telemetry.startTrace('gemini_refine');

        const refinementPrompt = `
      You are an expert UI Refiner.

      EXISTING COMPONENT JSON:
      ${JSON.stringify(currentNode, null, 2)}

      USER REQUEST FOR MODIFICATION:
      ${prompt}

      COMPONENT SPECS:
      ${COMPONENT_SPECS}

      INSTRUCTIONS:
      1. Modify the EXISTING COMPONENT JSON to satisfy the USER REQUEST.
      2. Maintain the structure and integrity of the JSON.
      3. Return ONLY the updated JSON for the specific component (and its children).
      4. Do NOT wrap in Markdown.
    `;

        try {
            const response = await this.ai.models.generateContent({
                model: modelConfig.model || 'gemini-3-flash-preview',
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

            // Return fallback UI
            return {
                alert: {
                    title: "Refinement Failed",
                    description: errMsg(error) || "Unable to refine component",
                    variant: "WARNING"
                }
            } as UINode;
        }
    }

    async fix(config: FixConfig): Promise<UINode> {
        const { error, badNode, modelConfig } = config;
        const traceId = telemetry.startTrace('gemini_fix');

        const fixPrompt = `
      You are an expert React/JSON Debugger.

      ERROR DETECTED:
      ${error}

      MALFORMED NODE JSON:
      ${JSON.stringify(badNode, null, 2)}

      COMPONENT SPECS:
      ${COMPONENT_SPECS}

      INSTRUCTIONS:
      1. Analyze the error and the JSON.
      2. Fix the JSON so it strictly adheres to the schema and solves the crash.
      3. Return ONLY the fixed JSON node.
      4. Do NOT wrap in Markdown.
    `;

        try {
            const response = await this.ai.models.generateContent({
                model: modelConfig.model || 'gemini-3-flash-preview',
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

            // Return fallback UI
            return {
                alert: {
                    title: "Auto-Repair Failed",
                    description: `Could not fix: ${errMsg(err)}`,
                    variant: "ERROR"
                }
            } as UINode;
        }
    }

    async generateImage(prompt: string, style: string = 'ANIME_WATERCOLOR'): Promise<string> {
        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [
                        { text: `${style} style. ${prompt}` }
                    ]
                },
                config: {
                    imageConfig: {
                        aspectRatio: "1:1",
                        imageSize: "1K"
                    }
                }
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }

            throw new Error("No image data returned from Gemini");
        } catch (error) {
            console.error("Image Generation Failed:", error);
            return "";
        }
    }
}
