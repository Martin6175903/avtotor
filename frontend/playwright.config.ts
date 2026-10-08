import { resolve } from 'node:path';

import { defineConfig, devices } from '@playwright/test';

const backendDirectory = resolve(import.meta.dirname, '../backend');

const pythonExecutable = resolve(
  backendDirectory,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: [
    {
      command: `"${pythonExecutable}" -m uvicorn app.main:app --host 127.0.0.1 --port 8000`,
      cwd: backendDirectory,
      url: 'http://127.0.0.1:8000/health',
      reuseExistingServer: false,
    },
    {
      command: 'yarn dev --host 127.0.0.1 --port 5173 --strictPort',
      cwd: import.meta.dirname,
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: false,
    },
  ],
});
