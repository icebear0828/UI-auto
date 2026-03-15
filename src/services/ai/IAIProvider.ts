/**
 * AI Provider Interface
 * 
 * Clean Architecture: Domain layer interface (Port)
 * Defines the contract for AI generation services, allowing
 * different implementations (Gemini, OpenRouter, etc.)
 */

import { UINode, UserContext } from '@/types';
import { ModelConfig } from '@/types/settings';

/**
 * Configuration for UI generation
 */
export interface GenerationConfig {
    prompt: string;
    context: UserContext;
    modelConfig: ModelConfig;
    previousState?: UINode;
}

/**
 * Configuration for component refinement
 */
export interface RefineConfig {
    prompt: string;
    currentNode: UINode;
    modelConfig: ModelConfig;
}

/**
 * Configuration for component fixing
 */
export interface FixConfig {
    error: string;
    badNode: UINode;
    modelConfig: ModelConfig;
}

/**
 * AI Provider Interface
 * 
 * Implementations must provide methods for:
 * - Streaming UI generation
 * - Component refinement
 * - Error fixing (self-healing)
 * - Image generation (optional)
 */
export interface IAIProvider {
    /**
     * Provider name for identification
     */
    readonly name: string;

    /**
     * Generate UI as a stream of JSON chunks
     */
    generateStream(config: GenerationConfig): AsyncGenerator<string, void, unknown>;

    /**
     * Refine an existing component based on user prompt
     */
    refine(config: RefineConfig): Promise<UINode>;

    /**
     * Fix a malformed component
     */
    fix(config: FixConfig): Promise<UINode>;

    /**
     * Generate an image (optional - not all providers support this)
     */
    generateImage?(prompt: string, style?: string): Promise<string>;
}

/**
 * Factory function type for creating AI providers
 */
export type AIProviderFactory = (apiKey: string) => IAIProvider;
