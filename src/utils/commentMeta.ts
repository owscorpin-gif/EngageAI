/**
 * commentMeta.ts
 * Single source of truth for comment categories (Phase 5) and
 * sentiment/emotion types (Phase 6). Imported by gemini.ts, context,
 * and all UI pages.
 */

// ─── Phase 5: 17 Comment Categories ─────────────────────────────────────────

export type CommentCategory =
  | 'Question'
  | 'Praise'
  | 'Criticism'
  | 'Spam'
  | 'Hate'
  | 'Suggestion'
  | 'Request'
  | 'Confused'
  | 'Funny'
  | 'Promotion'
  | 'Bot'
  | 'Negative'
  | 'Positive'
  | 'Technical Issue'
  | 'Timestamp'
  | 'Language'
  | 'Support Request'
  // Phase 10: Safety Layer
  | 'Politics'
  | 'Religion'
  | 'Threat'
  | 'Personal Attack'
  | 'Medical Advice'
  | 'Legal Advice'
  | 'Scam'
  | 'Adult Content';

export interface CategoryMeta {
  label: CommentCategory;
  emoji: string;
  /** Tailwind CSS classes for background, text, border */
  badge: string;
  /** Short description */
  description: string;
}

export const COMMENT_CATEGORIES: CategoryMeta[] = [
  {
    label: 'Question',
    emoji: '❓',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    description: 'Viewer is asking something',
  },
  {
    label: 'Praise',
    emoji: '🌟',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    description: 'Genuine compliment or appreciation',
  },
  {
    label: 'Criticism',
    emoji: '🔥',
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    description: 'Constructive or harsh negative feedback',
  },
  {
    label: 'Spam',
    emoji: '🚫',
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    description: 'Promotional or repetitive junk',
  },
  {
    label: 'Hate',
    emoji: '⚠️',
    badge: 'bg-rose-600/10 text-rose-700 dark:text-rose-400 border-rose-600/20',
    description: 'Abusive or harmful language',
  },
  {
    label: 'Suggestion',
    emoji: '💡',
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    description: 'Feature or content idea',
  },
  {
    label: 'Request',
    emoji: '📬',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    description: 'Asking for something specific',
  },
  {
    label: 'Confused',
    emoji: '🤔',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    description: "Viewer doesn't understand something",
  },
  {
    label: 'Funny',
    emoji: '😂',
    badge: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    description: 'Humour or meme comments',
  },
  {
    label: 'Promotion',
    emoji: '📢',
    badge: 'bg-orange-600/10 text-orange-700 dark:text-orange-400 border-orange-600/20',
    description: 'Third-party channel or product promotion',
  },
  {
    label: 'Bot',
    emoji: '🤖',
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    description: 'Automated bot-like behaviour',
  },
  {
    label: 'Negative',
    emoji: '👎',
    badge: 'bg-red-400/10 text-red-500 dark:text-red-400 border-red-400/20',
    description: 'General negativity',
  },
  {
    label: 'Positive',
    emoji: '👍',
    badge: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    description: 'General positivity',
  },
  {
    label: 'Technical Issue',
    emoji: '🔧',
    badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    description: 'Bug reports or playback issues',
  },
  {
    label: 'Timestamp',
    emoji: '⏱️',
    badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    description: 'References a specific video timestamp',
  },
  {
    label: 'Language',
    emoji: '🌐',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    description: 'Comment in a foreign language',
  },
  {
    label: 'Support Request',
    emoji: '🆘',
    badge: 'bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-600/20',
    description: 'User needs direct assistance',
  },
  // ── Phase 10: Safety Layer Categories ──
  {
    label: 'Politics',
    emoji: '🏛️',
    badge: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
    description: 'Political discussion',
  },
  {
    label: 'Religion',
    emoji: '🛐',
    badge: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
    description: 'Religious discussion',
  },
  {
    label: 'Threat',
    emoji: '☠️',
    badge: 'bg-red-600/10 text-red-700 dark:text-red-500 border-red-600/30',
    description: 'Threat of harm',
  },
  {
    label: 'Personal Attack',
    emoji: '🤺',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    description: 'Direct insult to creator or viewer',
  },
  {
    label: 'Medical Advice',
    emoji: '⚕️',
    badge: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
    description: 'Asking or giving medical advice',
  },
  {
    label: 'Legal Advice',
    emoji: '⚖️',
    badge: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
    description: 'Asking or giving legal advice',
  },
  {
    label: 'Scam',
    emoji: '🤑',
    badge: 'bg-orange-600/10 text-orange-700 dark:text-orange-400 border-orange-600/20',
    description: 'Financial scam or phishing',
  },
  {
    label: 'Adult Content',
    emoji: '🔞',
    badge: 'bg-rose-600/10 text-rose-700 dark:text-rose-500 border-rose-600/30',
    description: 'Sexually explicit material',
  }
];

/** Quick lookup: label → meta */
export const CATEGORY_META_MAP = new Map<CommentCategory, CategoryMeta>(
  COMMENT_CATEGORIES.map((c) => [c.label, c])
);

export function getCategoryMeta(label: string): CategoryMeta {
  return (
    CATEGORY_META_MAP.get(label as CommentCategory) ?? {
      label: 'Positive' as CommentCategory,
      emoji: '👍',
      badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      description: 'General',
    }
  );
}

// ─── Phase 6: Sentiment Scores + Emotions ────────────────────────────────────

export type SentimentScore =
  | 'positive'
  | 'neutral'
  | 'negative'
  | 'very_angry'
  | 'excited';

export type EmotionType =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'sarcastic'
  | 'confused'
  | 'neutral';

export interface SentimentMeta {
  label: SentimentScore;
  emoji: string;
  badge: string;
  /** 0-100 score used for progress bar rendering */
  scoreColor: string;
}

export const SENTIMENT_META: Record<SentimentScore, SentimentMeta> = {
  positive: {
    label: 'positive',
    emoji: '😊',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    scoreColor: 'bg-emerald-500',
  },
  neutral: {
    label: 'neutral',
    emoji: '😐',
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    scoreColor: 'bg-slate-400',
  },
  negative: {
    label: 'negative',
    emoji: '😞',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    scoreColor: 'bg-rose-500',
  },
  very_angry: {
    label: 'very_angry',
    emoji: '😡',
    badge: 'bg-red-600/10 text-red-700 dark:text-red-400 border-red-600/20',
    scoreColor: 'bg-red-600',
  },
  excited: {
    label: 'excited',
    emoji: '🤩',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    scoreColor: 'bg-amber-500',
  },
};

export interface EmotionMeta {
  label: EmotionType;
  emoji: string;
  badge: string;
}

export const EMOTION_META: Record<EmotionType, EmotionMeta> = {
  happy: {
    label: 'happy',
    emoji: '😊',
    badge: 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-300 border-yellow-400/20',
  },
  sad: {
    label: 'sad',
    emoji: '😢',
    badge: 'bg-blue-400/10 text-blue-500 dark:text-blue-300 border-blue-400/20',
  },
  angry: {
    label: 'angry',
    emoji: '😤',
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
  sarcastic: {
    label: 'sarcastic',
    emoji: '🙄',
    badge: 'bg-purple-400/10 text-purple-600 dark:text-purple-400 border-purple-400/20',
  },
  confused: {
    label: 'confused',
    emoji: '😕',
    badge: 'bg-amber-400/10 text-amber-600 dark:text-amber-400 border-amber-400/20',
  },
  neutral: {
    label: 'neutral',
    emoji: '😶',
    badge: 'bg-slate-400/10 text-slate-500 dark:text-slate-400 border-slate-400/20',
  },
};

/** All valid category label strings (for Gemini prompt injection) */
export const VALID_CATEGORIES = COMMENT_CATEGORIES.map((c) => c.label).join(', ');
export const VALID_SENTIMENTS: SentimentScore[] = ['positive', 'neutral', 'negative', 'very_angry', 'excited'];
export const VALID_EMOTIONS: EmotionType[] = ['happy', 'sad', 'angry', 'sarcastic', 'confused', 'neutral'];

// ─── Phase 7: Priority Score ──────────────────────────────────────────────────

export type PriorityTier = 'highest' | 'high' | 'medium' | 'low' | 'ignore';

export interface PriorityMeta {
  tier: PriorityTier;
  label: string;
  emoji: string;
  badge: string;
  /** Ring/glow for comment card border */
  ring: string;
  description: string;
}

export const PRIORITY_META: Record<PriorityTier, PriorityMeta> = {
  highest: {
    tier: 'highest',
    label: 'Highest',
    emoji: '🔴',
    badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    ring: 'border-red-400/40 dark:border-red-500/30 shadow-red-500/5',
    description: 'Requires immediate reply — Super Thanks, Member, pinned',
  },
  high: {
    tier: 'high',
    label: 'High',
    emoji: '🟠',
    badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
    ring: 'border-orange-400/40 dark:border-orange-500/30 shadow-orange-500/5',
    description: 'Important engagement — Question, Suggestion, Thoughtful',
  },
  medium: {
    tier: 'medium',
    label: 'Medium',
    emoji: '🟡',
    badge: 'bg-amber-400/15 text-amber-600 dark:text-amber-400 border-amber-400/30',
    ring: 'border-slate-200 dark:border-slate-800',
    description: 'Standard engagement — Positive, Feedback, Criticism',
  },
  low: {
    tier: 'low',
    label: 'Low',
    emoji: '🔵',
    badge: 'bg-slate-400/10 text-slate-500 dark:text-slate-500 border-slate-400/20',
    ring: 'border-slate-200/60 dark:border-slate-800/60',
    description: 'Minimal attention needed — Funny, Language, Promotion',
  },
  ignore: {
    tier: 'ignore',
    label: 'Ignore',
    emoji: '⚫',
    badge: 'bg-slate-200/60 text-slate-400 dark:text-slate-600 border-slate-300/20 dark:border-slate-700/20',
    ring: 'border-slate-100 dark:border-slate-900 opacity-60',
    description: 'Auto-muted — Spam, Hate, Bot',
  },
};

/**
 * Base priority score per category (0–100).
 * Multiplied by signals (membership, length, sentiment) to get final score.
 */
const CATEGORY_BASE_SCORE: Record<CommentCategory, number> = {
  'Question':        75,
  'Praise':          60,
  'Criticism':       65,
  'Spam':             5,
  'Hate':             5,
  'Suggestion':      80,
  'Request':         70,
  'Confused':        72,
  'Funny':           30,
  'Promotion':       10,
  'Bot':              5,
  'Negative':        45,
  'Positive':        40,
  'Technical Issue': 78,
  'Timestamp':       35,
  'Language':        20,
  'Support Request': 82,
  'Politics':        20,
  'Religion':        20,
  'Threat':           5,
  'Personal Attack':  5,
  'Medical Advice':  20,
  'Legal Advice':    20,
  'Scam':             5,
  'Adult Content':    5,
};

/**
 * Compute a priority score (0–100) and tier for a comment.
 *
 * Signals applied on top of category base score:
 *  +20  isSuperThanks (Super Chat / Super Thanks)
 *  +20  isMember      (channel member / sponsor)
 *  +15  isPinned
 *  +10  isVerified    (author is verified creator)
 *  +12  text length > 300 chars (thoughtful comment)
 *  +6   text length > 150 chars
 *  +8   sentiment === 'very_angry'   (needs de-escalation)
 *  +5   sentiment === 'excited'
 *  +5   thoughtfulnessScore (Gemini 0-100 / 20, bonus up to 5)
 */
export interface PrioritySignals {
  isSuperThanks?: boolean;
  isMember?: boolean;
  isPinned?: boolean;
  isVerified?: boolean;
  textLength: number;
  sentiment: SentimentScore;
  /** Optional Gemini-supplied 0-100 thoughtfulness score */
  thoughtfulnessScore?: number;
}

export function computePriorityScore(
  category: CommentCategory,
  signals: PrioritySignals
): { score: number; tier: PriorityTier } {
  let score = CATEGORY_BASE_SCORE[category] ?? 40;

  // Hard-override ignore categories regardless of signals
  if (category === 'Spam' || category === 'Hate' || category === 'Bot') {
    return { score: 5, tier: 'ignore' };
  }

  // Apply signal bonuses
  if (signals.isSuperThanks) score += 30;
  if (signals.isMember)      score += 30;
  if (signals.isPinned)      score += 15;
  if (signals.isVerified)    score += 10;

  if (signals.textLength > 300)      score += 12;
  else if (signals.textLength > 150) score += 6;

  if (signals.sentiment === 'very_angry') score += 8;
  else if (signals.sentiment === 'excited') score += 5;

  if (signals.thoughtfulnessScore !== undefined) {
    score += Math.round(signals.thoughtfulnessScore / 20); // 0–5 bonus
  }

  // Clamp to 0–100
  score = Math.min(100, Math.max(0, score));

  // Map score to tier
  let tier: PriorityTier;
  if (score >= 90)      tier = 'highest';
  else if (score >= 68) tier = 'high';
  else if (score >= 38) tier = 'medium';
  else if (score >= 15) tier = 'low';
  else                  tier = 'ignore';

  return { score, tier };
}

// ─── Phase 8: Decision Engine ──────────────────────────────────────────────────
// Phase 10: Added 'review'

export type DecisionAction = 'reply' | 'ignore' | 'like' | 'heart' | 'hide' | 'escalate' | 'flag' | 'review';

export interface DecisionMeta {
  action: DecisionAction;
  label: string;
  emoji: string;
  badge: string;
  description: string;
}

export const DECISION_META: Record<DecisionAction, DecisionMeta> = {
  reply: {
    action: 'reply',
    label: 'AI Draft Reply',
    emoji: '✍️',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    description: 'Formulate an automated or custom context-aware draft reply',
  },
  ignore: {
    action: 'ignore',
    label: 'Ignore/Mute',
    emoji: '🔇',
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    description: 'No response or attention required',
  },
  like: {
    action: 'like',
    label: 'Recommended Like',
    emoji: '👍',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    description: 'Thumbs up the comment to boost creator engagement',
  },
  heart: {
    action: 'heart',
    label: 'Recommended Heart',
    emoji: '❤️',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    description: 'Give comment creator heart for high quality appreciation',
  },
  hide: {
    action: 'hide',
    label: 'Hide Comment',
    emoji: '🙈',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    description: 'Hide comment from public feed due to self-promotion or spam',
  },
  escalate: {
    action: 'escalate',
    label: 'Escalate to Creator',
    emoji: '🚨',
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    description: 'Needs direct creator review (Support request, bug report, criticism)',
  },
  flag: {
    action: 'flag',
    label: 'Flag & Report',
    emoji: '🚩',
    badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    description: 'Report hate speech, harassment, or dangerous links',
  },
  review: {
    action: 'review',
    label: 'Needs Human Review',
    emoji: '🛡️',
    badge: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/30 font-bold',
    description: 'Safety flag — sensitive topic requires direct creator review',
  },
};

// ─── Deterministic Decision Fallback ─────────────────────────────────────────
/**
 * computeDecision — maps category + priorityTier + sentiment → DecisionAction.
 * Used as a fallback when Gemini is unavailable or for instant local decisions.
 *
 * Returns { action, reason } so UI can show the AI's reasoning.
 */
export interface ComputedDecision {
  action: DecisionAction;
  reason: string;
}

export function computeDecision(
  category: CommentCategory,
  priorityTier: PriorityTier,
  sentiment: SentimentScore,
  isMember = false,
  isSuperThanks = false,
  isVerified = false,
  thoughtfulnessScore = 0
): ComputedDecision {
  // Phase 10: Safety Layer fallback intercept
  const safetyCategories = [
    'Politics', 'Religion', 'Threat', 'Personal Attack',
    'Medical Advice', 'Legal Advice', 'Scam', 'Adult Content'
  ];
  if (safetyCategories.includes(category)) {
    return {
      action: 'review',
      reason: 'Safety protocol: sensitive topic.'
    };
  }

  // ── Hard rules by category ─────────────────────────────────────────────────
  if (category === 'Hate') {
    return { action: 'flag', reason: 'Hate speech detected — flagging for moderation.' };
  }
  if (category === 'Spam' || category === 'Bot') {
    return { action: 'hide', reason: 'Spam or bot comment — hiding from public feed.' };
  }
  if (category === 'Promotion') {
    return { action: 'hide', reason: 'Self-promotion detected — hiding to protect channel.' };
  }

  // ── Escalation triggers ────────────────────────────────────────────────────
  if (category === 'Technical Issue') {
    return { action: 'escalate', reason: 'Bug report or technical issue — needs creator review.' };
  }
  if (category === 'Support Request') {
    return { action: 'escalate', reason: 'Support request requiring direct creator attention.' };
  }
  if (sentiment === 'very_angry' && (category === 'Criticism' || category === 'Negative')) {
    return { action: 'escalate', reason: 'Very angry criticism — creator should respond personally to de-escalate.' };
  }

  // ── Reply triggers ─────────────────────────────────────────────────────────
  if (category === 'Question') {
    return { action: 'reply', reason: 'Direct question asked — AI reply drafted.' };
  }
  if (category === 'Confused') {
    return { action: 'reply', reason: 'Viewer is confused — clarification reply drafted.' };
  }
  if (category === 'Request') {
    return { action: 'reply', reason: 'Content/feature request — acknowledge and respond.' };
  }
  if (category === 'Criticism') {
    return { action: 'reply', reason: 'Constructive criticism — thank and address.' };
  }
  if (isSuperThanks) {
    return { action: 'reply', reason: 'Super Thanks received — always acknowledge and thank.' };
  }
  if (isMember && category === 'Suggestion') {
    return { action: 'reply', reason: 'Channel member with a suggestion — prioritised reply.' };
  }
  if (isVerified) {
    return { action: 'reply', reason: 'Verified creator/channel — always engage.' };
  }

  // ── Heart triggers ─────────────────────────────────────────────────────────
  if (
    (category === 'Praise' || category === 'Positive') &&
    (sentiment === 'excited' || isMember || (thoughtfulnessScore >= 75))
  ) {
    return { action: 'heart', reason: 'Exceptional praise or loyal member — heart this comment.' };
  }

  // ── Like triggers ──────────────────────────────────────────────────────────
  if (category === 'Praise' || category === 'Positive' || category === 'Funny') {
    return { action: 'like', reason: 'Positive comment — a like keeps engagement high without extra effort.' };
  }

  // ── Ignore (low signal) ────────────────────────────────────────────────────
  if (category === 'Timestamp' || category === 'Language') {
    return { action: 'ignore', reason: 'Low-signal comment — no action needed.' };
  }
  if (priorityTier === 'low' || priorityTier === 'ignore') {
    return { action: 'ignore', reason: 'Low priority — safely skipped.' };
  }

  // ── Default fallback ───────────────────────────────────────────────────────
  return { action: 'reply', reason: 'General comment — drafting a context-aware reply.' };
}

export const ALL_DECISION_ACTIONS: DecisionAction[] = [
  'reply', 'ignore', 'like', 'heart', 'hide', 'escalate', 'flag', 'review'
];
