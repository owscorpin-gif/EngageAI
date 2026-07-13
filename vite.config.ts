import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables for the current mode.
  // Only variables prefixed with VITE_ are exposed to the client bundle.
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  // ─── Build-time secret-leakage guard ───────────────────────────────────────
  // Fail the build immediately if any VITE_ variable contains patterns that
  // look like private backend secrets (service account keys, OpenAI keys, etc.).
  const FORBIDDEN_PATTERNS = [
    /^sk-[A-Za-z0-9]{20,}/,          // OpenAI / Anthropic secret keys
    /^AKIA[0-9A-Z]{16}/,             // AWS Access Key IDs
    /^[0-9a-f]{64}$/,                // 64-char hex (typical service account secrets)
    /service_account/i,              // Firebase Admin SDK service account JSON fragments
    /-----BEGIN (RSA|EC|PGP|OPENSSH) PRIVATE KEY-----/, // PEM private keys
  ];

  for (const [key, value] of Object.entries(env)) {
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(value)) {
        throw new Error(
          `\n\n🚨 SECRET LEAKAGE DETECTED 🚨\n` +
          `Environment variable "${key}" appears to contain a private credential.\n` +
          `Private keys and service-account secrets must NEVER be prefixed with VITE_.\n` +
          `Remove it from your .env file and move it to a backend environment.\n`
        );
      }
    }
  }

  return {
    plugins: [react(), tailwindcss()],

    // ─── Restrict which env variables reach the browser bundle ───────────────
    // ONLY variables that start with VITE_ are injected into the client.
    // Any secret added without this prefix will NOT appear in the bundle.
    envPrefix: 'VITE_',

    build: {
      // ─── Disable source maps in production ───────────────────────────────
      // Source maps expose original source code in the browser DevTools,
      // which can reveal internal logic, comments, and env-variable references.
      sourcemap: mode !== 'production',

      // Raise chunk size warning limit (informational only)
      chunkSizeWarningLimit: 600,
    },
  };
});
