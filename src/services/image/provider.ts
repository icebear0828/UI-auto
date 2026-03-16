import type { IImageProvider } from './IImageProvider';
import type { ImageProviderConfig } from '@/types/settings';
import { PollinationsProvider } from './PollinationsProvider';
import { OpenAICompatProvider } from './OpenAICompatProvider';

let _config: ImageProviderConfig | null = null;
let _instance: IImageProvider | null = null;
let _cacheKey = '';

function buildCacheKey(config: ImageProviderConfig): string {
  return `${config.baseUrl}:${config.apiKey}:${config.model}`;
}

export function setImageConfig(config: ImageProviderConfig): void {
  const key = buildCacheKey(config);
  if (key !== _cacheKey) {
    _instance = null;
    _cacheKey = key;
  }
  _config = config;
}

export function getImageProvider(): IImageProvider {
  if (!_instance) {
    if (_config?.baseUrl) {
      _instance = new OpenAICompatProvider(_config);
    } else {
      _instance = new PollinationsProvider();
    }
  }
  return _instance;
}

export function resetImageProvider(): void {
  _instance = null;
  _config = null;
  _cacheKey = '';
}
