import type { ToolHandler } from './types';

const tools = new Map<string, ToolHandler>();

export function registerTool(name: string, handler: ToolHandler): void {
  tools.set(name, handler);
}

export function getTool(name: string): ToolHandler | undefined {
  return tools.get(name);
}

export function getAvailableToolNames(): string[] {
  return Array.from(tools.keys());
}
