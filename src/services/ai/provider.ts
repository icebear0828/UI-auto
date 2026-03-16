import type { IAIProvider } from './IAIProvider';
import type { ModelConfig } from '@/types/settings';
import { getEffectiveApiKey } from '@/types/settings';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';

let _config: ModelConfig | null = null;
let _instance: IAIProvider | null = null;
let _cacheKey = '';

function buildCacheKey(config: ModelConfig): string {
  const apiKey = getEffectiveApiKey(config);
  const baseUrl = config.providers[config.provider].baseUrl;
  return `${config.provider}:${apiKey}:${baseUrl}`;
}

export function setActiveConfig(config: ModelConfig): void {
  const key = buildCacheKey(config);
  if (key !== _cacheKey) {
    _instance = null;
    _cacheKey = key;
  }
  _config = config;
}

export function getAIProvider(): IAIProvider {
  if (!_config) {
    throw new Error('AI provider not configured. Call setActiveConfig() first.');
  }
  if (!_instance) {
    const apiKey = getEffectiveApiKey(_config);
    if (!apiKey) {
      throw new Error(`API key not configured for provider: ${_config.provider}`);
    }
    const baseUrl = _config.providers[_config.provider].baseUrl || undefined;
    switch (_config.provider) {
      case 'gemini':
        _instance = new GeminiProvider(apiKey, baseUrl);
        break;
      case 'openai':
        _instance = new OpenAIProvider(apiKey, baseUrl);
        break;
      case 'anthropic':
        _instance = new AnthropicProvider(apiKey, baseUrl);
        break;
    }
  }
  return _instance;
}

export function resetAIProvider(): void {
  _instance = null;
  _config = null;
  _cacheKey = '';
}
