
type MetricType = 'TTFT' | 'LATENCY' | 'SIZE' | 'TOKENS';
type EventType = 'ERROR' | 'HALLUCINATION' | 'STREAM_START' | 'STREAM_COMPLETE' | 'TIMEOUT' | 'RETRY';

interface TelemetryEvent {
  traceId: string;
  timestamp: number;
  type: 'metric' | 'event';
  name: string;
  value: any;
  details?: any;
}

type TelemetryListener = (event: TelemetryEvent) => void;

// Configuration for trace cleanup
const TRACE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 60 * 1000;  // Run cleanup every minute
const MAX_TRACES = 100; // Maximum number of concurrent traces

class TelemetryService {
  private static instance: TelemetryService;
  private traces = new Map<string, number>();
  private listeners = new Set<TelemetryListener>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    // Start automatic cleanup of stale traces
    this.startCleanupTimer();
  }

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  /**
   * Start automatic cleanup timer for stale traces
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
      this.cleanupStaleTraces();
    }, CLEANUP_INTERVAL_MS);

    // Don't prevent Node.js from exiting if this is the only timer
    if (typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Clean up traces that have been running too long (likely abandoned)
   */
  private cleanupStaleTraces(): void {
    const now = performance.now();
    let cleanedCount = 0;

    for (const [traceId, startTime] of this.traces.entries()) {
      if (now - startTime > TRACE_MAX_AGE_MS) {
        this.traces.delete(traceId);
        cleanedCount++;

        // Log warning about abandoned trace
        console.warn(`[Telemetry] Cleaned up stale trace: ${traceId} (age: ${((now - startTime) / 1000).toFixed(1)}s)`);
      }
    }

    if (cleanedCount > 0) {
      console.log(`[Telemetry] Cleaned up ${cleanedCount} stale trace(s). Active traces: ${this.traces.size}`);
    }
  }

  /**
   * Stop the cleanup timer (useful for testing)
   */
  public stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Get current trace count (useful for monitoring)
   */
  public getTraceCount(): number {
    return this.traces.size;
  }

  /**
   * Force cleanup of all traces (useful for testing)
   */
  public clearAllTraces(): void {
    this.traces.clear();
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(event: TelemetryEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  public startTrace(actionName: string): string {
    // Enforce maximum trace limit to prevent memory issues
    if (this.traces.size >= MAX_TRACES) {
      console.warn(`[Telemetry] Max traces (${MAX_TRACES}) reached. Cleaning up oldest traces.`);
      this.cleanupStaleTraces();

      // If still over limit after cleanup, remove oldest
      if (this.traces.size >= MAX_TRACES) {
        const oldestTraceId = this.traces.keys().next().value;
        if (oldestTraceId) {
          this.traces.delete(oldestTraceId);
        }
      }
    }

    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.traces.set(traceId, performance.now());

    console.groupCollapsed(`%c[Telemetry] Start Trace: ${actionName} (${traceId})`, 'color: #3b82f6; font-weight: bold;');
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();

    this.notify({
      traceId,
      timestamp: Date.now(),
      type: 'event',
      name: 'STREAM_START',
      value: actionName
    });

    return traceId;
  }

  public logMetric(traceId: string, metric: MetricType, value: number) {
    const styles = {
      TTFT: 'color: #10b981; font-weight: bold;',
      LATENCY: 'color: #f59e0b; font-weight: bold;',
      SIZE: 'color: #8b5cf6; font-weight: bold;',
      TOKENS: 'color: #6366f1; font-weight: bold;',
    };

    console.log(`%c[Metric] ${metric}: ${value.toFixed(2)}ms`, styles[metric] || 'color: gray');

    this.notify({
      traceId,
      timestamp: Date.now(),
      type: 'metric',
      name: metric,
      value: value
    });
  }

  public logEvent(traceId: string, event: EventType, details: object) {
    const styles = {
      ERROR: 'color: #ef4444; font-weight: bold; background: #fee2e2; padding: 2px 4px; rounded: 2px;',
      HALLUCINATION: 'color: #ec4899; font-weight: bold;',
      STREAM_START: 'color: #3b82f6;',
      STREAM_COMPLETE: 'color: #10b981;',
    };

    if (event === 'ERROR' || event === 'HALLUCINATION') {
      console.groupCollapsed(`%c[Event] ${event}`, styles[event]);
      console.table(details);
      console.groupEnd();
    } else {
      console.log(`%c[Event] ${event}`, styles[event], details);
    }

    this.notify({
      traceId,
      timestamp: Date.now(),
      type: 'event',
      name: event,
      value: details
    });
  }

  public endTrace(traceId: string) {
    if (this.traces.has(traceId)) {
      const startTime = this.traces.get(traceId)!;
      const duration = performance.now() - startTime;
      this.logMetric(traceId, 'LATENCY', duration);
      this.traces.delete(traceId);

      this.notify({
        traceId,
        timestamp: Date.now(),
        type: 'event',
        name: 'STREAM_COMPLETE',
        value: duration
      });
    }
  }

  public getStartTime(traceId: string): number | undefined {
    return this.traces.get(traceId);
  }
}

export const telemetry = TelemetryService.getInstance();
