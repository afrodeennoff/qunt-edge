'use client';

import { useEffect } from 'react';
import { trackWebVitals } from '@/lib/performance/performance-monitor';

interface PerformanceObserverProps {
  enabled?: boolean;
  onMetric?: (metric: any) => void;
}

export function PerformanceObserver({
  enabled = process.env.NODE_ENV === 'production',
  onMetric,
}: PerformanceObserverProps) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let isInitialized = false;

    const initWebVitals = async () => {
      if (isInitialized) return;
      isInitialized = true;

      try {
        const webVitals = await import('web-vitals');
        const handlers = [
          webVitals.getCLS,
          webVitals.getFCP,
          webVitals.getLCP,
          webVitals.getTTFB,
          webVitals.getINP ?? webVitals.getFID,
        ].filter((handler): handler is (cb: (metric: any) => void) => void => typeof handler === "function");

        const onVitalMetric = (metric: any) => {
          trackWebVitals(metric);
          onMetric?.(metric);
        };

        handlers.forEach((handler) => handler(onVitalMetric));
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn('Web Vitals monitoring unavailable; skipping runtime observer.', error);
        }
      }
    };

    initWebVitals();

    return () => {
      isInitialized = false;
    };
  }, [enabled, onMetric]);

  return null;
}

export default PerformanceObserver;
