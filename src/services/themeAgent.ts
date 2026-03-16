import { ModelConfig } from "@/types/settings";
import { ThemeType } from "@/components/ui/theme";
import { getAIProvider } from "./ai";
import { UINode } from "@/types";

export async function generateTheme(userInput: string, config: ModelConfig): Promise<Partial<ThemeType>> {
  const themePrompt = `You are an expert UI Designer specializing in Tailwind CSS.
Generate a JSON Theme Object for: "${userInput}". Make it distinct and visually stunning.

OUTPUT SCHEMA (Must match exactly):
{
  "typography": { "variants": { ... }, "colors": { ... }, "fonts": { ... } },
  "button": { "base": "...", "variants": { ... } },
  "container": { "base": "...", "backgrounds": { ... } },
  "card": { "base": "...", "variants": { ... } }
}

RULES:
1. Use Tailwind CSS utility classes.
2. Ensure high contrast and accessibility.
3. Be creative with gradients, shadows, and borders.
4. Return RAW JSON only.`;

  const result = await getAIProvider().refine({
    prompt: themePrompt,
    currentNode: {} as UINode,
    modelConfig: config,
  });

  return result as unknown as Partial<ThemeType>;
}
