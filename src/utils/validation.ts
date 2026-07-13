/**
 * src/utils/validation.ts
 *
 * Centralised Zod validation schemas for all user-supplied data.
 *
 * Security goals
 * ──────────────
 * • Reject unknown/extra fields (strict mode) — prevents prototype pollution
 *   and NoSQL operator injection via unexpected keys like { $gt, $where }.
 * • Reject nested objects where flat primitives are expected.
 * • Validate every ID, enum, email, URL, and UUID before storing or consuming.
 * • Provide safe parse helpers that return typed results without throwing.
 * • Strip operator-like strings from text fields.
 */

import { z } from 'zod';

// ─── Reusable primitive validators ───────────────────────────────────────────

/** YouTube video ID: 11 alphanumeric chars / hyphens / underscores */
export const YouTubeVideoIdSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{11}$/, 'Invalid YouTube video ID format');

/**
 * YouTube video URL: must be a real HTTPS YouTube/youtu.be URL.
 * Uses native URL parsing — not regex — to avoid ReDoS.
 */
export const YouTubeUrlSchema = z
  .string()
  .trim()
  .max(500, 'Input exceeds maximum length of 500 characters')
  .refine((val) => {
    // If it is directly an 11-char video ID, it's valid
    if (/^[A-Za-z0-9_-]{11}$/.test(val)) return true;
    try {
      const url = new URL(val);
      const isYouTube =
        url.hostname === 'www.youtube.com' ||
        url.hostname === 'youtube.com' ||
        url.hostname === 'youtu.be' ||
        url.hostname === 'm.youtube.com';
      return url.protocol === 'https:' && isYouTube;
    } catch {
      return false;
    }
  }, 'Must be a valid HTTPS YouTube URL or a 11-character Video ID');

/** Standard RFC-5321 email (max 254 chars per spec) */
export const EmailSchema = z
  .string()
  .trim()
  .min(3, 'Email is too short')
  .max(254, 'Email exceeds maximum allowed length')
  .email('Invalid email address format');

/** UUID v4 */
export const UuidSchema = z.string().uuid('Invalid UUID format');

/** Generic ID strings: alphanumeric, hyphens, underscores only */
export const SafeIdSchema = z
  .string()
  .trim()
  .min(1, 'ID cannot be empty')
  .max(128, 'ID exceeds maximum length')
  .regex(/^[A-Za-z0-9_\-]+$/, 'ID contains invalid characters');

/** Numeric rating 1–5 */
export const RatingSchema = z
  .number()
  .int('Rating must be a whole number')
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5');

/** Theme enum */
export const ThemeSchema = z.enum(['light', 'dark']);

/** Comment sentiment enum */
export const SentimentSchema = z.enum(['positive', 'neutral', 'negative', 'very_angry', 'excited']);

/** Comment category enum */
export const CategorySchema = z.enum([
  'Question',
  'Praise',
  'Criticism',
  'Spam',
  'Hate',
  'Suggestion',
  'Request',
  'Confused',
  'Funny',
  'Promotion',
  'Bot',
  'Negative',
  'Positive',
  'Technical Issue',
  'Timestamp',
  'Language',
  'Support Request'
]);

/** Comment status enum */
export const CommentStatusSchema = z.enum(['pending', 'replied', 'ignored']);

/** Feedback reason enum — only allow known reasons */
export const FeedbackReasonSchema = z.enum([
  'Too formal',
  'Wrong tone',
  'Incorrect details',
  'Too informal',
  'Other',
]);

// ─── NoSQL operator injection guard ──────────────────────────────────────────

/**
 * Detects MongoDB/Firestore operator-style injection attempts in a string.
 * Patterns: { "$gt": ... }, $where, $regex, $ne, etc.
 */
const OPERATOR_PATTERN = /\$[a-zA-Z]+/;

function noOperatorInjection(val: string): boolean {
  return !OPERATOR_PATTERN.test(val);
}

/** A safe free-text string that strips injection operators */
export const SafeTextSchema = (maxLen: number, label: string) =>
  z
    .string()
    .trim()
    .max(maxLen, `${label} must be ${maxLen} characters or less`)
    .refine(noOperatorInjection, {
      message: `${label} contains invalid operator characters`,
    });

// ─── Domain schemas ───────────────────────────────────────────────────────────

/**
 * Schema for a Comment object read back from localStorage.
 * Uses .strict() to reject any unexpected keys.
 */
export const CommentReplySchema = z
  .object({
    id: SafeIdSchema,
    authorName: SafeTextSchema(100, 'Author name'),
    authorAvatar: z.string().url('Author avatar must be a valid URL').max(500),
    text: SafeTextSchema(2000, 'Comment reply text'),
    publishedAt: z.string().max(50),
  })
  .strict();

export const CommentSchema = z
  .object({
    id: SafeIdSchema,
    authorName: SafeTextSchema(100, 'Author name'),
    authorAvatar: z.string().url('Author avatar must be a valid URL').max(500),
    text: SafeTextSchema(2000, 'Comment text'),
    publishedAt: z.string().max(50),
    sentiment: SentimentSchema,
    sentimentScore: z.number().int().min(0).max(100).optional(),
    emotion: z.enum(['happy', 'sad', 'angry', 'sarcastic', 'confused', 'neutral']).optional(),
    category: CategorySchema,
    priorityScore: z.number().int().min(0).max(100).optional(),
    priorityTier: z.enum(['highest', 'high', 'medium', 'low', 'ignore']).optional(),
    isSuperThanks: z.boolean().optional(),
    isMember: z.boolean().optional(),
    isVerified: z.boolean().optional(),
    thoughtfulnessScore: z.number().int().min(0).max(100).optional(),
    // Phase 8: Decision Engine
    aiDecision: z.enum(['reply', 'ignore', 'like', 'heart', 'hide', 'escalate', 'flag']).optional(),
    aiDecisionReason: z.string().max(300).optional(),
    aiReply: SafeTextSchema(1000, 'AI reply'),
    status: CommentStatusSchema,
    repliedText: SafeTextSchema(1000, 'Replied text').optional(),
    replies: z.array(CommentReplySchema).optional(),
    isPinned: z.boolean().optional(),
    orderType: z.enum(['top', 'newest']).optional(),
  })
  .strict();

/**
 * Schema for an AnalyzedVideo object read back from localStorage.
 */
export const AnalyzedVideoSchema = z
  .object({
    id: SafeIdSchema,
    url: YouTubeUrlSchema,
    title: SafeTextSchema(500, 'Video title'),
    channelTitle: SafeTextSchema(200, 'Channel title'),
    thumbnail: z.string().url('Thumbnail must be a valid URL').max(500),
    views: z.string().max(50),
    publishedAt: z.string().max(100),
    comments: z.array(CommentSchema),
    analyzedAt: z.string().datetime({ message: 'Invalid ISO timestamp' }),
    description: SafeTextSchema(15000, 'Video description').optional(),
    transcript: SafeTextSchema(20000, 'Video transcript').optional(),
    category: SafeTextSchema(100, 'Video category').optional(),
    keywords: z.array(SafeTextSchema(200, 'Keyword')).optional(),
    summary: SafeTextSchema(5000, 'Video summary').optional(),
    mainTopic: SafeTextSchema(1000, 'Video main topic').optional(),
    language: SafeTextSchema(100, 'Video language').optional(),
  })
  .strict();

/**
 * Schema for a LearningFeedback entry stored to localStorage.
 */
export const LearningFeedbackSchema = z
  .object({
    id: SafeIdSchema,
    commentText: SafeTextSchema(2000, 'Comment text'),
    originalReply: SafeTextSchema(1000, 'Original reply'),
    editedReply: SafeTextSchema(1000, 'Edited reply'),
    reason: FeedbackReasonSchema,
    rating: RatingSchema,
    submittedAt: z.string().max(50),
  })
  .strict();

/**
 * Schema for submitting new feedback (without id/submittedAt which are server-assigned).
 */
export const SubmitFeedbackSchema = LearningFeedbackSchema.omit({
  id: true,
  submittedAt: true,
});

/**
 * Schema for a prompt memory rule string.
 */
export const PromptRuleSchema = SafeTextSchema(200, 'Prompt memory rule');

/**
 * Schema for the array of prompt memory rules stored in localStorage.
 */
export const PromptRulesArraySchema = z.array(PromptRuleSchema).max(50, 'Too many prompt rules');

/**
 * Schema for the mock user profile stored in localStorage.
 */
export const MockUserProfileSchema = z
  .object({
    uid: SafeIdSchema,
    displayName: z.string().max(100).nullable(),
    email: EmailSchema.nullable(),
    photoURL: z.string().url().max(500).nullable(),
    channelId: z.string().max(100).optional(),
    channelName: z.string().max(100).optional(),
    accessToken: z.string().max(500).optional(),
    refreshToken: z.string().max(500).optional(),
    creatorSettings: z.object({
      youtubeComments: z.boolean(),
      youtubeStats: z.boolean(),
      autoReply: z.boolean(),
      personality: z.string().max(100)
    }).optional()
  })
  .strict();

/**
 * Schema for the global broadcast message.
 */
export const GlobalBroadcastSchema = z
  .string()
  .trim()
  .max(500, 'Broadcast message must be 500 characters or less')
  .refine(noOperatorInjection, { message: 'Broadcast contains invalid characters' });

// ─── Safe parse helpers ───────────────────────────────────────────────────────

/**
 * Safely parses a JSON string from localStorage and validates it against
 * a Zod schema. Returns the parsed value on success, or the fallback on failure.
 *
 * This prevents:
 *  - Malformed JSON from crashing the app
 *  - Tampered localStorage data bypassing type assumptions
 *  - Prototype pollution via unexpected keys
 *  - NoSQL operator injection via stored operator strings
 */
export function safeParseStorage<T>(
  key: string,
  schema: z.ZodSchema<T>,
  fallback: T
): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (result.success) return result.data;
    // Log validation failures in dev only
    if (import.meta.env.DEV) {
      console.warn(`[Validation] localStorage key "${key}" failed schema validation:`, result.error.flatten());
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Validates a single input value against a Zod schema.
 * Returns { success, data, error } — never throws.
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0];
  return { success: false, error: firstError?.message ?? 'Validation failed' };
}
