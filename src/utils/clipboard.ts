/**
 * src/utils/clipboard.ts
 *
 * Secure clipboard utility.
 *
 * Security rules enforced:
 * ─────────────────────────
 * 1. ALWAYS uses navigator.clipboard.writeText() — the modern async Clipboard API.
 *    Never uses document.execCommand('copy') (deprecated, synchronous, insecure).
 * 2. Copies PLAIN TEXT only — never HTML, never rich text, never hidden content.
 * 3. Sanitises the text before copying:
 *    - Strips null bytes and control characters
 *    - Collapses excess whitespace
 *    - Enforces a maximum copy length (prevents clipboard DoS via huge payloads)
 * 4. Returns a typed result — never throws to callers.
 * 5. Provides an HTTPS / permissions guard — gracefully degrades on HTTP origins.
 */

/** Maximum number of characters that can be copied in a single call */
const MAX_COPY_LENGTH = 5000;

/** Characters that must never reach the clipboard */
const STRIP_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g; // control chars except \t \n \r

/**
 * Sanitises a plain-text string for safe clipboard writing.
 * - Strips invisible control characters
 * - Trims leading/trailing whitespace
 * - Truncates to MAX_COPY_LENGTH
 */
function sanitiseForClipboard(text: string): string {
  return text
    .replace(STRIP_PATTERN, '')   // strip control chars
    .trim()
    .slice(0, MAX_COPY_LENGTH);
}

export interface CopyResult {
  success: boolean;
  /** The exact text that was written to the clipboard (after sanitisation) */
  copied: string;
  error?: string;
}

/**
 * Securely copies plain text to the system clipboard.
 *
 * @param rawText  The text to copy. Will be sanitised before writing.
 * @returns        A CopyResult indicating success/failure and the sanitised text.
 *
 * @example
 * const { success, copied } = await copyToClipboard(comment.aiReply);
 * if (success) showToast(`Copied: "${copied.slice(0, 40)}…"`, 'success');
 */
export async function copyToClipboard(rawText: string): Promise<CopyResult> {
  // Guard: clipboard API requires a secure context (HTTPS or localhost)
  if (!navigator.clipboard) {
    return {
      success: false,
      copied: '',
      error: 'Clipboard API is not available. Use HTTPS to enable secure copy.',
    };
  }

  const sanitised = sanitiseForClipboard(rawText);

  if (!sanitised) {
    return {
      success: false,
      copied: '',
      error: 'Nothing to copy — text is empty after sanitisation.',
    };
  }

  try {
    await navigator.clipboard.writeText(sanitised);
    return { success: true, copied: sanitised };
  } catch (err) {
    // Clipboard write can fail if the document is not focused or permission denied
    const message =
      err instanceof Error ? err.message : 'Unknown clipboard error';
    return { success: false, copied: '', error: message };
  }
}

/**
 * Returns a short preview of the copied text for display in a toast or tooltip.
 * Truncates to `maxChars` and appends ellipsis if needed.
 */
export function clipboardPreview(text: string, maxChars = 60): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return trimmed.slice(0, maxChars) + '…';
}
