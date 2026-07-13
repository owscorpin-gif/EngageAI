#!/usr/bin/env node
/**
 * scripts/check-env-secrets.js
 *
 * Build-time environment variable secret-leakage guard.
 *
 * Run before every build:
 *   node scripts/check-env-secrets.js
 *
 * Checks performed:
 *  1. Detects any VITE_ variable holding a value that matches known secret patterns.
 *  2. Verifies required public Firebase config variables are present.
 *  3. Warns if placeholder values haven't been replaced.
 *  4. Ensures no forbidden backend-only variable names are prefixed with VITE_.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── 1. Load all .env files present (do NOT fail if missing) ─────────────────
function loadEnvFile(filename) {
  const filepath = resolve(ROOT, filename);
  if (!existsSync(filepath)) return {};

  const content = readFileSync(filepath, 'utf-8');
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    vars[key] = value;
  }
  return vars;
}

const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
const allEnvVars = Object.assign({}, ...envFiles.map(loadEnvFile));

let hasErrors = false;
let hasWarnings = false;

// ─── 2. Secret pattern detection ─────────────────────────────────────────────
const SECRET_PATTERNS = [
  { label: 'OpenAI / Anthropic Secret Key',   pattern: /^sk-[A-Za-z0-9]{20,}/ },
  { label: 'AWS Access Key ID',                pattern: /^AKIA[0-9A-Z]{16}/ },
  { label: 'AWS Secret Access Key (32+ hex)',  pattern: /^[0-9a-f]{32,64}$/ },
  { label: 'Firebase Admin Service Account',   pattern: /service_account/i },
  { label: 'PEM Private Key',                  pattern: /-----BEGIN.*PRIVATE KEY-----/ },
  { label: 'Backend Service Role JWT (long)',   pattern: /^eyJ[A-Za-z0-9_-]{100,}/ },
  { label: 'Google Cloud Service Account Key', pattern: /"type":\s*"service_account"/ },
  { label: 'Stripe Secret Key',                pattern: /^sk_(live|test)_[A-Za-z0-9]{24,}/ },
  { label: 'GitHub Personal Access Token',     pattern: /^ghp_[A-Za-z0-9]{36}/ },
  { label: 'Gemini / Vertex AI Backend Key',   pattern: /^AIza[A-Za-z0-9_-]{35}/ },
];

// Forbidden variable name fragments — these should NEVER be in the frontend bundle
const FORBIDDEN_VAR_NAMES = [
  'SECRET', 'PRIVATE_KEY', 'SERVICE_ACCOUNT', 'SERVICE_ROLE_KEY',
  'DATABASE_URL', 'ADMIN_PASSWORD', 'SMTP_PASSWORD', 'REDIS_PASSWORD',
  'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'AWS_SECRET', 'STRIPE_SECRET',
];

console.log('\n🔍 Engage AI — Secret Leakage Guard\n' + '─'.repeat(45));

for (const [key, value] of Object.entries(allEnvVars)) {
  // Check if a VITE_ variable has a forbidden name
  if (key.startsWith('VITE_')) {
    for (const forbidden of FORBIDDEN_VAR_NAMES) {
      if (key.toUpperCase().includes(forbidden)) {
        console.error(`\n❌ CRITICAL: "${key}" has a forbidden name fragment ("${forbidden}").\n   Private backend credentials must NEVER be prefixed with VITE_.\n   Remove it from your .env file and use a server-side proxy instead.`);
        hasErrors = true;
      }
    }

    // Check if the value looks like a real secret
    for (const { label, pattern } of SECRET_PATTERNS) {
      if (pattern.test(value)) {
        console.error(`\n❌ CRITICAL: "${key}" appears to contain a ${label}.\n   Client-side bundles must never contain private credentials.\n   Move this to a backend environment variable (no VITE_ prefix).`);
        hasErrors = true;
      }
    }

    // Warn about unfilled placeholder values
    if (value.includes('your_') || value.includes('_here') || value === '' || value === 'undefined') {
      console.warn(`\n⚠  WARNING: "${key}" still contains a placeholder value.\n   Copy .env.example to .env and fill in real values to enable Supabase.`);
      hasWarnings = true;
    }
  }
}

// ─── 3. Required public variable check ───────────────────────────────────────
const REQUIRED_PUBLIC_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

const missing = REQUIRED_PUBLIC_VARS.filter(v => !allEnvVars[v]);
if (missing.length > 0) {
  console.warn(`\n⚠  WARNING: The following required variables are not set in any .env file:`);
  missing.forEach(v => console.warn(`   • ${v}`));
  console.warn(`   The app will run in Mock Auth Mode. Copy .env.example → .env to configure.`);
  hasWarnings = true;
}

// ─── 4. Result summary ───────────────────────────────────────────────────────
console.log('');
if (hasErrors) {
  console.error('💀 SECRET LEAKAGE GUARD FAILED — fix the errors above before building.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('✅ No secret leakage detected. (Warnings above are non-blocking.)\n');
} else {
  console.log('✅ All environment variables passed the secret leakage guard.\n');
}
