const errMsg = (e: unknown): string => e instanceof Error ? e.message : String(e);

export function safeJsonParse<T>(text: string, context: string): T {
  try {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();
    return JSON.parse(cleaned);
  } catch (parseError: unknown) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // fall through
      }
    }
    throw new Error(`Failed to parse JSON in ${context}: ${errMsg(parseError)}`);
  }
}

export { errMsg };
