import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:8787' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npm run build && npx wrangler dev --config packages/api/wrangler.jsonc --port 8787',
    url: 'http://localhost:8787',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
