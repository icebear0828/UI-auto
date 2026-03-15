/**
 * AI Provider Singleton Factory
 *
 * Single entry point for obtaining the AI provider instance.
 * Currently uses GeminiProvider; swap implementation here to change providers.
 */

import type { IAIProvider } from './IAIProvider';
import { GeminiProvider } from './GeminiProvider';

let _instance: IAIProvider | null = null;

/**
 * Returns the singleton AI provider instance.
 * Creates it on first call using the API key from environment.
 */
export function getAIProvider(): IAIProvider {
  if (!_instance) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error('API Key must be configured in environment variables (API_KEY)');
    }
    _instance = new GeminiProvider(apiKey);
  }
  return _instance;
}

/**
 * Reset the provider instance (useful for testing).
 */
export function resetAIProvider(): void {
  _instance = null;
}
