import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./lib/__tests__/setup.ts'],
    include: ['**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.next', 'out'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        'out/',
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
