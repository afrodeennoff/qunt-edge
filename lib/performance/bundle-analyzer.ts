import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export interface BundleMetric {
  name: string;
  size: number;
  gzipped: number;
  chunks: string[];
}

export interface BundleReport {
  timestamp: string;
  metrics: BundleMetric[];
  summary: {
    totalSize: number;
    totalGzipped: number;
    largestChunk: string;
    optimizationScore: number;
  };
}

export class BundleAnalyzer {
  private metrics: Map<string, BundleMetric> = new Map();

  recordChunk(name: string, size: number, gzipped: number, chunks: string[]) {
    this.metrics.set(name, { name, size, gzipped, chunks });
  }

  generateReport(): BundleReport {
    const metrics = Array.from(this.metrics.values());
    if (metrics.length === 0) {
      return {
        timestamp: new Date().toISOString(),
        metrics: [],
        summary: {
          totalSize: 0,
          totalGzipped: 0,
          largestChunk: 'N/A',
          optimizationScore: 0,
        },
      };
    }

    const totalSize = metrics.reduce((sum, m) => sum + m.size, 0);
    const totalGzipped = metrics.reduce((sum, m) => sum + m.gzipped, 0);
    const largestChunk = metrics.reduce((max, m) => 
      m.size > max.size ? m : max, metrics[0]
    );
    
    const optimizationScore = this.calculateOptimizationScore(metrics);

    return {
      timestamp: new Date().toISOString(),
      metrics,
      summary: {
        totalSize,
        totalGzipped,
        largestChunk: largestChunk?.name || 'N/A',
        optimizationScore,
      },
    };
  }

  private calculateOptimizationScore(metrics: BundleMetric[]): number {
    const avgGzipRatio = metrics.reduce((sum, m) => 
      sum + (m.gzipped / m.size), 0) / metrics.length;
    
    const sizeScore = Math.max(0, 100 - (metrics.reduce((sum, m) => 
      sum + m.size, 0) / 1024 / 1024) * 5);
    
    const compressionScore = avgGzipRatio * 100;
    
    return Math.round((sizeScore + compressionScore) / 2);
  }

  async saveReport(outputPath: string = '.next/bundle-report.json') {
    const report = this.generateReport();
    
    try {
      await mkdir(join(process.cwd(), '.next'), { recursive: true });
      await writeFile(
        join(process.cwd(), outputPath),
        JSON.stringify(report, null, 2)
      );
      
      console.log('\n📊 Bundle Analysis Report:');
      console.log(`   Total Size: ${(report.summary.totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Total Gzipped: ${(report.summary.totalGzipped / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Largest Chunk: ${report.summary.largestChunk}`);
      console.log(`   Optimization Score: ${report.summary.optimizationScore}/100`);
      
      if (report.summary.optimizationScore < 70) {
        console.warn('\n⚠️  Warning: Bundle optimization score is below 70');
        console.warn('   Consider splitting large components and removing unused dependencies');
      }
    } catch (error) {
      console.error('Failed to save bundle report:', error);
    }
  }

  getLargeChunks(threshold: number = 100 * 1024): BundleMetric[] {
    return Array.from(this.metrics.values())
      .filter(m => m.size > threshold)
      .sort((a, b) => b.size - a.size);
  }

  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    if (this.metrics.size === 0) {
      return ['No bundle metrics recorded yet. Run bundle analysis after a production build.'];
    }

    const largeChunks = this.getLargeChunks(150 * 1024);
    
    if (largeChunks.length > 0) {
      recommendations.push(
        `Found ${largeChunks.length} chunks larger than 150KB. Consider code splitting.`
      );
    }
    
    const avgGzipRatio = Array.from(this.metrics.values())
      .reduce((sum, m) => sum + (m.gzipped / m.size), 0) / this.metrics.size;
    
    if (avgGzipRatio > 0.4) {
      recommendations.push(
        'Gzip compression ratio is poor. Consider minification and compression optimizations.'
      );
    }
    
    return recommendations;
  }
}

export const bundleAnalyzer = new BundleAnalyzer();
