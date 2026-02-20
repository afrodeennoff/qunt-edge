/**
 * Real-Time Performance Monitoring and Alerting System
 * 
 * This module provides:
 * - Real-time Web Vitals monitoring
 * - Performance regression detection
 * - Alert notifications when thresholds are exceeded
 * - Integration with monitoring services (Sentry, Vercel Analytics)
 * - Dashboard-ready metrics
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
}

interface PerformanceAlert {
  id: string;
  severity: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  message: string;
}

interface MonitoringConfig {
  enableRealUserMonitoring: boolean;
  alertThresholds: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  alertingEnabled: boolean;
  sampleRate: number;
}

const DEFAULT_CONFIG: MonitoringConfig = {
  enableRealUserMonitoring: true,
  alertThresholds: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    fcp: 1800,
    ttfb: 800,
  },
  alertingEnabled: true,
  sampleRate: 1.0, // Monitor 100% of users
};

/**
 * Real-time performance monitoring system
 */
class RealTimePerformanceMonitor {
  private metrics: WebVitalMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private config: MonitoringConfig;
  private observer: PerformanceObserver | null = null;
  private alertCallbacks: Set<(alert: PerformanceAlert) => void> = new Set();
  private isMonitoring = false;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start monitoring performance
   */
  start() {
    if (this.isMonitoring || typeof window === 'undefined') return;
    this.isMonitoring = true;

    // Sample users based on sample rate
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    // Monitor Core Web Vitals
    this.setupCoreWebVitalsMonitoring();

    // Monitor resource timing
    this.setupResourceMonitoring();

    // Monitor long tasks
    this.setupLongTaskMonitoring();

    // Check for performance regressions periodically
    this.startRegressionDetection();
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Setup Core Web Vitals monitoring
   */
  private setupCoreWebVitalsMonitoring() {
    // Largest Contentful Paint (LCP)
    this.observeEntry('largest-contentful-paint', (entry: any) => {
      this.recordMetric({
        name: 'LCP',
        value: entry.startTime,
        rating: this.getRating('lcp', entry.startTime),
        timestamp: Date.now(),
        url: window.location.href,
      });
    });

    // First Input Delay (FID)
    this.observeEntry('first-input', (entry: any) => {
      this.recordMetric({
        name: 'FID',
        value: entry.processingStart - entry.startTime,
        rating: this.getRating('fid', entry.processingStart - entry.startTime),
        timestamp: Date.now(),
        url: window.location.href,
      });
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.observeEntry('layout-shift', (entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        this.recordMetric({
          name: 'CLS',
          value: clsValue,
          rating: this.getRating('cls', clsValue),
          timestamp: Date.now(),
          url: window.location.href,
        });
      }
    });

    // First Contentful Paint (FCP)
    this.observeEntry('paint', (entry: any) => {
      if (entry.name === 'first-contentful-paint') {
        this.recordMetric({
          name: 'FCP',
          value: entry.startTime,
          rating: this.getRating('fcp', entry.startTime),
          timestamp: Date.now(),
          url: window.location.href,
        });
      }
    });
  }

  /**
   * Setup resource timing monitoring
   */
  private setupResourceMonitoring() {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
          // Check for slow resources
          if (entry.duration > 2000) {
            this.createAlert({
              severity: 'warning',
              metric: 'resource_load_time',
              value: entry.duration,
              threshold: 2000,
              message: `Slow resource detected: ${entry.name} took ${entry.duration.toFixed(0)}ms`,
            });
          }
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource monitoring not available:', error);
    }
  }

  /**
   * Setup long task monitoring
   */
  private setupLongTaskMonitoring() {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.createAlert({
              severity: 'warning',
              metric: 'long_task',
              value: entry.duration,
              threshold: 50,
              message: `Long task detected: ${entry.duration.toFixed(0)}ms (blocks main thread)`,
            });
          }
        }
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      // Long task monitoring not supported in all browsers
      console.debug('Long task monitoring not available:', error);
    }
  }

  /**
   * Observe performance entries
   */
  private observeEntry(type: string, callback: (entry: any) => void) {
    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });
      this.observer.observe({ type, buffered: true });
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: WebVitalMetric) {
    this.metrics.push(metric);

    // Check if metric exceeds threshold
    const threshold = this.config.alertThresholds[metric.name.toLowerCase() as keyof typeof this.config.alertThresholds];
    if (threshold && metric.value > threshold) {
      this.createAlert({
        severity: metric.rating === 'poor' ? 'critical' : 'warning',
        metric: metric.name,
        value: metric.value,
        threshold,
        message: `${metric.name} exceeded threshold: ${metric.value.toFixed(0)}ms > ${threshold}ms`,
      });
    }

    // Send to external monitoring services
    this.sendToExternalServices(metric);
  }

  /**
   * Create a performance alert
   */
  private createAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) {
    const fullAlert: PerformanceAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.alerts.push(fullAlert);

    // Notify subscribers
    this.alertCallbacks.forEach(callback => callback(fullAlert));

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = alert.severity === 'critical' ? console.error : console.warn;
      logMethod('⚠️ Performance Alert:', fullAlert);
    }
  }

  /**
   * Get rating for a metric value
   */
  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Send metrics to external services
   */
  private sendToExternalServices(metric: WebVitalMetric) {
    // Send to Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va(metric.name.toLowerCase(), metric.value);
    }

    // Send to Sentry
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.addBreadcrumb({
        category: 'performance',
        message: `${metric.name}: ${metric.value.toFixed(0)}ms`,
        level: metric.rating === 'poor' ? 'error' : metric.rating === 'needs-improvement' ? 'warning' : 'info',
      });
    }
  }

  /**
   * Start performance regression detection
   */
  private startRegressionDetection() {
    setInterval(() => {
      this.detectRegressions();
    }, 60000); // Check every minute
  }

  /**
   * Detect performance regressions
   */
  private detectRegressions() {
    const recentMetrics = this.metrics.slice(-20); // Last 20 metrics

    // Group by metric name
    const byName = new Map<string, number[]>();
    recentMetrics.forEach(metric => {
      if (!byName.has(metric.name)) {
        byName.set(metric.name, []);
      }
      byName.get(metric.name)!.push(metric.value);
    });

    // Check for regressions (significant increase)
    byName.forEach((values, name) => {
      if (values.length < 10) return;

      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const threshold = this.config.alertThresholds[name.toLowerCase() as keyof typeof this.config.alertThresholds];
      
      if (threshold && avg > threshold * 1.5) {
        this.createAlert({
          severity: 'critical',
          metric: name,
          value: avg,
          threshold: threshold * 1.5,
          message: `Performance regression detected: ${name} average is ${avg.toFixed(0)}ms`,
        });
      }
    });
  }

  /**
   * Subscribe to alerts
   */
  onAlert(callback: (alert: PerformanceAlert) => void): () => void {
    this.alertCallbacks.add(callback);
    return () => this.alertCallbacks.delete(callback);
  }

  /**
   * Get all metrics
   */
  getMetrics(): WebVitalMetric[] {
    return [...this.metrics];
  }

  /**
   * Get all alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    const byName = new Map<string, WebVitalMetric[]>();
    this.metrics.forEach(metric => {
      if (!byName.has(metric.name)) {
        byName.set(metric.name, []);
      }
      byName.get(metric.name)!.push(metric);
    });

    const summary: Record<string, { avg: number; min: number; max: number; count: number; rating: string }> = {};

    byName.forEach((metrics, name) => {
      const values = metrics.map(m => m.value);
      summary[name] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
        rating: metrics[metrics.length - 1].rating,
      };
    });

    return summary;
  }

  /**
   * Clear all metrics and alerts
   */
  clear() {
    this.metrics = [];
    this.alerts = [];
  }
}

export const performanceMonitor = new RealTimePerformanceMonitor();

/**
 * React hook for real-time performance monitoring
 */
export function useRealTimeMonitoring() {
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [summary, setSummary] = useState<Record<string, any>>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!mountedRef.current) return;

    performanceMonitor.start();

    // Update metrics periodically
    const intervalId = setInterval(() => {
      if (mountedRef.current) {
        setMetrics(performanceMonitor.getMetrics());
        setAlerts(performanceMonitor.getAlerts());
        setSummary(performanceMonitor.getSummary());
      }
    }, 1000);

    // Subscribe to alerts
    const unsubscribe = performanceMonitor.onAlert((alert) => {
      if (mountedRef.current) {
        setAlerts(prev => [...prev, alert]);
      }
    });

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
      unsubscribe();
      performanceMonitor.stop();
    };
  }, []);

  return {
    metrics,
    alerts,
    summary,
    clearMetrics: () => performanceMonitor.clear(),
  };
}

/**
 * Performance Dashboard Widget Component
 */
export function PerformanceDashboardWidget() {
  const { metrics, alerts, summary } = useRealTimeMonitoring();

  if (typeof window === 'undefined') return null;

  return (
    <div className="performance-dashboard">
      <h3>Performance Metrics (Real-Time)</h3>
      
      <div className="metrics-summary">
        {Object.entries(summary).map(([name, data]: [string, any]) => (
          <div key={name} className={`metric-card ${data.rating}`}>
            <div className="metric-name">{name}</div>
            <div className="metric-value">{data.avg.toFixed(0)}ms</div>
            <div className="metric-rating">{data.rating}</div>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="alerts-list">
          <h4>Recent Alerts</h4>
          {alerts.slice(-5).map(alert => (
            <div key={alert.id} className={`alert alert-${alert.severity}`}>
              <span className="alert-message">{alert.message}</span>
              <span className="alert-time">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Performance monitoring middleware for API routes
 */
export function withPerformanceMonitoring(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const startTime = performance.now();
    
    try {
      const response = await handler(req);
      const duration = performance.now() - startTime;
      
      // Record server-side timing
      if (typeof window !== 'undefined') {
        performanceMonitor.recordMetric({
          name: 'API_RESPONSE_TIME',
          value: duration,
          rating: duration > 1000 ? 'poor' : duration > 500 ? 'needs-improvement' : 'good',
          timestamp: Date.now(),
          url: req.url,
        });
      }
      
      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      performanceMonitor.createAlert({
        severity: 'critical',
        metric: 'api_error',
        value: duration,
        threshold: 1000,
        message: `API error on ${req.url}: ${error}`,
      });
      
      throw error;
    }
  };
}

/**
 * Start monitoring in production
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  performanceMonitor.start();
}

/**
 * Export for global access
 */
export { RealTimePerformanceMonitor, WebVitalMetric, PerformanceAlert, MonitoringConfig };
