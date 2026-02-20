import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { createOptimizedNextConfig } from './lib/performance/enhanced-next-config';

const { config, warnings } = createOptimizedNextConfig();
warnings.forEach((warning) => console.warn(`[next-config] ${warning}`));
const nextConfig: NextConfig = config;

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
