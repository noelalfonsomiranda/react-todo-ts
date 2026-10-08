/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom gives tests a fake browser DOM so React components can render.
    environment: 'jsdom',
    // `globals: true` lets us use describe/it/expect without importing them.
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: false,
  },
});
