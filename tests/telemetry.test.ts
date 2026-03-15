/**
 * Telemetry Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { telemetry } from '@/services/telemetry';

describe('TelemetryService', () => {
  beforeEach(() => {
    // Clear all traces before each test
    telemetry.clearAllTraces();
  });

  afterEach(() => {
    telemetry.clearAllTraces();
  });

  describe('startTrace', () => {
    it('should create a unique trace ID', () => {
      const traceId1 = telemetry.startTrace('test-action');
      const traceId2 = telemetry.startTrace('test-action');

      expect(traceId1).not.toBe(traceId2);
      expect(traceId1).toMatch(/^trace_\d+_[a-z0-9]+$/);
    });

    it('should increment trace count', () => {
      expect(telemetry.getTraceCount()).toBe(0);

      telemetry.startTrace('action1');
      expect(telemetry.getTraceCount()).toBe(1);

      telemetry.startTrace('action2');
      expect(telemetry.getTraceCount()).toBe(2);
    });
  });

  describe('endTrace', () => {
    it('should remove trace from active traces', () => {
      const traceId = telemetry.startTrace('test-action');
      expect(telemetry.getTraceCount()).toBe(1);

      telemetry.endTrace(traceId);
      expect(telemetry.getTraceCount()).toBe(0);
    });

    it('should handle non-existent trace gracefully', () => {
      expect(() => {
        telemetry.endTrace('non-existent-trace-id');
      }).not.toThrow();
    });
  });

  describe('getStartTime', () => {
    it('should return start time for active trace', () => {
      const traceId = telemetry.startTrace('test-action');
      const startTime = telemetry.getStartTime(traceId);

      expect(startTime).toBeDefined();
      expect(typeof startTime).toBe('number');
    });

    it('should return undefined for non-existent trace', () => {
      const startTime = telemetry.getStartTime('non-existent');
      expect(startTime).toBeUndefined();
    });
  });

  describe('subscribe', () => {
    it('should call listener on events', () => {
      const listener = vi.fn();
      const unsubscribe = telemetry.subscribe(listener);

      const traceId = telemetry.startTrace('test-action');

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId,
          type: 'event',
          name: 'STREAM_START'
        })
      );

      unsubscribe();
    });

    it('should return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = telemetry.subscribe(listener);

      telemetry.startTrace('action1');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      telemetry.startTrace('action2');
      // Should still be 1 because we unsubscribed
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('logMetric', () => {
    it('should notify listeners with metric data', () => {
      const listener = vi.fn();
      telemetry.subscribe(listener);

      const traceId = telemetry.startTrace('test-action');
      listener.mockClear();

      telemetry.logMetric(traceId, 'TTFT', 150);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId,
          type: 'metric',
          name: 'TTFT',
          value: 150
        })
      );
    });
  });

  describe('logEvent', () => {
    it('should notify listeners with event data', () => {
      const listener = vi.fn();
      telemetry.subscribe(listener);

      const traceId = telemetry.startTrace('test-action');
      listener.mockClear();

      telemetry.logEvent(traceId, 'ERROR', { message: 'Test error' });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId,
          type: 'event',
          name: 'ERROR',
          value: { message: 'Test error' }
        })
      );
    });
  });

  describe('memory management', () => {
    it('should clear all traces when clearAllTraces is called', () => {
      telemetry.startTrace('action1');
      telemetry.startTrace('action2');
      telemetry.startTrace('action3');

      expect(telemetry.getTraceCount()).toBe(3);

      telemetry.clearAllTraces();

      expect(telemetry.getTraceCount()).toBe(0);
    });

    it('should enforce maximum trace limit', () => {
      // Start many traces (more than MAX_TRACES which is 100)
      for (let i = 0; i < 105; i++) {
        telemetry.startTrace(`action-${i}`);
      }

      // Should be at or under the limit
      expect(telemetry.getTraceCount()).toBeLessThanOrEqual(100);
    });
  });
});
