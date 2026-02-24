import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Dev server config — serves the demo app for development & testing
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,   // expose to LAN for Telegram testing
    open: false,  // don't auto-open browser (testing via phone/Telegram)
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
  },
})
