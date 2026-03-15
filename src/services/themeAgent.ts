
import { GoogleGenAI } from "@google/genai";
import { ModelConfig } from "@/types/settings";
import { ThemeType } from "@/components/ui/theme";

const SYSTEM_PROMPT = `
You are an expert UI Designer specializing in Tailwind CSS.
Your task is to generate a JSON Theme Object based on a user's mood or request.

OUTPUT SCHEMA (Must match exactly):
{
  "typography": { "variants": { ... }, "colors": { ... }, "fonts": { ... } },
  "button": { "base": "...", "variants": { ... } },
  "container": { "base": "...", "backgrounds": { ... } },
  "card": { "base": "...", "variants": { ... } },
  // ... Include all keys from the standard theme
}

RULES:
1. Use Tailwind CSS utility classes.
2. Ensure high contrast and accessibility.
3. Be creative with gradients, shadows, and borders for "variants".
4. Return RAW JSON only.
`;

export async function generateTheme(userInput: string, config: ModelConfig): Promise<Partial<ThemeType>> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing from environment");
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: config.model || 'gemini-3-flash-preview',
      contents: `Generate a UI theme for: "${userInput}". Make it distinct and visually stunning.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from theme agent");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Theme Generation Failed:", error);
    throw error;
  }
}
