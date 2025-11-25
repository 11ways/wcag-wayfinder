/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment - use jsdom for better localStorage support (required by MSW)
    environment: 'jsdom',

    // Ensure localStorage is available before MSW loads
    environmentOptions: {
      jsdom: {
        // This ensures jsdom's localStorage is set up
        url: 'http://localhost:3000',
      },
    },

    // Setup files for each test environment - polyfills must come first
    setupFiles: ['./src/tests/polyfills.ts', './src/tests/setup.ts'],

    // Configure server dependencies for MSW
    server: {
      deps: {
        inline: ['msw'],
      },
    },

    // Globals (optional - allows using describe, it, expect without imports)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.test.{ts,tsx}',
        '**/__tests__/',
        'src/main.tsx',
        'vite.config.ts',
        'vitest.config.ts',
        'postcss.config.js',
        'tailwind.config.js',
      ],
      // Coverage thresholds
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      // Include all source files for accurate coverage
      all: true,
      include: ['src/**/*.{ts,tsx}'],
    },

    // Include patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    // Test timeout
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,

    // Reporters
    reporters: ['verbose'],

    // CSS handling
    css: false,

    // Mock CSS modules
    mockReset: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/tests': path.resolve(__dirname, './src/tests'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/pages': path.resolve(__dirname, './src/pages'),
    },
  },
});
