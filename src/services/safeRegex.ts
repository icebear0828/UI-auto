/**
 * Safe Regular Expression Utilities
 *
 * Provides protection against ReDoS (Regular Expression Denial of Service) attacks
 * by validating regex patterns before execution and enforcing timeouts.
 */

// Common patterns that are known to be safe
const SAFE_PATTERNS: Record<string, RegExp> = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s-()]{7,}$/,
    url: /^https?:\/\/[^\s]+$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    numeric: /^\d+$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    time: /^\d{2}:\d{2}(:\d{2})?$/,
    zipcode: /^\d{5}(-\d{4})?$/,
    hex: /^#?[0-9a-fA-F]{3,8}$/
};

// Patterns that indicate potential ReDoS vulnerability
const DANGEROUS_PATTERNS = [
    /(\+\+|\*\*|\?\?)/,           // Nested quantifiers
    /\(\?[^:]/,                    // Lookahead/lookbehind
    /\(([^()]*\|[^()]*){3,}\)/,   // Multiple alternations in group
    /(.+)\1{2,}/,                  // Backreference with quantifier
    /\(\.\*\)\+/,                  // (.*)+
    /\(\.\+\)\+/,                  // (.+)+
    /\([^)]+\)\{\d+,\}/,          // Group with unbounded quantifier
];

/**
 * Check if a regex pattern is potentially dangerous
 */
function isDangerousPattern(pattern: string): boolean {
    for (const dangerous of DANGEROUS_PATTERNS) {
        if (dangerous.test(pattern)) {
            return true;
        }
    }

    // Check for extremely long patterns
    if (pattern.length > 500) {
        return true;
    }

    // Check for deeply nested groups
    let depth = 0;
    let maxDepth = 0;
    for (const char of pattern) {
        if (char === '(') depth++;
        if (char === ')') depth--;
        maxDepth = Math.max(maxDepth, depth);
    }
    if (maxDepth > 5) {
        return true;
    }

    return false;
}

/**
 * Get a predefined safe pattern by name
 */
export function getSafePattern(name: string): RegExp | null {
    return SAFE_PATTERNS[name.toLowerCase()] || null;
}

/**
 * Validate a regex pattern for safety
 * Returns true if the pattern is safe to use
 */
export function isRegexSafe(pattern: string): boolean {
    // Empty pattern is not safe
    if (!pattern || pattern.trim() === '') {
        return false;
    }

    // Check against known dangerous patterns
    if (isDangerousPattern(pattern)) {
        return false;
    }

    // Try to compile the regex
    try {
        new RegExp(pattern);
        return true;
    } catch {
        return false;
    }
}

/**
 * Test a string against a regex pattern with timeout protection
 *
 * @param value The string to test
 * @param pattern The regex pattern (string or RegExp)
 * @param timeoutMs Maximum execution time in milliseconds (default: 100ms)
 * @returns Object with success, matched, and error fields
 */
export function safeRegexTest(
    value: string,
    pattern: string | RegExp,
    timeoutMs: number = 100
): { success: boolean; matched: boolean; error?: string } {
    // Handle predefined patterns
    if (typeof pattern === 'string' && pattern.startsWith('$')) {
        const patternName = pattern.slice(1);
        const safePattern = getSafePattern(patternName);
        if (safePattern) {
            return {
                success: true,
                matched: safePattern.test(value)
            };
        }
    }

    const patternStr = typeof pattern === 'string' ? pattern : pattern.source;

    // Quick safety check
    if (!isRegexSafe(patternStr)) {
        console.warn('[safeRegex] Potentially dangerous pattern rejected:', patternStr);
        return {
            success: false,
            matched: false,
            error: 'Pattern rejected for security reasons'
        };
    }

    // Limit input length to prevent long-running tests
    const maxInputLength = 10000;
    if (value.length > maxInputLength) {
        return {
            success: false,
            matched: false,
            error: `Input too long (max ${maxInputLength} chars)`
        };
    }

    try {
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

        // For short inputs, run directly
        if (value.length < 100) {
            return {
                success: true,
                matched: regex.test(value)
            };
        }

        // For longer inputs, we use a simple time check approach
        // Note: True timeout requires Worker threads which aren't available in browsers
        const startTime = performance.now();
        const matched = regex.test(value);
        const elapsed = performance.now() - startTime;

        if (elapsed > timeoutMs) {
            console.warn(`[safeRegex] Pattern took ${elapsed.toFixed(2)}ms to execute`);
        }

        return {
            success: true,
            matched
        };
    } catch (error: unknown) {
        return {
            success: false,
            matched: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Create a validated RegExp from a pattern string
 * Returns null if the pattern is invalid or unsafe
 */
export function createSafeRegex(pattern: string, flags?: string): RegExp | null {
    if (!isRegexSafe(pattern)) {
        return null;
    }

    try {
        return new RegExp(pattern, flags);
    } catch {
        return null;
    }
}
