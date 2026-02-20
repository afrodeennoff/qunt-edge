export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface WebVitals {
  FCP?: PerformanceMetric;
  LCP?: PerformanceMetric;
  FID?: PerformanceMetric;
  CLS?: PerformanceMetric;
  TTFB?: PerformanceMetric;
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
  };

  recordMetric(name: string, value: number): PerformanceMetric {
    const threshold = this.thresholds[name as keyof typeof this.thresholds];
    let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
    
    if (threshold) {
      if (value >= threshold.poor) rating = 'poor';
      else if (value >= threshold.good) rating = 'needs-improvement';
    }
    
    const metric: PerformanceMetric = {
      name,
      value,
      rating,
      timestamp: Date.now(),
    };
    
    const existing = this.metrics.get(name) || [];
    existing.push(metric);
    this.metrics.set(name, existing.slice(-100));
    
    return metric;
  }

  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || [];
  }

  getAverageMetric(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  getWebVitals(): WebVitals {
    return {
      FCP: this.getLatestMetric('FCP'),
      LCP: this.getLatestMetric('LCP'),
      FID: this.getLatestMetric('FID'),
      CLS: this.getLatestMetric('CLS'),
      TTFB: this.getLatestMetric('TTFB'),
    };
  }

  private getLatestMetric(name: string): PerformanceMetric | undefined {
    const metrics = this.getMetrics(name);
    return metrics[metrics.length - 1];
  }

  getPerformanceScore(): number {
    const vitals = this.getWebVitals();
    const scores: number[] = [];
    
    Object.values(vitals).forEach(metric => {
      if (metric) {
        switch (metric.rating) {
          case 'good': scores.push(100); break;
          case 'needs-improvement': scores.push(50); break;
          case 'poor': scores.push(0); break;
        }
      }
    });
    
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  logReport() {
    const vitals = this.getWebVitals();
    console.log('\n📊 Performance Metrics:');
    
    Object.entries(vitals).forEach(([name, metric]) => {
      if (metric) {
        const emoji = metric.rating === 'good' ? '✅' : 
                     metric.rating === 'needs-improvement' ? '⚠️' : '❌';
        console.log(`   ${emoji} ${name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
      }
    });
    
    console.log(`   📈 Overall Score: ${this.getPerformanceScore()}/100`);
  }

  exportMetrics(): string {
    const vitals = this.getWebVitals();
    return JSON.stringify({
      timestamp: Date.now(),
      metrics: vitals,
      score: this.getPerformanceScore(),
    }, null, 2);
  }
}

export const performanceMonitor = new PerformanceMonitor();

export const trackWebVitals = (metric: any) => {
  const { name, value } = metric;
  performanceMonitor.recordMetric(name, value);
  
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    performanceMonitor.logReport();
  }
};
