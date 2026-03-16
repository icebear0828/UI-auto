import type { IImageProvider } from './IImageProvider';

export class PollinationsProvider implements IImageProvider {
  readonly name = 'Pollinations';

  async generate(prompt: string, style?: string): Promise<string> {
    const fullPrompt = style ? `${style} style ${prompt}` : prompt;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?nologo=true`;
  }
}
