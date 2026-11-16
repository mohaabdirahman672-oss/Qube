// Shared settings for the browser tests. Override with env vars if needed.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Any Chromium-based browser works (Edge ships with Windows; Chrome elsewhere).
export const BROWSER = process.env.QUBE_TEST_BROWSER
  || (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
    : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : '/usr/bin/google-chrome');
// The running `expo start --web --port 8099` dev server.
export const APP_URL = process.env.QUBE_APP_URL || 'http://localhost:8099';
// Screenshots (gitignored).
export const SHOTS = join(import.meta.dirname, '.shots') + '/';
mkdirSync(SHOTS, { recursive: true });
