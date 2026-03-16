import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Must mock the image module BEFORE importing imageFactory
vi.mock('@/services/image', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/image')>();
  return {
    ...actual,
    getImageProvider: vi.fn(),
  };
});

import { resolveImage } from '@/services/imageFactory';
import { getImageProvider } from '@/services/image';
import type { ImageAsset } from '@/types';

const mockedGetImageProvider = vi.mocked(getImageProvider);

function makeProvider(generateFn: (prompt: string, style?: string) => Promise<string>) {
  return { name: 'mock', generate: vi.fn(generateFn) };
}

describe('resolveImage', () => {
  beforeEach(() => {
    // Clear the module-level assetCache by re-importing would be complex,
    // so we use unique values per test to avoid cache hits
    mockedGetImageProvider.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return empty string for falsy asset', async () => {
    const result = await resolveImage(null as unknown as ImageAsset);
    expect(result).toBe('');
  });

  it('should pass-through full HTTP URLs directly', async () => {
    const provider = makeProvider(async () => 'should-not-be-called');
    mockedGetImageProvider.mockReturnValue(provider);

    const result = await resolveImage({
      source: 'EXTERNAL_URL',
      value: 'https://example.com/img.png',
    });

    expect(result).toBe('https://example.com/img.png');
    expect(provider.generate).not.toHaveBeenCalled();
  });

  it('should pass-through HTTPS URLs', async () => {
    const provider = makeProvider(async () => 'unused');
    mockedGetImageProvider.mockReturnValue(provider);

    const result = await resolveImage({
      source: 'EXTERNAL_URL',
      value: 'http://localhost:8080/image.jpg',
    });

    expect(result).toBe('http://localhost:8080/image.jpg');
  });

  it('should delegate prompt-based assets to image provider', async () => {
    const provider = makeProvider(async (prompt, style) =>
      `https://gen.ai/${encodeURIComponent(style ? `${style}-${prompt}` : prompt)}`
    );
    mockedGetImageProvider.mockReturnValue(provider);

    const result = await resolveImage({
      source: 'GENERATED',
      value: 'a-unique-forest-scene',
      style: 'WATERCOLOR',
    });

    expect(provider.generate).toHaveBeenCalledWith('a-unique-forest-scene', 'WATERCOLOR');
    expect(result).toContain('WATERCOLOR');
  });

  it('should fallback to Pollinations when provider throws', async () => {
    const provider = makeProvider(async () => { throw new Error('GPU OOM'); });
    mockedGetImageProvider.mockReturnValue(provider);

    const result = await resolveImage({
      source: 'GENERATED',
      value: 'unique-fallback-test-scene',
    });

    expect(result).toBe(
      'https://image.pollinations.ai/prompt/unique-fallback-test-scene?nologo=true'
    );
  });

  it('should fallback with style when provider throws', async () => {
    const provider = makeProvider(async () => { throw new Error('fail'); });
    mockedGetImageProvider.mockReturnValue(provider);

    const result = await resolveImage({
      source: 'GENERATED',
      value: 'unique-styled-fallback-test',
      style: 'PIXEL_ART',
    });

    expect(result).toBe(
      'https://image.pollinations.ai/prompt/PIXEL_ART%20style%20unique-styled-fallback-test?nologo=true'
    );
  });

  it('should cache results for identical assets', async () => {
    const provider = makeProvider(async () => 'https://gen.ai/cached-test-result');
    mockedGetImageProvider.mockReturnValue(provider);

    const asset: ImageAsset = { source: 'GENERATED', value: 'cache-test-unique-id' };

    const first = await resolveImage(asset);
    const second = await resolveImage(asset);

    expect(first).toBe(second);
    expect(provider.generate).toHaveBeenCalledTimes(1);
  });
});
