/**
 * src/utils/authSecurity.ts
 *
 * Client-side authentication replay protection utilities.
 *
 * Covers:
 * ─────────────────────────────────────────────────────
 * 1.  Login Nonce    — cryptographically random nonce generated per login
 *                      attempt; validated against the stored value after OAuth
 *                      completes to detect replay attacks.
 * 2.  CSRF Token     — per-session token embedded in state; validated before
 *                      any state-mutating auth action is processed.
 * 3.  Session Expiry — mock sessions carry an absolute expiry timestamp;
 *                      expired sessions are immediately cleared.
 * 4.  Session ID     — random session ID regenerated on every login to prevent
 *                      session fixation attacks.
 * 5.  Request Dedup  — tracks the last login attempt timestamp; rejects
 *                      duplicate requests within a configurable cool-down window.
 * 6.  HTTPS check    — warns and redirects to HTTPS on insecure origins.
 *
 * NOTE: Supabase Auth (live mode) handles JWT expiry, refresh-token rotation,
 * and nonce injection inside its own OAuth 2.0 PKCE flow managed by Google.
 * These utilities apply exclusively to the mock-auth development path and
 * serve as a documented reference for what the backend must enforce.
 */

// ─── Configuration ─────────────────────────────────────────────────────────────

/** Mock session lifetime: 8 hours (milliseconds) */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

/** Minimum milliseconds between login attempts (duplicate request guard) */
const LOGIN_COOLDOWN_MS = 2000;

// ─── Storage keys ───────────────────────────────────────────────────────────────

const KEY_NONCE       = 'engage_ai_auth_nonce';
const KEY_CSRF        = 'engage_ai_csrf_token';
const KEY_SESSION_ID  = 'engage_ai_session_id';
const KEY_SESSION_EXP = 'engage_ai_session_exp';
const KEY_LAST_LOGIN  = 'engage_ai_last_login_ts';

// ─── Crypto helpers ─────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically secure random hex string using
 * the Web Crypto API. Never uses Math.random().
 */
function generateSecureToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── HTTPS enforcement ───────────────────────────────────────────────────────────

/**
 * Redirects the browser to the HTTPS equivalent of the current URL if running
 * on plain HTTP in production. Safe to call on mount.
 *
 * Skipped on localhost / 127.0.0.1 to avoid breaking local development.
 */
export function enforceHttps(): void {
  if (typeof window === 'undefined') return;
  const { protocol, hostname, href } = window.location;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  if (protocol === 'http:' && !isLocalhost) {
    window.location.replace(href.replace(/^http:/, 'https:'));
  }
}

// ─── CSRF Token ──────────────────────────────────────────────────────────────────

/**
 * Generates and stores a new CSRF token for the current session.
 * Call once after the user authenticates.
 */
export function issueCsrfToken(): string {
  const token = generateSecureToken(24);
  sessionStorage.setItem(KEY_CSRF, token);
  return token;
}

/**
 * Returns the current CSRF token, or null if the session has no token.
 */
export function getCsrfToken(): string | null {
  return sessionStorage.getItem(KEY_CSRF);
}

/**
 * Validates an inbound CSRF token against the stored session token.
 * Returns true only if both are non-empty and identical.
 */
export function validateCsrfToken(inboundToken: string): boolean {
  const stored = sessionStorage.getItem(KEY_CSRF);
  if (!stored || !inboundToken) return false;
  // Constant-time comparison to prevent timing attacks
  if (stored.length !== inboundToken.length) return false;
  let mismatch = 0;
  for (let i = 0; i < stored.length; i++) {
    mismatch |= stored.charCodeAt(i) ^ inboundToken.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Clears the CSRF token on logout.
 */
export function clearCsrfToken(): void {
  sessionStorage.removeItem(KEY_CSRF);
}

// ─── Login Nonce ─────────────────────────────────────────────────────────────────

/**
 * Generates and stores a login nonce before the OAuth popup opens.
 * The nonce must be validated after the OAuth response returns.
 *
 * In Supabase live mode this is handled internally by the SDK's PKCE flow.
 * For mock auth this provides equivalent replay protection.
 */
export function issueLoginNonce(): string {
  const nonce = generateSecureToken(16);
  sessionStorage.setItem(KEY_NONCE, nonce);
  return nonce;
}

/**
 * Validates and immediately consumes the stored login nonce.
 * Returns true only if the provided nonce matches the stored one.
 * The stored nonce is cleared regardless of outcome (single-use).
 */
export function validateAndConsumeNonce(providedNonce: string): boolean {
  const stored = sessionStorage.getItem(KEY_NONCE);
  sessionStorage.removeItem(KEY_NONCE); // consume immediately — single-use

  if (!stored || !providedNonce) return false;
  if (stored.length !== providedNonce.length) return false;

  let mismatch = 0;
  for (let i = 0; i < stored.length; i++) {
    mismatch |= stored.charCodeAt(i) ^ providedNonce.charCodeAt(i);
  }
  return mismatch === 0;
}

// ─── Session ID (Fixation Prevention) ────────────────────────────────────────────

/**
 * Generates a new session ID and stores it in sessionStorage.
 * Called on every login to prevent session fixation.
 */
export function rotateSessionId(): string {
  const sessionId = generateSecureToken(20);
  sessionStorage.setItem(KEY_SESSION_ID, sessionId);
  return sessionId;
}

/**
 * Returns the current session ID, or null if no session is active.
 */
export function getCurrentSessionId(): string | null {
  return sessionStorage.getItem(KEY_SESSION_ID);
}

/**
 * Clears the session ID on logout.
 */
export function clearSessionId(): void {
  sessionStorage.removeItem(KEY_SESSION_ID);
}

// ─── Session Expiry ───────────────────────────────────────────────────────────────

/**
 * Records an absolute session expiry timestamp (now + SESSION_TTL_MS).
 * Called immediately after login.
 */
export function recordSessionExpiry(): void {
  const expiry = Date.now() + SESSION_TTL_MS;
  sessionStorage.setItem(KEY_SESSION_EXP, String(expiry));
}

/**
 * Checks whether the current mock session has expired.
 * Returns true if the session is expired or no expiry record exists.
 */
export function isSessionExpired(): boolean {
  const raw = sessionStorage.getItem(KEY_SESSION_EXP);
  if (!raw) return true;
  const expiry = parseInt(raw, 10);
  if (isNaN(expiry)) return true;
  return Date.now() > expiry;
}

/**
 * Returns the number of milliseconds remaining in the session.
 * Returns 0 if expired.
 */
export function sessionTimeRemaining(): number {
  const raw = sessionStorage.getItem(KEY_SESSION_EXP);
  if (!raw) return 0;
  const expiry = parseInt(raw, 10);
  if (isNaN(expiry)) return 0;
  return Math.max(0, expiry - Date.now());
}

/**
 * Clears session expiry record on logout.
 */
export function clearSessionExpiry(): void {
  sessionStorage.removeItem(KEY_SESSION_EXP);
}

// ─── Duplicate Request Guard ──────────────────────────────────────────────────────

/**
 * Checks if a login attempt is a duplicate (submitted within the cooldown window).
 * Returns true if the attempt is safe to proceed, false if it should be rejected.
 *
 * Records the current timestamp on success.
 */
export function checkAndRecordLoginAttempt(): boolean {
  const raw = localStorage.getItem(KEY_LAST_LOGIN);
  const now = Date.now();

  if (raw) {
    const last = parseInt(raw, 10);
    if (!isNaN(last) && now - last < LOGIN_COOLDOWN_MS) {
      return false; // duplicate — too fast
    }
  }

  localStorage.setItem(KEY_LAST_LOGIN, String(now));
  return true;
}

// ─── Full session teardown ────────────────────────────────────────────────────────

/**
 * Clears ALL auth security tokens from both sessionStorage and localStorage.
 * Call on logout to ensure a clean state for the next user.
 */
export function teardownSession(): void {
  clearCsrfToken();
  clearSessionId();
  clearSessionExpiry();
  sessionStorage.removeItem(KEY_NONCE);
  // Note: KEY_LAST_LOGIN is intentionally kept to prevent immediate re-login spam
}

// ─── Session bootstrap (called on login success) ──────────────────────────────────

/**
 * Bootstraps a fresh security session after successful authentication.
 * - Rotates the session ID
 * - Issues a new CSRF token
 * - Records session expiry
 *
 * @returns The new CSRF token (should be stored in React state for use in forms)
 */
export function bootstrapSession(): { sessionId: string; csrfToken: string } {
  const sessionId = rotateSessionId();
  const csrfToken = issueCsrfToken();
  recordSessionExpiry();
  return { sessionId, csrfToken };
}
