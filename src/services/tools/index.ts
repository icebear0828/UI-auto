/**
 * Tool Service
 * Registry-based tool execution for AI tool calls.
 */

import { serviceLogger } from '@/services/logger';
import { getTool, getAvailableToolNames } from './registry';

// Import all tool modules to trigger self-registration
import './weather';
import './crypto';
import './business';
import './utilities';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- args and return are dynamic from AI tool calls
export const executeTool = async (name: string, args: any): Promise<any> => {
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
