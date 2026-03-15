/**
 * Logger Service Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, logger, renderLogger, actionLogger } from '@/services/logger';

describe('Logger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    group: ReturnType<typeof vi.spyOn>;
    groupCollapsed: ReturnType<typeof vi.spyOn>;
    groupEnd: ReturnType<typeof vi.spyOn>;
    table: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      group: vi.spyOn(console, 'group').mockImplementation(() => {}),
      groupCollapsed: vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
      table: vi.spyOn(console, 'table').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('log levels', () => {
    it('should log info messages', () => {
      const testLogger = new Logger({ enabled: true, level: 'INFO' });
      testLogger.info('Test', 'Hello World');

      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      const testLogger = new Logger({ enabled: true, level: 'WARN' });
      testLogger.warn('Test', 'Warning message');

      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const testLogger = new Logger({ enabled: true, level: 'ERROR' });
      testLogger.error('Test', 'Error message');

      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should not log below configured level', () => {
      const testLogger = new Logger({ enabled: true, level: 'WARN' });
      testLogger.info('Test', 'Info message');
      testLogger.debug('Test', 'Debug message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should log error with Error object', () => {
      const testLogger = new Logger({ enabled: true, level: 'ERROR' });
      const error = new Error('Test error');
      testLogger.error('Test', 'Error occurred', error);

      expect(consoleSpy.error).toHaveBeenCalledTimes(2);
    });
  });

  describe('enable/disable', () => {
    it('should not log when disabled', () => {
      const testLogger = new Logger({ enabled: false });
      testLogger.info('Test', 'Message');
      testLogger.warn('Test', 'Message');
      testLogger.error('Test', 'Message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should allow enabling/disabling at runtime', () => {
      const testLogger = new Logger({ enabled: true, level: 'INFO' });

      testLogger.info('Test', 'Before disable');
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);

      testLogger.disable();
      testLogger.info('Test', 'While disabled');
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);

      testLogger.enable();
      testLogger.info('Test', 'After enable');
      expect(consoleSpy.log).toHaveBeenCalledTimes(2);
    });
  });

  describe('child loggers', () => {
    it('should create child logger with prefix', () => {
      const parent = new Logger({ enabled: true, level: 'INFO', prefix: 'Parent' });
      const child = parent.child('Child');

      child.info('Context', 'Message');

      expect(consoleSpy.log).toHaveBeenCalled();
      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).toContain('Parent:Child');
    });
  });

  describe('timers', () => {
    it('should track timing', () => {
      const testLogger = new Logger({ enabled: true, level: 'DEBUG' });

      testLogger.time('test-timer');
      const duration = testLogger.timeEnd('test-timer');

      expect(duration).toBeGreaterThanOrEqual(0);
      expect(typeof duration).toBe('number');
    });

    it('should return null for non-existent timer', () => {
      const testLogger = new Logger({ enabled: true, level: 'DEBUG' });
      const duration = testLogger.timeEnd('non-existent');

      expect(duration).toBeNull();
    });
  });

  describe('grouping', () => {
    it('should support log grouping', () => {
      const testLogger = new Logger({ enabled: true });

      testLogger.group('Test Group', true);
      testLogger.groupEnd();

      expect(consoleSpy.groupCollapsed).toHaveBeenCalledWith('Test Group');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    it('should support expanded groups', () => {
      const testLogger = new Logger({ enabled: true });

      testLogger.group('Test Group', false);
      testLogger.groupEnd();

      expect(consoleSpy.group).toHaveBeenCalledWith('Test Group');
    });
  });

  describe('table', () => {
    it('should log table data', () => {
      const testLogger = new Logger({ enabled: true });
      const data = [{ a: 1 }, { a: 2 }];

      testLogger.table(data);

      expect(consoleSpy.table).toHaveBeenCalledWith(data);
    });
  });

  describe('setLevel', () => {
    it('should allow changing log level at runtime', () => {
      const testLogger = new Logger({ enabled: true, level: 'ERROR' });

      testLogger.info('Test', 'Should not log');
      expect(consoleSpy.log).not.toHaveBeenCalled();

      testLogger.setLevel('INFO');
      testLogger.info('Test', 'Should log now');
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });

  describe('exported instances', () => {
    it('should export default logger', () => {
      expect(logger).toBeDefined();
    });

    it('should export specialized loggers', () => {
      expect(renderLogger).toBeDefined();
      expect(actionLogger).toBeDefined();
    });
  });
});
