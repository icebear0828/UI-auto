/**
 * Service Mocks for Testing
 *
 * Provides mock implementations of AI services and external APIs
 * to enable isolated unit testing without network calls.
 */

import { vi } from 'vitest';
import type { ModelConfig } from '@/types/settings';
import type { UINode, UserContext } from '@/types';

// ============================================================
// GEMINI SERVICE MOCKS
// ============================================================

export const mockGenerateUIStream = vi.fn();
export const mockRefineComponent = vi.fn();
export const mockFixComponent = vi.fn();

/**
 * Creates an async generator that yields chunks for streaming tests
 */
export function createMockStream(chunks: string[]): AsyncGenerator<string, void, unknown> {
    return (async function* () {
        for (const chunk of chunks) {
            yield chunk;
        }
    })();
}

/**
 * Mock successful UI generation
 */
export function mockSuccessfulGeneration(uiNode: UINode) {
    const json = JSON.stringify(uiNode);
    mockGenerateUIStream.mockReturnValue(createMockStream([json]));
    return uiNode;
}

/**
 * Mock streaming UI generation with partial chunks
 */
export function mockStreamingGeneration(uiNode: UINode) {
    const json = JSON.stringify(uiNode);
    // Split into realistic chunks
    const chunks = [];
    for (let i = 0; i < json.length; i += 50) {
        chunks.push(json.slice(i, i + 50));
    }
    mockGenerateUIStream.mockReturnValue(createMockStream(chunks));
    return uiNode;
}

/**
 * Mock tool call response
 */
export function mockToolCallGeneration(toolName: string, args: Record<string, any>) {
    const toolCall = { tool_call: { name: toolName, arguments: args } };
    mockGenerateUIStream.mockReturnValue(createMockStream([JSON.stringify(toolCall)]));
}

/**
 * Mock generation error
 */
export function mockGenerationError(errorMessage: string) {
    mockGenerateUIStream.mockImplementation(async function* () {
        throw new Error(errorMessage);
    });
}

/**
 * Mock refine component success
 */
export function mockRefineSuccess(refinedNode: UINode) {
    mockRefineComponent.mockResolvedValue(refinedNode);
}

/**
 * Mock fix component success
 */
export function mockFixSuccess(fixedNode: UINode) {
    mockFixComponent.mockResolvedValue(fixedNode);
}

// ============================================================
// TOOL SERVICE MOCKS
// ============================================================

export const mockExecuteTool = vi.fn();

export function mockToolResult(result: any) {
    mockExecuteTool.mockResolvedValue(result);
}

// ============================================================
// TELEMETRY MOCKS
// ============================================================

export const mockTelemetry = {
    startTrace: vi.fn().mockReturnValue('mock-trace-id'),
    endTrace: vi.fn(),
    logEvent: vi.fn(),
    logMetric: vi.fn(),
    subscribe: vi.fn().mockReturnValue(() => {}),
};

// ============================================================
// TOAST MOCKS
// ============================================================

export const mockShowToast = vi.fn();

export const mockUseToast = () => ({
    showToast: mockShowToast,
    toasts: [],
});

// ============================================================
// RESET ALL MOCKS
// ============================================================

export function resetAllMocks() {
    mockGenerateUIStream.mockReset();
    mockRefineComponent.mockReset();
    mockFixComponent.mockReset();
    mockExecuteTool.mockReset();
    mockShowToast.mockReset();
    mockTelemetry.startTrace.mockReset();
    mockTelemetry.endTrace.mockReset();
    mockTelemetry.logEvent.mockReset();
    mockTelemetry.logMetric.mockReset();
    mockTelemetry.subscribe.mockReset().mockReturnValue(() => {});
}
