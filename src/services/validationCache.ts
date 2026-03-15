/**
 * Validation Cache Module
 * 
 * Performance optimization: LRU cache for Zod validation results
 * Reduces O(N×V) per-frame validation to amortized O(1)
 */

import { validateNode as zodValidate } from './schemas';

// Simplified type that stores normalized results
interface ValidationResult {
    success: boolean;
    data: any;
    error: any;
}

const CACHE_SIZE = 512;
const cache = new Map<number, ValidationResult>();


/**
 * cyrb53 - Fast non-cryptographic hash function
 * Suitable for string keys in LRU cache
 */
function cyrb53(str: string, seed = 0): number {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Cached validation with LRU eviction
 * 
 * @param node - UI node to validate
 * @returns Cached or freshly computed validation result
 */
export function cachedValidateNode(node: any): ValidationResult {
    // Compute hash key from node content
    const nodeStr = JSON.stringify(node);
    const key = cyrb53(nodeStr);

    // Cache hit - return immediately
    if (cache.has(key)) {
        return cache.get(key)!;
    }

    // Cache miss - validate and store
    // LRU eviction: remove oldest entry if at capacity
    if (cache.size >= CACHE_SIZE) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) {
            cache.delete(oldest);
        }
    }

    const zodResult = zodValidate(node);
    const result: ValidationResult = {
        success: zodResult.success,
        data: zodResult.success ? zodResult.data : null,
        error: zodResult.success ? null : zodResult.error
    };
    cache.set(key, result);
    return result;
}

/**
 * Clear the validation cache
 * Call when schema changes or for testing
 */
export function clearValidationCache(): void {
    cache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getValidationCacheStats(): { size: number; maxSize: number } {
    return { size: cache.size, maxSize: CACHE_SIZE };
}
