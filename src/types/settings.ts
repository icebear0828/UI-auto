
export interface ModelConfig {
  model: string;
  soundEnabled: boolean; // NEW
}

export const DEFAULT_CONFIG: ModelConfig = {
  model: "gemini-3-flash-preview",
  soundEnabled: true
};
