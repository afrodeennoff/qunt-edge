'use client';

import { useEffect } from 'react';
import { trackWebVitals, performanceMonitor } from '@/lib/performance/performance-monitor';

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
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

        getCLS((metric) => {
          trackWebVitals(metric);
          onMetric?.(metric);
        });

        getFID((metric) => {
          trackWebVitals(metric);
          onMetric?.(metric);
        });

        getFCP((metric) => {
          trackWebVitals(metric);
          onMetric?.(metric);
        });

        getLCP((metric) => {
          trackWebVitals(metric);
          onMetric?.(metric);
        });

        getTTFB((metric) => {
          trackWebVitals(metric);
          onMetric?.(metric);
        });

        console.log('✅ Web Vitals monitoring initialized');
      } catch (error) {
        console.error('Failed to initialize web vitals:', error);
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
