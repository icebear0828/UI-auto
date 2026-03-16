import Anthropic from '@anthropic-ai/sdk';
import { IAIProvider, GenerationConfig, RefineConfig, FixConfig } from './IAIProvider';
import { UINode } from '@/types';
import { telemetry } from '@/services/telemetry';
import { safeJsonParse, errMsg } from './jsonUtils';
import {
    buildGenerationPrompt, buildRefinementPrompt, buildFixPrompt,
    getSystemInstruction, JSON_ENFORCEMENT,
} from './promptBuilder';

export class AnthropicProvider implements IAIProvider {
    readonly name = 'Anthropic';
    private client: Anthropic;

    constructor(apiKey: string, baseUrl?: string) {
        const needsProxy = !!baseUrl && typeof window !== 'undefined' && !baseUrl.startsWith('/');
        const proxyBase = needsProxy ? `${window.location.origin}/api/ai-proxy` : undefined;
        this.client = new Anthropic({
            apiKey,
            baseURL: proxyBase ?? baseUrl ?? undefined,
            dangerouslyAllowBrowser: true,
            defaultHeaders: needsProxy ? { 'X-Proxy-Target': baseUrl } : undefined,
        });
    }

    async *generateStream(config: GenerationConfig): AsyncGenerator<string, void, unknown> {
        const contextPrompt = buildGenerationPrompt(config);
        const traceId = telemetry.startTrace('generate_ui_stream_anthropic');
        let firstTokenReceived = false;
        let accumulatedSize = 0;

        try {
            const modelName = config.modelConfig.model || 'claude-sonnet-4-20250514';

            const stream = this.client.messages.stream({
                model: modelName,
                max_tokens: 8192,
                system: getSystemInstruction() + JSON_ENFORCEMENT,
                messages: [{ role: 'user', content: contextPrompt }],
                temperature: 0.3,
            });

            for await (const event of stream) {
                if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                    const content = event.delta.text;

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
            }
        } catch (error: unknown) {
            console.error("Anthropic Stream Error:", error);
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
        const traceId = telemetry.startTrace('anthropic_refine');
        try {
            const response = await this.client.messages.create({
                model: config.modelConfig.model || 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                system: 'You are a JSON-only UI generator.' + JSON_ENFORCEMENT,
                messages: [{ role: 'user', content: buildRefinementPrompt(config) }],
                temperature: 0.2,
            });

            const textBlock = response.content.find(b => b.type === 'text');
            if (!textBlock || textBlock.type !== 'text') {
                telemetry.logEvent(traceId, 'ERROR', { reason: 'empty_response' });
                throw new Error("Empty response from refine model");
            }

            const parsed = safeJsonParse<UINode>(textBlock.text, 'AnthropicProvider.refine');
            telemetry.endTrace(traceId);
            return parsed;
        } catch (error: unknown) {
            telemetry.logEvent(traceId, 'ERROR', { error: errMsg(error) });
            telemetry.endTrace(traceId);
            return { alert: { title: "Refinement Failed", description: errMsg(error), variant: "WARNING" } } as UINode;
        }
    }

    async fix(config: FixConfig): Promise<UINode> {
        const traceId = telemetry.startTrace('anthropic_fix');
        try {
            const response = await this.client.messages.create({
                model: config.modelConfig.model || 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                system: 'You are a code fixer. Output raw JSON only.' + JSON_ENFORCEMENT,
                messages: [{ role: 'user', content: buildFixPrompt(config) }],
                temperature: 0.1,
            });

            const textBlock = response.content.find(b => b.type === 'text');
            if (!textBlock || textBlock.type !== 'text') {
                telemetry.logEvent(traceId, 'ERROR', { reason: 'empty_response' });
                throw new Error("Empty response from fix model");
            }

            const parsed = safeJsonParse<UINode>(textBlock.text, 'AnthropicProvider.fix');
            telemetry.endTrace(traceId);
            return parsed;
        } catch (err: unknown) {
            telemetry.logEvent(traceId, 'ERROR', { error: errMsg(err) });
            telemetry.endTrace(traceId);
            return { alert: { title: "Auto-Repair Failed", description: `Could not fix: ${errMsg(err)}`, variant: "ERROR" } } as UINode;
        }
    }
}
