declare module "web-vitals" {
  export interface Metric {
    name: string;
    value: number;
    rating: "good" | "needs-improvement" | "poor";
    delta: number;
    id: string;
    navigationType: string;
  }

  export type ReportHandler = (metric: Metric) => void;

  export function getCLS(onReport: ReportHandler): void;
  export function getFCP(onReport: ReportHandler): void;
  export function getFID(onReport: ReportHandler): void;
  export function getINP(onReport: ReportHandler): void;
  export function getLCP(onReport: ReportHandler): void;
  export function getTTFB(onReport: ReportHandler): void;
}
