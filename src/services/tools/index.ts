/**
 * Tool Service
 * Registry-based tool execution for AI tool calls.
 */

import { serviceLogger } from '@/services/logger';
import { getTool, getAvailableToolNames } from './registry';
import type { ToolResult } from './types';

// Import all tool modules to trigger self-registration
import './weather';
import './crypto';
import './business';
import './utilities';

export const executeTool = async (name: string, args: Record<string, unknown>): Promise<ToolResult> => {
  serviceLogger.debug('ToolService', `Executing ${name}`, args);

  try {
    const handler = getTool(name);
    if (!handler) {
      return {
        error: true,
        message: `Tool '${name}' not found. Available tools: ${getAvailableToolNames().join(', ')}.`
      };
    }
    return await handler(args);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    serviceLogger.error('ToolService', `Error executing ${name}: ${message}`);
    return {
      error: true,
      message: `Failed to execute tool '${name}': ${message}`
    };
  }
};
