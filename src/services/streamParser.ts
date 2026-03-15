/**
 * Best-Effort Partial JSON Parser
 * 
 * This module attempts to fix incomplete JSON strings coming from an LLM stream
 * so they can be parsed by JSON.parse().
 * 
 * It tracks open braces/brackets and quotes to determine what is needed to close the structure.
 */

export function parsePartialJson(jsonString: string): any {
  // If empty, return null
  if (!jsonString.trim()) return null;

  try {
    // 1. Try parsing as-is (optimistic)
    return JSON.parse(jsonString);
  } catch (e) {
    // 2. If that fails, try to repair it
    const fixed = fixJson(jsonString);
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      // If still fails, return null or last valid state (not handled here, handled by caller)
      return null;
    }
  }
}

function fixJson(str: string): string {
  const stack: string[] = [];
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        stack.push('}');
      } else if (char === '[') {
        stack.push(']');
      } else if (char === '}') {
        if (stack[stack.length - 1] === '}') stack.pop();
      } else if (char === ']') {
        if (stack[stack.length - 1] === ']') stack.pop();
      }
    }
  }

  // Close any open string
  let result = str;
  if (inString) {
    result += '"';
  }

  // Close any open structures in reverse order
  while (stack.length > 0) {
    result += stack.pop();
  }

  return result;
}