import type { IImageProvider } from './IImageProvider';
import type { ImageProviderConfig } from '@/types/settings';

interface ImageResponse {
  data: Array<{ url?: string; b64_json?: string }>;
}

export class OpenAICompatProvider implements IImageProvider {
  readonly name = 'OpenAI-Compatible';
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor(config: ImageProviderConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  async generate(prompt: string, style?: string): Promise<string> {
    const fullPrompt = style ? `${style} style. ${prompt}` : prompt;

    const res = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        model: this.model || undefined,
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      }),
    });

    if (!res.ok) {
      throw new Error(`Image generation failed: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as ImageResponse;
    const item = json.data?.[0];
    if (item?.url) return item.url;
    if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
    throw new Error('No image data in response');
  }
}
