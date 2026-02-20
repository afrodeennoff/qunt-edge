import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { fileURLToPath } from 'node:url';
import { createOptimizedNextConfig } from './lib/performance/next-config';

const workspaceRoot = fileURLToPath(new URL('.', import.meta.url));
const { config, warnings } = createOptimizedNextConfig(workspaceRoot);
warnings.forEach((warning) => console.warn(`[next-config] ${warning}`));
const nextConfig: NextConfig = config;

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
