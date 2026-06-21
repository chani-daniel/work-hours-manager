import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    server: {
      deps: {
        // MUI's ESM build imports react-transition-group via a directory
        // import that Node's ESM loader can't resolve. Inline both so Vite
        // (which supports these imports) processes them during tests.
        inline: [/@mui\//, 'react-transition-group'],
      },
    },
  },
})
