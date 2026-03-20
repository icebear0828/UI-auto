export interface ToolResult {
  [key: string]: unknown;
  error?: boolean;
  message?: string;
  isMock?: boolean;
  mockReason?: string;
}

export type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;
