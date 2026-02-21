/**
 * Memory Leak Detection and Prevention Utilities
 * 
 * This module provides tools to detect, prevent, and fix memory leaks in React components.
 * It includes automated detection, cleanup utilities, and best practice enforcement.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

interface MemoryLeak {
  component: string;
  file: string;
  type: 'event-listener' | 'timer' | 'subscription' | 'ref' | 'closure';
  severity: 'high' | 'medium' | 'low';
  description: string;
  fix?: string;
}

interface MemorySnapshot {
  timestamp: number;
  heapSize: number;
  heapUsed: number;
  components: number;
  listeners: number;
}

class MemoryLeakDetector {
  private leaks: MemoryLeak[] = [];
  private snapshots: MemorySnapshot[] = [];
  private isMonitoring = false;
  private observers: PerformanceObserver[] = [];
  private maxSnapshots = 100;

  /**
   * Start monitoring for memory leaks
   */
  start() {
    if (this.isMonitoring || typeof window === 'undefined') return;
    this.isMonitoring = true;

    // Monitor component renders
    this.monitorComponentMounts();

    // Monitor memory usage
    this.monitorMemoryUsage();

    // Monitor event listeners
    this.monitorEventListeners();
  }

  /**
   * Stop monitoring
   */
  stop() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isMonitoring = false;
  }

  /**
   * Monitor component mount/unmount cycles
   */
  private monitorComponentMounts() {
    const originalLog = console.error;
    let mountCount = 0;
    let unmountCount = 0;

    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && message.includes('Warning:')) {
        if (message.includes('unmounted')) {
          this.leaks.push({
            component: 'Unknown',
            file: 'Unknown',
            type: 'ref',
            severity: 'high',
            description: 'State update on unmounted component detected',
            fix: 'Add cleanup in useEffect or use useRef for persistent state',
          });
        }
      }
      originalLog.apply(console, args);
    };
  }

  /**
   * Monitor memory usage over time
   */
  private monitorMemoryUsage() {
    if (typeof performance === 'undefined' || !('memory' in performance)) return;

    const takeSnapshot = () => {
      const memory = (performance as any).memory;
      const snapshot: MemorySnapshot = {
        timestamp: Date.now(),
        heapSize: memory.jsHeapSizeLimit,
        heapUsed: memory.usedJSHeapSize,
        components: this.leaks.filter(l => l.type === 'ref').length,
        listeners: this.estimateEventListenerCount(),
      };

      this.snapshots.push(snapshot);
      
      if (this.snapshots.length > this.maxSnapshots) {
        this.snapshots.shift();
      }

      // Detect memory growth patterns
      this.detectMemoryGrowth();
    };

    // Take snapshot every 10 seconds
    const intervalId = setInterval(takeSnapshot, 10000);
    
    // Store interval ID for cleanup
    (window as any).__memoryLeakDetectorInterval = intervalId;
  }

  /**
   * Estimate number of event listeners (rough approximation)
   */
  private estimateEventListenerCount(): number {
    let count = 0;
    const maybeGetEventListeners = (globalThis as unknown as {
      getEventListeners?: (target: EventTarget) => Record<string, EventListener[]>;
    }).getEventListeners;
    
    // Count common DOM event listeners
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      const listeners = maybeGetEventListeners?.(el);
      if (listeners) {
        Object.values(listeners).forEach((arr: any) => {
          count += arr.length;
        });
      }
    });

    return count;
  }

  /**
   * Detect unusual memory growth patterns
   */
  private detectMemoryGrowth() {
    if (this.snapshots.length < 5) return;

    const recent = this.snapshots.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];

    const growthRate = (last.heapUsed - first.heapUsed) / first.heapUsed;

    if (growthRate > 0.5) { // 50% growth in 50 seconds
      console.warn('⚠️ Rapid memory growth detected:', {
        growth: `${(growthRate * 100).toFixed(1)}%`,
        currentHeap: `${(last.heapUsed / 1048576).toFixed(2)} MB`,
        recommendation: 'Check for uncleaned event listeners, timers, or subscriptions',
      });

      this.leaks.push({
        component: 'Application',
        file: 'Global',
        type: 'closure',
        severity: 'high',
        description: `Rapid memory growth detected (${(growthRate * 100).toFixed(1)}% in 50s)`,
        fix: 'Review useEffect cleanup functions and remove event listeners/subscriptions',
      });
    }
  }

  /**
   * Monitor event listener leaks
   */
  private monitorEventListeners() {
    if (typeof window === 'undefined') return;

    // Patch addEventListener to track registrations
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    
    const listeners = new Map<EventTarget, Map<string, Set<EventListener>>>();

    EventTarget.prototype.addEventListener = function(
      this: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: AddEventListenerOptions
    ) {
      if (!listeners.has(this)) {
        listeners.set(this, new Map());
      }
      if (!listeners.get(this)!.has(type)) {
        listeners.get(this)!.set(type, new Set());
      }
      listeners.get(this)!.get(type)!.add(listener as EventListener);

      return originalAddEventListener.call(this, type, listener, options);
    };

    EventTarget.prototype.removeEventListener = function(
      this: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: EventListenerOptions
    ) {
      if (listeners.has(this) && listeners.get(this)!.has(type)) {
        listeners.get(this)!.get(type)!.delete(listener as EventListener);
      }

      return originalRemoveEventListener.call(this, type, listener, options);
    };

    // Store reference for cleanup
    (window as any).__trackedListeners = listeners;

    // Check for listener leaks every 30 seconds
    const checkInterval = setInterval(() => {
      const totalListeners = Array.from(listeners.values())
        .reduce((sum, map) => sum + Array.from(map.values()).reduce((s, set) => s + set.size, 0), 0);

      if (totalListeners > 100) {
        console.warn('⚠️ High number of event listeners detected:', totalListeners);
      }
    }, 30000);

    (window as any).__listenerCheckInterval = checkInterval;
  }

  /**
   * Get all detected leaks
   */
  getLeaks(): MemoryLeak[] {
    return [...this.leaks];
  }

  /**
   * Get memory snapshots
   */
  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Generate memory leak report
   */
  generateReport() {
    console.group('🔍 Memory Leak Report');
    
    console.log('\n📊 Memory Snapshots:');
    console.table(
      this.snapshots.slice(-10).map(s => ({
        Time: new Date(s.timestamp).toLocaleTimeString(),
        'Heap Used': `${(s.heapUsed / 1048576).toFixed(2)} MB`,
        'Components': s.components,
        'Listeners': s.listeners,
      }))
    );

    if (this.leaks.length > 0) {
      console.log('\n⚠️ Detected Leaks:');
      console.table(
        this.leaks.map(leak => ({
          Component: leak.component,
          Type: leak.type,
          Severity: leak.severity,
          Description: leak.description,
        }))
      );
    } else {
      console.log('\n✅ No memory leaks detected');
    }

    console.groupEnd();
  }

  /**
   * Clear all recorded data
   */
  clear() {
    this.leaks = [];
    this.snapshots = [];
  }
}

export const memoryLeakDetector = new MemoryLeakDetector();

/**
 * React hook to detect memory leaks in a component
 */
export function useMemoryLeakDetection(componentName: string) {
  const mountedRef = useRef(true);
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const listenersRef = useRef<Set<{ target: EventTarget; type: string; handler: any }>>(new Set());

  useEffect(() => {
    memoryLeakDetector.start();
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      
      // Clean up any tracked timers
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();

      // Clean up any tracked listeners
      listenersRef.current.forEach(({ target, type, handler }) => {
        target.removeEventListener(type, handler);
      });
      listenersRef.current.clear();
    };
  }, []);

  /**
   * Track a timer for automatic cleanup
   */
  const trackTimer = useCallback((timer: NodeJS.Timeout) => {
    timersRef.current.add(timer);
    return timer;
  }, []);

  /**
   * Track an event listener for automatic cleanup
   */
  const trackListener = useCallback((
    target: EventTarget,
    type: string,
    handler: any,
    options?: AddEventListenerOptions
  ) => {
    target.addEventListener(type, handler, options);
    listenersRef.current.add({ target, type, handler });
  }, []);

  return {
    isMounted: () => mountedRef.current,
    trackTimer,
    trackListener,
  };
}

/**
 * Custom hook to safely use setTimeout with automatic cleanup
 */
export function useSafeTimeout() {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  const setSafeTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      callback();
      timeoutsRef.current.delete(timeout);
    }, delay);
    
    timeoutsRef.current.add(timeout);
    return timeout;
  }, []);

  const clearSafeTimeout = useCallback((timeout: NodeJS.Timeout) => {
    clearTimeout(timeout);
    timeoutsRef.current.delete(timeout);
  }, []);

  return { setSafeTimeout, clearSafeTimeout };
}

/**
 * Custom hook to safely use setInterval with automatic cleanup
 */
export function useSafeInterval() {
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();
    };
  }, []);

  const setSafeInterval = useCallback((callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    intervalsRef.current.add(interval);
    return interval;
  }, []);

  const clearSafeInterval = useCallback((interval: NodeJS.Timeout) => {
    clearInterval(interval);
    intervalsRef.current.delete(interval);
  }, []);

  return { setSafeInterval, clearSafeInterval };
}

/**
 * Custom hook to safely use event listeners with automatic cleanup
 */
export function useSafeEventListener() {
  const listenersRef = useRef<Set<{ target: EventTarget; type: string; handler: any; options?: any }>>(new Set());

  useEffect(() => {
    return () => {
      listenersRef.current.forEach(({ target, type, handler, options }) => {
        target.removeEventListener(type, handler, options);
      });
      listenersRef.current.clear();
    };
  }, []);

  const addSafeListener = useCallback((
    target: EventTarget,
    type: string,
    handler: any,
    options?: AddEventListenerOptions
  ) => {
    target.addEventListener(type, handler, options);
    listenersRef.current.add({ target, type, handler, options });
  }, []);

  const removeSafeListener = useCallback((
    target: EventTarget,
    type: string,
    handler: any,
    options?: EventListenerOptions
  ) => {
    target.removeEventListener(type, handler, options);
    listenersRef.current.forEach((listener, index) => {
      if (
        listener.target === target &&
        listener.type === type &&
        listener.handler === handler
      ) {
        listenersRef.current.delete(listener);
      }
    });
  }, []);

  return { addSafeListener, removeSafeListener };
}

/**
 * Memory leak prevention checklist
 */
export const MEMORY_LEAK_CHECKLIST = {
  useEffectCleanup: 'All useEffect hooks with subscriptions/timers/listeners have cleanup functions',
  eventListenerRemoval: 'All addEventListener calls have corresponding removeEventListener in cleanup',
  stateMountedCheck: 'State updates check if component is mounted before updating',
  cleanupIntervals: 'All setInterval/setTimeout are cleared in useEffect cleanup',
  subscriptionCancellation: 'All RxJS/observable subscriptions are unsubscribed',
  abortController: 'Fetch requests use AbortController for cancellation',
  useRefOverState: 'Values that persist across renders use useRef instead of useState',
  closureCleanup: 'Event handlers from closures are cleaned up',
  webWorkerCleanup: 'Web Workers are terminated when unmounting',
  indexedDB: 'IndexedDB transactions are closed properly',
};

/**
 * Analyze a component file for potential memory leaks
 */
export function analyzeComponentForLeaks(componentCode: string, componentName: string): MemoryLeak[] {
  const leaks: MemoryLeak[] = [];

  // Check for useEffect without cleanup
  const useEffectWithoutCleanup = componentCode.match(/useEffect\(\(\)\s*=>\s*{([^}]*addEventListener[^}]*})\s*,\s*\[\]/g);
  if (useEffectWithoutCleanup) {
    useEffectWithoutCleanup.forEach(match => {
      if (!match.includes('return') && !match.includes('removeEventListener')) {
        leaks.push({
          component: componentName,
          file: 'Unknown',
          type: 'event-listener',
          severity: 'high',
          description: 'addEventListener without cleanup',
          fix: 'Add return () => target.removeEventListener(type, handler)',
        });
      }
    });
  }

  // Check for timers without cleanup
  const timersWithoutCleanup = componentCode.match(/setInterval|setTimeout/g);
  if (timersWithoutCleanup) {
    const useEffects = componentCode.match(/useEffect\([^)]+\)/g) || [];
    useEffects.forEach(effect => {
      if ((effect.includes('setInterval') || effect.includes('setTimeout')) && !effect.includes('return')) {
        leaks.push({
          component: componentName,
          file: 'Unknown',
          type: 'timer',
          severity: 'high',
          description: 'Timer without cleanup',
          fix: 'Store timer ID and clear it in useEffect cleanup',
        });
      }
    });
  }

  // Check for subscriptions without cleanup
  if (componentCode.includes('subscribe(') || componentCode.includes('.on(')) {
    const useEffects = componentCode.match(/useEffect\([^)]+\)/g) || [];
    useEffects.forEach(effect => {
      if ((effect.includes('subscribe(') || effect.includes('.on(')) && !effect.includes('unsubscribe') && !effect.includes('return')) {
        leaks.push({
          component: componentName,
          file: 'Unknown',
          type: 'subscription',
          severity: 'high',
          description: 'Subscription without cleanup',
          fix: 'Call unsubscribe() in useEffect cleanup',
        });
      }
    });
  }

  return leaks;
}

/**
 * Start automatic memory leak monitoring in development
 */
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  memoryLeakDetector.start();

  // Log report every 60 seconds
  setInterval(() => {
    if (memoryLeakDetector.getLeaks().length > 0) {
      memoryLeakDetector.generateReport();
    }
  }, 60000);
}
