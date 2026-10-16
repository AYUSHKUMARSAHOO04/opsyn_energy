import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/shared/tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@opsyn/shared': path.resolve(__dirname, 'packages/shared/src'),
    },
  },
});
