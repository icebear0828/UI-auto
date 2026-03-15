/**
 * Unified Logger Service
 *
 * Provides structured logging with:
 * - Log levels (DEBUG, INFO, WARN, ERROR)
 * - Production mode suppression
 * - Contextual prefixes
 * - Performance timing
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  prefix: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const LOG_STYLES: Record<LogLevel, string> = {
  DEBUG: 'color: #6b7280; font-weight: normal;',
  INFO: 'color: #3b82f6; font-weight: bold;',
  WARN: 'color: #f59e0b; font-weight: bold;',
  ERROR: 'color: #ef4444; font-weight: bold; background: #fee2e2; padding: 2px 4px;',
};

class Logger {
  private config: LoggerConfig;
  private timers: Map<string, number> = new Map();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level || 'INFO',
      enabled: config.enabled ?? (process.env.NODE_ENV !== 'production'),
      prefix: config.prefix || '',
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatMessage(level: LogLevel, context: string, message: string): string {
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    const ctx = context ? `[${context}]` : '';
    return `${prefix}${ctx} ${message}`;
  }

  debug(context: string, message: string, ...args: unknown[]): void {
    if (!this.shouldLog('DEBUG')) return;
    console.log(`%c${this.formatMessage('DEBUG', context, message)}`, LOG_STYLES.DEBUG, ...args);
  }

  info(context: string, message: string, ...args: unknown[]): void {
    if (!this.shouldLog('INFO')) return;
    console.log(`%c${this.formatMessage('INFO', context, message)}`, LOG_STYLES.INFO, ...args);
  }

  warn(context: string, message: string, ...args: unknown[]): void {
    if (!this.shouldLog('WARN')) return;
    console.warn(`%c${this.formatMessage('WARN', context, message)}`, LOG_STYLES.WARN, ...args);
  }

  error(context: string, message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (!this.shouldLog('ERROR')) return;
    console.error(`%c${this.formatMessage('ERROR', context, message)}`, LOG_STYLES.ERROR, ...args);
    if (error) {
      console.error(error);
    }
  }

  /**
   * Start a performance timer
   */
  time(label: string): void {
    if (!this.config.enabled) return;
    this.timers.set(label, performance.now());
  }

  /**
   * End a performance timer and log the duration
   */
  timeEnd(label: string): number | null {
    if (!this.config.enabled) return null;

    const startTime = this.timers.get(label);
    if (!startTime) {
      this.warn('Logger', `Timer "${label}" does not exist`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);
    this.debug('Timer', `${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Create a child logger with a specific context prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix,
    });
  }

  /**
   * Temporarily disable logging (useful for tests)
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * Enable logging
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Group related logs together
   */
  group(label: string, collapsed: boolean = true): void {
    if (!this.config.enabled) return;
    if (collapsed) {
      console.groupCollapsed(label);
    } else {
      console.group(label);
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (!this.config.enabled) return;
    console.groupEnd();
  }

  /**
   * Log a table of data
   */
  table(data: unknown): void {
    if (!this.config.enabled) return;
    console.table(data);
  }
}

// Default logger instance
export const logger = new Logger({ prefix: 'GenUI' });

// Create specialized loggers for different modules
export const renderLogger = logger.child('Render');
export const actionLogger = logger.child('Action');
export const serviceLogger = logger.child('Service');
export const validationLogger = logger.child('Validation');

// Export the Logger class for custom instances
export { Logger };
export type { LogLevel, LoggerConfig };
