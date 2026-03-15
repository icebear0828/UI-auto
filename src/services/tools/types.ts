// eslint-disable-next-line @typescript-eslint/no-explicit-any -- args and return are dynamic from AI tool calls
export type ToolHandler = (args: any) => Promise<any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolResult = any;
