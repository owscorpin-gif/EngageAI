import React, { useState, useMemo } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import {
  COMMENT_CATEGORIES,
  SENTIMENT_META,
  EMOTION_META,
  getCategoryMeta,
  PRIORITY_META,
} from '../utils/commentMeta';
import type { CommentCategory, SentimentScore, EmotionType } from '../utils/commentMeta';
import {
  Tag,
  RefreshCw,
  BarChart2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Filter,
  Sparkles,
  CheckSquare,
  Square,
  Ban,
  Send,
  AlertTriangle,
  Crown,
  Heart,
  Award,
  UserCheck,
} from 'lucide-react';

// ─── Mini SVG donut chart ─────────────────────────────────────────────────────
interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ slices }: { slices: DonutSlice[] }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  const radius = 60;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const arcs = slices
    .filter((sl) => sl.value > 0)
    .map((sl) => {
      const portion = sl.value / total;
      const dash = circumference * portion;
      const gap = circumference - dash;
      const arc = { ...sl, dash, gap, offset: circumference - offset };
      offset += dash;
      return arc;
    });

  return (
    <svg viewBox="0 0 160 160" className="w-full h-full">
      <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor"
        className="text-slate-100 dark:text-slate-800" strokeWidth={stroke} />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={arc.offset}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease' }}
          transform="rotate(-90 80 80)"
        />
      ))}
      <text x="80" y="76" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200"
        fontSize="18" fontWeight="bold">{total}</text>
      <text x="80" y="92" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500"
        fontSize="10">comments</text>
    </svg>
  );
}

// ─── Sentiment bar row ────────────────────────────────────────────────────────
function SentimentBar({ label, count, total, meta }: {
  label: SentimentScore; count: number; total: number;
  meta: typeof SENTIMENT_META[SentimentScore];
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-7 text-center">{meta.emoji}</span>
      <div className="flex-1 space-y-0.5">
        <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          <span className="capitalize">{label.replace('_', ' ')}</span>
          <span>{count} <span className="text-slate-400 dark:text-slate-500 font-normal">({pct}%)</span></span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${meta.scoreColor} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const DONUT_PALETTE = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#0ea5e9',
  '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#a3e635',
  '#38bdf8', '#fb7185',
];

export const CategorizePage: React.FC = () => {
  const { analyzedVideos, currentVideo, setCurrentVideoById, reclassifyComments, approveReply, ignoreComment } =
    useDashboard();

  const [isReclassifying, setIsReclassifying] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CommentCategory | 'all'>('all');
  const [activeSentiment, setActiveSentiment] = useState<SentimentScore | 'all'>('all');
  const [activeEmotion, setActiveEmotion] = useState<EmotionType | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(true);

  const video = currentVideo ?? analyzedVideos[0] ?? null;

  // ── Stats derived from video comments ──────────────────────────────────────
  const stats = useMemo(() => {
    if (!video) return null;
    const comments = video.comments;
    const total = comments.length;

    const catCounts: Partial<Record<CommentCategory, number>> = {};
    const sentCounts: Partial<Record<SentimentScore, number>> = {};
    const emotCounts: Partial<Record<EmotionType, number>> = {};

    comments.forEach((c) => {
      catCounts[c.category] = (catCounts[c.category] ?? 0) + 1;
      sentCounts[c.sentiment] = (sentCounts[c.sentiment] ?? 0) + 1;
      if (c.emotion) emotCounts[c.emotion] = (emotCounts[c.emotion] ?? 0) + 1;
    });

    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
    const spamPct = total > 0 ? Math.round(((catCounts['Spam'] ?? 0) / total) * 100) : 0;
    const questionPct = total > 0 ? Math.round(((catCounts['Question'] ?? 0) / total) * 100) : 0;
    const hatePct = total > 0 ? Math.round(((catCounts['Hate'] ?? 0) / total) * 100) : 0;
    const avgScore =
      total > 0
        ? Math.round(comments.reduce((s, c) => s + (c.sentimentScore ?? 70), 0) / total)
        : 0;

    return { total, catCounts, sentCounts, emotCounts, topCategory, spamPct, questionPct, hatePct, avgScore };
  }, [video]);

  // ── Donut slices ────────────────────────────────────────────────────────────
  const donutSlices: DonutSlice[] = useMemo(() => {
    if (!stats) return [];
    return COMMENT_CATEGORIES.filter((m) => (stats.catCounts[m.label] ?? 0) > 0).map((m, i) => ({
      label: m.label,
      value: stats.catCounts[m.label] ?? 0,
      color: DONUT_PALETTE[i % DONUT_PALETTE.length],
    }));
  }, [stats]);

  // ── Filtered comments ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!video) return [];
    return video.comments.filter((c) => {
      const catMatch = activeCategory === 'all' || c.category === activeCategory;
      const sentMatch = activeSentiment === 'all' || c.sentiment === activeSentiment;
      const emotMatch = activeEmotion === 'all' || c.emotion === activeEmotion;
      return catMatch && sentMatch && emotMatch;
    });
  }, [video, activeCategory, activeSentiment, activeEmotion]);

  // ── Selection helpers ───────────────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = () => setSelectedIds(new Set(filtered.map((c) => c.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const bulkIgnore = () => {
    if (!video) return;
    selectedIds.forEach((id) => ignoreComment(video.id, id));
    clearSelection();
  };

  const bulkApprove = () => {
    if (!video) return;
    selectedIds.forEach((id) => {
      const c = video.comments.find((x) => x.id === id);
      if (c && c.status === 'pending') approveReply(video.id, id, c.aiReply);
    });
    clearSelection();
  };

  const handleReclassify = async () => {
    if (!video) return;
    setIsReclassifying(true);
    try {
      await reclassifyComments(video.id);
    } finally {
      setIsReclassifying(false);
    }
  };

  // ── Sentiment score display color ───────────────────────────────────────────
  const scoreGradient = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-400';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/20">
              <Tag className="w-6 h-6" />
            </span>
            Comment Categorization
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            AI-powered 17-category classification · 5-way sentiment scoring · emotion detection
          </p>
        </div>

        {/* Video Selector */}
        {analyzedVideos.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={video?.id ?? ''}
              onChange={(e) => setCurrentVideoById(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
            >
              {analyzedVideos.map((v) => (
                <option key={v.id} value={v.id}>{v.title.slice(0, 50)}</option>
              ))}
            </select>
            <button
              onClick={handleReclassify}
              disabled={isReclassifying || !video}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-bold shadow-md shadow-violet-500/20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              title="Re-run Gemini to re-classify all comments with Phase 5+6 schema"
            >
              <RefreshCw className={`w-4 h-4 ${isReclassifying ? 'animate-spin' : ''}`} />
              <span>{isReclassifying ? 'Re-classifying…' : 'Re-Classify All'}</span>
            </button>
          </div>
        )}
      </div>

      {!video ? (
        /* ── Empty state ── */
        <div className="glass-panel rounded-3xl p-16 text-center space-y-4 animate-slide-in">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-xl text-slate-800 dark:text-slate-200">
            No Videos Analyzed Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Analyze a video on the <strong>Analyze Video</strong> page first to see comment categories here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Top Stats Strip ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Comments', value: stats?.total ?? 0, icon: '💬', color: 'from-violet-500/10 to-indigo-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400' },
              { label: 'Top Category', value: stats?.topCategory ?? '—', icon: '🏆', color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' },
              { label: 'Spam & Hate', value: `${(stats?.spamPct ?? 0) + (stats?.hatePct ?? 0)}%`, icon: '🚨', color: 'from-rose-500/10 to-red-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' },
              { label: 'Avg. Sentiment Score', value: `${stats?.avgScore ?? 0}/100`, icon: '📊', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
            ].map((stat, i) => (
              <div key={i} className={`glass-panel rounded-2xl p-5 border bg-gradient-to-br ${stat.color} space-y-1.5`}>
                <span className="text-2xl">{stat.icon}</span>
                <p className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ── Chart + Sentiment Breakdown Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut chart */}
            <div className="glass-panel rounded-3xl p-6 space-y-4 flex flex-col items-center">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-slate-100 self-start flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-violet-500" />
                Category Distribution
              </h3>
              <div className="w-48 h-48">
                <DonutChart slices={donutSlices} />
              </div>
              {/* Legend */}
              <div className="w-full grid grid-cols-2 gap-x-4 gap-y-1.5">
                {donutSlices.map((sl, i) => (
                  <div key={i} className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: sl.color }} />
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {sl.label} ({sl.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment Breakdown */}
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Sentiment Analysis
              </h3>
              <div className="space-y-3">
                {(Object.entries(SENTIMENT_META) as [SentimentScore, typeof SENTIMENT_META[SentimentScore]][]).map(
                  ([key, meta]) => (
                    <SentimentBar
                      key={key}
                      label={key}
                      count={stats?.sentCounts[key] ?? 0}
                      total={stats?.total ?? 0}
                      meta={meta}
                    />
                  )
                )}
              </div>
            </div>

            {/* Emotion Breakdown */}
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="text-lg">🎭</span>
                Emotion Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(EMOTION_META) as [EmotionType, typeof EMOTION_META[EmotionType]][]).map(([key, meta]) => {
                  const count = stats?.emotCounts[key] ?? 0;
                  const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveEmotion(prev => prev === key ? 'all' : key)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] ${
                        activeEmotion === key ? `${meta.badge} shadow-sm` : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30'
                      }`}
                    >
                      <span className="text-xl">{meta.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{key}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{count} · {pct}%</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Filter + Comment List ── */}
          <div className="glass-panel rounded-3xl overflow-hidden">
            {/* Filter toggle header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
              <button
                onClick={() => setShowFilters(p => !p)}
                className="flex items-center gap-2 font-bold text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <Filter className="w-4 h-4 text-violet-500" />
                Filter Comments
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {filtered.length} of {video.comments.length} shown
              </div>
            </div>

            {showFilters && (
              <div className="px-6 py-4 border-b border-slate-200/40 dark:border-slate-800/40 space-y-4 animate-slide-in">
                {/* Category pills */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        activeCategory === 'all'
                          ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >All</button>
                    {COMMENT_CATEGORIES.map((m) => (
                      <button
                        key={m.label}
                        onClick={() => setActiveCategory(prev => prev === m.label ? 'all' : m.label)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          activeCategory === m.label ? `${m.badge} shadow-sm` : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {m.emoji} {m.label}
                        {stats?.catCounts[m.label] ? ` (${stats.catCounts[m.label]})` : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sentiment pills */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Sentiment</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveSentiment('all')}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        activeSentiment === 'all'
                          ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >All</button>
                    {(Object.entries(SENTIMENT_META) as [SentimentScore, typeof SENTIMENT_META[SentimentScore]][]).map(([key, meta]) => (
                      <button
                        key={key}
                        onClick={() => setActiveSentiment(prev => prev === key ? 'all' : key)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          activeSentiment === key ? `${meta.badge} shadow-sm` : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {meta.emoji} {key.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 px-6 py-3 bg-violet-500/5 border-b border-violet-500/10 animate-slide-in">
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={bulkApprove}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Approve AI Replies
                </button>
                <button
                  onClick={bulkIgnore}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" /> Ignore Selected
                </button>
                <button onClick={clearSelection} className="ml-auto text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">
                  Clear
                </button>
              </div>
            )}

            {/* Select All bar */}
            <div className="flex items-center gap-3 px-6 py-2.5 border-b border-slate-200/40 dark:border-slate-800/40 bg-slate-50/30 dark:bg-slate-900/20">
              <button
                onClick={() => selectedIds.size === filtered.length ? clearSelection() : selectAll()}
                className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                {selectedIds.size === filtered.length && filtered.length > 0
                  ? <CheckSquare className="w-4 h-4 text-violet-500" />
                  : <Square className="w-4 h-4" />}
                {selectedIds.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Comment Cards */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No comments match this filter</p>
                </div>
              ) : (
                filtered.map((comment) => {
                  const catMeta = getCategoryMeta(comment.category);
                  const sentMeta = SENTIMENT_META[comment.sentiment] ?? SENTIMENT_META.neutral;
                  const emotMeta = comment.emotion ? EMOTION_META[comment.emotion] : null;
                  const priMeta = comment.priorityTier ? PRIORITY_META[comment.priorityTier] : PRIORITY_META.medium;
                  const isSelected = selectedIds.has(comment.id);
                  const isHateOrSpam = comment.category === 'Hate' || comment.category === 'Spam' || comment.category === 'Bot';

                  return (
                    <div
                      key={comment.id}
                      className={`flex gap-4 px-6 py-5 transition-all duration-200 relative ${
                        isSelected ? 'bg-violet-500/5 dark:bg-violet-900/10' : 'hover:bg-slate-50/60 dark:hover:bg-slate-900/30'
                      } ${comment.status === 'ignored' ? 'opacity-50' : ''}`}
                    >
                      {/* Priority left line indicator */}
                      {comment.status !== 'ignored' && (
                        <>
                          {comment.priorityTier === 'highest' ? (
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-orange-500"></div>
                          ) : comment.priorityTier === 'high' ? (
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-500"></div>
                          ) : null}
                        </>
                      )}

                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelect(comment.id)}
                        className="mt-1 flex-shrink-0 cursor-pointer text-slate-400 hover:text-violet-500 transition-colors"
                      >
                        {isSelected
                          ? <CheckSquare className="w-5 h-5 text-violet-500" />
                          : <Square className="w-5 h-5" />}
                      </button>

                      {/* Avatar */}
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 object-cover flex-shrink-0"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Author + date + badges */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                              {comment.authorName}
                            </span>
                            {comment.isVerified && (
                              <span className="p-0.5 rounded-full bg-blue-500 text-white flex items-center justify-center" title="Verified Creator">
                                <UserCheck className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {comment.publishedAt}
                          </span>
                          
                          {/* Priority badge */}
                          {comment.priorityTier && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priMeta.badge}`}>
                              {priMeta.emoji} Priority: {priMeta.label} ({comment.priorityScore})
                            </span>
                          )}

                          {comment.isPinned && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                              📌 Pinned
                            </span>
                          )}
                          {comment.isSuperThanks && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 flex items-center gap-1">
                              <Heart className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                              <span>Super Thanks</span>
                            </span>
                          )}
                          {comment.isMember && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5 fill-violet-500 text-violet-500" />
                              <span>Member</span>
                            </span>
                          )}
                          {/* Category badge */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${catMeta.badge}`}>
                            {catMeta.emoji} {catMeta.label}
                          </span>
                          {/* Sentiment badge */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${sentMeta.badge}`}>
                            {sentMeta.emoji} {comment.sentiment.replace('_', ' ')}
                            {comment.sentimentScore !== undefined && (
                              <span className={`ml-1 font-mono ${scoreGradient(comment.sentimentScore)}`}>
                                {comment.sentimentScore}
                              </span>
                            )}
                          </span>
                          {/* Emotion badge */}
                          {emotMeta && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${emotMeta.badge}`}>
                              {emotMeta.emoji} {comment.emotion}
                            </span>
                          )}
                          {/* Thoughtful score badge */}
                          {comment.thoughtfulnessScore !== undefined && comment.thoughtfulnessScore >= 75 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 flex items-center gap-1">
                              <Award className="w-2.5 h-2.5 text-indigo-500" />
                              <span>Thoughtful ({comment.thoughtfulnessScore})</span>
                            </span>
                          )}
                          {/* Hate/Spam warning icon */}
                          {isHateOrSpam && (
                            <span className="text-rose-500 dark:text-rose-400" title="Flagged for moderation">
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        {/* Comment text */}
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          {comment.text}
                        </p>

                        {/* AI Reply preview (if exists and not spam/hate) */}
                        {!isHateOrSpam && comment.aiReply && comment.status !== 'replied' && (
                          <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed line-clamp-2">
                            💬 {comment.aiReply}
                          </div>
                        )}
                        {comment.status === 'replied' && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            ✅ Replied
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
