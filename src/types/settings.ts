export type ProviderType = 'gemini' | 'openai' | 'anthropic';

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
}

export interface ImageProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ModelConfig {
  provider: ProviderType;
  model: string;
  soundEnabled: boolean;
  providers: Record<ProviderType, ProviderConfig>;
  imageProvider: ImageProviderConfig;
}

export const DEFAULT_MODELS: Record<ProviderType, string> = {
  gemini: 'gemini-3-flash-preview',
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
};

export const DEFAULT_CONFIG: ModelConfig = {
  provider: 'openai',
  model: 'gpt5.2-fast',
  soundEnabled: true,
  providers: {
    gemini: { apiKey: '', baseUrl: '' },
    openai: { apiKey: 'pwd', baseUrl: 'http://192.168.10.6:8080/v1' },
    anthropic: { apiKey: '', baseUrl: '' },
  },
  imageProvider: { baseUrl: '', apiKey: '', model: '' },
};

export function getEffectiveApiKey(config: ModelConfig): string {
  const providerConf = config.providers[config.provider];
  if (providerConf.apiKey) return providerConf.apiKey;
  switch (config.provider) {
    case 'gemini': return process.env.GEMINI_API_KEY ?? '';
    case 'openai': return process.env.OPENAI_API_KEY ?? '';
    case 'anthropic': return process.env.ANTHROPIC_API_KEY ?? '';
  }
}
