import React, { useMemo, useState } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import {
  DECISION_META,
  ALL_DECISION_ACTIONS,
} from '../utils/commentMeta';
import type { DecisionAction } from '../utils/commentMeta';
import {
  Zap,
  BarChart2,
  ChevronDown,
  CheckCircle2,
  EyeOff,
  ThumbsUp,
  Heart,
  Flag,
  AlertTriangle,
  VolumeX,
  RotateCcw,
  Crown,
  UserCheck,
} from 'lucide-react';

// ── Icon map for decision actions ──────────────────────────────────────────────
const DECISION_ICONS: Record<DecisionAction, React.ReactNode> = {
  reply: <CheckCircle2 className="w-4 h-4" />,
  ignore: <VolumeX className="w-4 h-4" />,
  like: <ThumbsUp className="w-4 h-4" />,
  heart: <Heart className="w-4 h-4" />,
  hide: <EyeOff className="w-4 h-4" />,
  escalate: <AlertTriangle className="w-4 h-4" />,
  flag: <Flag className="w-4 h-4" />,
  review: <RotateCcw className="w-4 h-4" />,
};

// ── Decision score bar ─────────────────────────────────────────────────────────
function DecisionBar({ action, count, total }: { action: DecisionAction; count: number; total: number }) {
  const meta = DECISION_META[action];
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  const barColors: Record<DecisionAction, string> = {
    reply: 'bg-indigo-500',
    ignore: 'bg-slate-400',
    like: 'bg-blue-500',
    heart: 'bg-rose-500',
    hide: 'bg-amber-500',
    escalate: 'bg-orange-500',
    flag: 'bg-red-600',
    review: 'bg-violet-500',
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`flex items-center gap-2 w-36 text-sm font-semibold ${meta.badge.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
        <span className="text-base">{meta.emoji}</span>
        <span className="truncate">{meta.label}</span>
      </div>
      <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColors[action]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-16 text-right">
        {count} <span className="text-slate-400">({pct}%)</span>
      </span>
    </div>
  );
}

// ── Comment queue row ──────────────────────────────────────────────────────────
function QueueRow({
  comment,
  videoId: _videoId,
  onOverride,
}: {
  comment: any;
  videoId: string;
  onOverride: (commentId: string, decision: DecisionAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const dec = comment.aiDecision ?? 'reply';
  const meta = DECISION_META[dec as DecisionAction] ?? DECISION_META.reply;

  return (
    <div className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
      {/* Avatar */}
      <img
        src={comment.authorAvatar}
        alt={comment.authorName}
        className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 flex-shrink-0 object-cover mt-0.5"
      />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{comment.authorName}</span>
          {comment.isMember && <Crown className="w-3.5 h-3.5 text-violet-500" />}
          {comment.isVerified && <UserCheck className="w-3.5 h-3.5 text-blue-500" />}
          <span className="text-[10px] text-slate-400 font-mono">{comment.publishedAt}</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">{comment.text}</p>
        {comment.aiDecisionReason && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            🤖 {comment.aiDecisionReason}
          </p>
        )}
      </div>

      {/* Decision selector */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${meta.badge}`}
        >
          {DECISION_ICONS[dec as DecisionAction]}
          <span>{meta.label}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 z-30 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden">
            {ALL_DECISION_ACTIONS.map(action => {
              const m = DECISION_META[action];
              return (
                <button
                  key={action}
                  onClick={() => { onOverride(comment.id, action); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left ${action === dec ? 'bg-slate-50 dark:bg-slate-800/60' : ''}`}
                >
                  <span className={`flex items-center gap-1.5 ${m.badge.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
                    {DECISION_ICONS[action]}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{m.emoji} {m.label}</span>
                  {action === dec && <span className="ml-auto text-violet-500">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export const DecisionEnginePage: React.FC = () => {
  const { analyzedVideos, currentVideo, setCurrentVideoById, applyDecision, reclassifyComments } = useDashboard();
  const [filterAction, setFilterAction] = useState<DecisionAction | 'all'>('all');
  const [isReclassifying, setIsReclassifying] = useState(false);

  const video = currentVideo ?? analyzedVideos[0] ?? null;

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!video) return null;
    const counts: Partial<Record<DecisionAction, number>> = {};
    video.comments.forEach(c => {
      const d = (c.aiDecision as DecisionAction) ?? 'reply';
      counts[d] = (counts[d] ?? 0) + 1;
    });
    return { counts, total: video.comments.length };
  }, [video]);

  // ── Filtered queue ────────────────────────────────────────────────────────────
  const queue = useMemo(() => {
    if (!video) return [];
    const sorted = [...video.comments].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
    if (filterAction === 'all') return sorted;
    return sorted.filter(c => (c.aiDecision ?? 'reply') === filterAction);
  }, [video, filterAction]);

  const handleReclassify = async () => {
    if (!video) return;
    setIsReclassifying(true);
    try {
      await reclassifyComments(video.id);
    } finally {
      setIsReclassifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Decision Engine</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">AI decides the best action before drafting any reply</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Video selector */}
          {analyzedVideos.length > 1 && (
            <select
              value={video?.id ?? ''}
              onChange={e => setCurrentVideoById(e.target.value)}
              className="text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {analyzedVideos.map(v => (
                <option key={v.id} value={v.id}>{v.title.slice(0, 40)}…</option>
              ))}
            </select>
          )}

          {/* Re-run button */}
          <button
            onClick={handleReclassify}
            disabled={isReclassifying || !video}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-500/20"
          >
            <RotateCcw className={`w-4 h-4 ${isReclassifying ? 'animate-spin' : ''}`} />
            {isReclassifying ? 'Re-running…' : 'Re-run Engine'}
          </button>
        </div>
      </div>

      {!video ? (
        <div className="py-24 text-center space-y-4">
          <Zap className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">Analyze a video first to run the Decision Engine</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT: Stats + Bar chart */}
          <div className="xl:col-span-1 space-y-5">

            {/* KPI summary cards */}
            <div className="grid grid-cols-2 gap-3">
              {(['reply', 'escalate', 'heart', 'flag'] as DecisionAction[]).map(action => {
                const meta = DECISION_META[action];
                const count = stats?.counts[action] ?? 0;
                return (
                  <button
                    key={action}
                    onClick={() => setFilterAction(prev => prev === action ? 'all' : action)}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-105 ${
                      filterAction === action
                        ? meta.badge + ' shadow-lg'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-400/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{meta.emoji}</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">{count}</div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{meta.label}</div>
                  </button>
                );
              })}
            </div>

            {/* Breakdown bar chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-violet-500" />
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Decision Breakdown</h3>
                <span className="ml-auto text-xs text-slate-400 font-mono">{stats?.total ?? 0} comments</span>
              </div>
              <div className="space-y-1">
                {ALL_DECISION_ACTIONS.map(action => (
                  <DecisionBar
                    key={action}
                    action={action}
                    count={stats?.counts[action] ?? 0}
                    total={stats?.total ?? 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Decision Queue */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
            {/* Queue header + filter pills */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white">Decision Queue</h3>
                <span className="text-xs text-slate-400 font-mono">{queue.length} comments</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterAction('all')}
                  className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                    filterAction === 'all'
                      ? 'bg-violet-500 text-white border-violet-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400'
                  }`}
                >
                  All
                </button>
                {ALL_DECISION_ACTIONS.map(action => {
                  const meta = DECISION_META[action];
                  const count = stats?.counts[action] ?? 0;
                  if (count === 0) return null;
                  return (
                    <button
                      key={action}
                      onClick={() => setFilterAction(prev => prev === action ? 'all' : action)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                        filterAction === action
                          ? meta.badge
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400'
                      }`}
                    >
                      {meta.emoji} {meta.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto max-h-[calc(100vh-280px)]">
              {queue.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Zap className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-sm font-semibold text-slate-400">No comments for this filter</p>
                </div>
              ) : (
                queue.map(comment => (
                  <QueueRow
                    key={comment.id}
                    comment={comment}
                    videoId={video.id}
                    onOverride={(commentId, decision) =>
                      applyDecision(video.id, commentId, decision, `Manually overridden to: ${decision}`)
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
