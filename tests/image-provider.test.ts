import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PollinationsProvider } from '@/services/image/PollinationsProvider';
import { OpenAICompatProvider } from '@/services/image/OpenAICompatProvider';
import { getImageProvider, setImageConfig, resetImageProvider } from '@/services/image/provider';

// ============================================================
// PollinationsProvider
// ============================================================

describe('PollinationsProvider', () => {
  const provider = new PollinationsProvider();

  it('should have name "Pollinations"', () => {
    expect(provider.name).toBe('Pollinations');
  });

  it('should generate a Pollinations URL from a prompt', async () => {
    const url = await provider.generate('a cute cat');
    expect(url).toBe(
      'https://image.pollinations.ai/prompt/a%20cute%20cat?nologo=true'
    );
  });

  it('should prepend style to the prompt', async () => {
    const url = await provider.generate('a forest', 'ANIME_WATERCOLOR');
    expect(url).toBe(
      'https://image.pollinations.ai/prompt/ANIME_WATERCOLOR%20style%20a%20forest?nologo=true'
    );
  });

  it('should encode special characters in prompt', async () => {
    const url = await provider.generate('café & bar');
    expect(url).toContain('caf%C3%A9%20%26%20bar');
  });

  it('should handle empty style as no prefix', async () => {
    const url = await provider.generate('sunset', undefined);
    expect(url).toBe(
      'https://image.pollinations.ai/prompt/sunset?nologo=true'
    );
  });
});

// ============================================================
// OpenAICompatProvider
// ============================================================

describe('OpenAICompatProvider', () => {
  const mockConfig = {
    baseUrl: 'http://localhost:7860/v1',
    apiKey: 'test-key',
    model: 'flux-schnell',
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have name "OpenAI-Compatible"', () => {
    const provider = new OpenAICompatProvider(mockConfig);
    expect(provider.name).toBe('OpenAI-Compatible');
  });

  it('should POST to /images/generations with correct body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ url: 'https://example.com/img.png' }] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const provider = new OpenAICompatProvider(mockConfig);
    const result = await provider.generate('a cat');

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe('http://localhost:7860/v1/images/generations');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Authorization']).toBe('Bearer test-key');

    const body = JSON.parse(opts.body);
    expect(body.prompt).toBe('a cat');
    expect(body.model).toBe('flux-schnell');
    expect(body.n).toBe(1);

    expect(result).toBe('https://example.com/img.png');
  });

  it('should prepend style to prompt', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ url: 'https://example.com/img.png' }] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const provider = new OpenAICompatProvider(mockConfig);
    await provider.generate('a cat', 'PIXEL_ART');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.prompt).toBe('PIXEL_ART style. a cat');
  });

  it('should strip trailing slashes from baseUrl', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ url: 'https://example.com/img.png' }] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const provider = new OpenAICompatProvider({ ...mockConfig, baseUrl: 'http://localhost:7860/v1/' });
    await provider.generate('test');

    expect(mockFetch.mock.calls[0][0]).toBe('http://localhost:7860/v1/images/generations');
  });

  it('should omit Authorization header when apiKey is empty', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ url: 'https://example.com/img.png' }] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const provider = new OpenAICompatProvider({ ...mockConfig, apiKey: '' });
    await provider.generate('test');

    expect(mockFetch.mock.calls[0][1].headers['Authorization']).toBeUndefined();
  });

  it('should handle b64_json response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ b64_json: 'abc123==' }] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const provider = new OpenAICompatProvider(mockConfig);
    const result = await provider.generate('test');

    expect(result).toBe('data:image/png;base64,abc123==');
  });

  it('should throw on non-ok response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
    vi.stubGlobal('fetch', mockFetch);

    const provider = new OpenAICompatProvider(mockConfig);
    await expect(provider.generate('test')).rejects.toThrow('Image generation failed: 500 Internal Server Error');
  });

  it('should throw when response has no image data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{}] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const provider = new OpenAICompatProvider(mockConfig);
    await expect(provider.generate('test')).rejects.toThrow('No image data in response');
  });
});

// ============================================================
// Provider factory (getImageProvider / setImageConfig)
// ============================================================

describe('Image provider factory', () => {
  beforeEach(() => {
    resetImageProvider();
  });

  it('should return PollinationsProvider by default (no config)', () => {
    const provider = getImageProvider();
    expect(provider.name).toBe('Pollinations');
  });

  it('should return PollinationsProvider when baseUrl is empty', () => {
    setImageConfig({ baseUrl: '', apiKey: '', model: '' });
    const provider = getImageProvider();
    expect(provider.name).toBe('Pollinations');
  });

  it('should return OpenAICompatProvider when baseUrl is set', () => {
    setImageConfig({ baseUrl: 'http://localhost:7860/v1', apiKey: '', model: '' });
    const provider = getImageProvider();
    expect(provider.name).toBe('OpenAI-Compatible');
  });

  it('should cache provider instance', () => {
    setImageConfig({ baseUrl: 'http://localhost:7860/v1', apiKey: '', model: '' });
    const a = getImageProvider();
    const b = getImageProvider();
    expect(a).toBe(b);
  });

  it('should invalidate cache when config changes', () => {
    setImageConfig({ baseUrl: 'http://localhost:7860/v1', apiKey: '', model: '' });
    const a = getImageProvider();
    setImageConfig({ baseUrl: 'http://localhost:8080/v1', apiKey: '', model: '' });
    const b = getImageProvider();
    expect(a).not.toBe(b);
  });

  it('should NOT invalidate cache when same config is set again', () => {
    setImageConfig({ baseUrl: 'http://localhost:7860/v1', apiKey: 'key', model: 'flux' });
    const a = getImageProvider();
    setImageConfig({ baseUrl: 'http://localhost:7860/v1', apiKey: 'key', model: 'flux' });
    const b = getImageProvider();
    expect(a).toBe(b);
  });

  it('should switch back to Pollinations when baseUrl is cleared', () => {
    setImageConfig({ baseUrl: 'http://localhost:7860/v1', apiKey: '', model: '' });
    expect(getImageProvider().name).toBe('OpenAI-Compatible');

    setImageConfig({ baseUrl: '', apiKey: '', model: '' });
    expect(getImageProvider().name).toBe('Pollinations');
  });

  it('resetImageProvider should clear everything', () => {
    setImageConfig({ baseUrl: 'http://localhost:7860/v1', apiKey: '', model: '' });
    const a = getImageProvider();
    expect(a.name).toBe('OpenAI-Compatible');

    resetImageProvider();
    const b = getImageProvider();
    expect(b.name).toBe('Pollinations');
    expect(a).not.toBe(b);
  });
});
