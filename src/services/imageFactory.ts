import { ImageAsset } from "@/types";
import { getImageProvider } from "./image";
import { PollinationsProvider } from "./image";

const assetCache = new Map<string, string>();
const pollinationsFallback = new PollinationsProvider();

export async function resolveImage(asset: ImageAsset): Promise<string> {
  if (!asset) return "";

  const cacheKey = `${asset.source}:${asset.value}:${asset.style || 'default'}`;
  if (assetCache.has(cacheKey)) {
    return assetCache.get(cacheKey)!;
  }

  try {
    let result = "";

    // If value is already a full URL, use it directly
    if (asset.value.startsWith('http://') || asset.value.startsWith('https://')) {
      result = asset.value;
    } else {
      // Delegate to the active image provider
      result = await getImageProvider().generate(asset.value, asset.style);
    }

    if (result) {
      assetCache.set(cacheKey, result);
    }
    return result;

  } catch (error) {
    console.error("Image provider failed, falling back to Pollinations:", error);
    try {
      const fallback = await pollinationsFallback.generate(asset.value, asset.style);
      assetCache.set(cacheKey, fallback);
      return fallback;
    } catch {
      return `https://via.placeholder.com/800x600?text=Image+Gen+Error`;
    }
  }
}
