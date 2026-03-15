
import { ImageAsset } from "@/types";
import { getAIProvider } from "./ai";

// Simple in-memory cache to prevent re-generating consistent assets (e.g. character sprites)
const assetCache = new Map<string, string>();

/**
 * Resolves an ImageAsset to a usable URL or Data URI.
 * Implements the Hybrid Pipeline:
 * 1. GENERATED -> Gemini 3 Pro (High Quality, Slower)
 * 2. EXTERNAL_URL -> Pollinations.ai (Fast, Free)
 */
export async function resolveImage(asset: ImageAsset): Promise<string> {
  if (!asset) return "";

  // 1. Check Cache
  const cacheKey = `${asset.source}:${asset.value}:${asset.style || 'default'}`;
  if (assetCache.has(cacheKey)) {
    return assetCache.get(cacheKey)!;
  }

  try {
    let result = "";

    if (asset.source === 'GENERATED') {
      // Gemini Strategy
      const provider = getAIProvider();
      result = provider.generateImage ? await provider.generateImage(asset.value, asset.style) : "";
    } 
    
    // If generation failed or source is EXTERNAL_URL
    if (!result) {
      // Pollinations Strategy (Default/Fallback/External)
      // Handles 'EXTERNAL_URL' and acts as fallback for any unspecified source
      const prompt = asset.style ? `${asset.style} style ${asset.value}` : asset.value;
      const encodedPrompt = encodeURIComponent(prompt);
      result = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true`;
    }

    // Cache the result
    if (result) {
        assetCache.set(cacheKey, result);
    }
    return result;

  } catch (error) {
    console.error("Failed to resolve image asset:", error);
    // Fallback to a placeholder on error to prevent UI crash
    return `https://via.placeholder.com/800x600?text=Image+Gen+Error`;
  }
}
