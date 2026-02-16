"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsReporter() {
  const sampleRate = 0.2;

  useReportWebVitals((metric) => {
    if (typeof navigator === "undefined") return;
    if (Math.random() > sampleRate) return;

    const payload = JSON.stringify({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
    });

    navigator.sendBeacon("/api/health/vitals", payload);
  });

  return null;
}
