import React, { useState } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { Toast } from '../components/Toast';
import { validateInput, YouTubeUrlSchema, FeedbackReasonSchema, RatingSchema } from '../utils/validation';
import { copyToClipboard, clipboardPreview } from '../utils/clipboard';
import { getCategoryMeta, SENTIMENT_META, EMOTION_META, COMMENT_CATEGORIES, PRIORITY_META, DECISION_META, ALL_DECISION_ACTIONS } from '../utils/commentMeta';
import type { CommentCategory, PriorityTier, DecisionAction } from '../utils/commentMeta';
import { getPersonalitySystemPrompt } from './PersonalityPage';
import { 
  Sparkles, 
  Trash2, 
  Search, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Ban, 
  Video,
  Play,
  Brain,
  Star,
  Copy,
  ClipboardCheck,
  BookOpen,
  FileText,
  Tags,
  Globe,
  Lightbulb,
  FolderHeart,
  ChevronDown,
  ChevronUp,
  Pin,
  Heart,
  Crown,
  Award,
  ArrowUpDown,
  UserCheck,
  Zap,
  ScanSearch,
} from 'lucide-react';

export const AnalyzeVideoPage: React.FC = () => {
  const {
    currentVideo,
    isAnalyzing,
    approvalMode,
    analyzeVideo,
    approveReply,
    ignoreComment,
    regenerateReply,
    updateReplyText,
    setApprovalMode,
    submitFeedback,
    applyDecision,
    activePromptRules,
  } = useDashboard();

  // Phase 9: Prompt Inspector toggle — keyed by comment ID
  const [showPromptInspector, setShowPromptInspector] = useState<Record<string, boolean>>({});

  const [videoUrl, setVideoUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copiedCommentId, setCopiedCommentId] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  // AI Learning States
  const [originalDrafts, setOriginalDrafts] = useState<Record<string, string>>({});
  const [feedbackTarget, setFeedbackTarget] = useState<{
    commentId: string;
    commentText: string;
    originalReply: string;
    editedReply: string;
  } | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackReason, setFeedbackReason] = useState('Too formal');

  // Populate original drafts snapshot
  React.useEffect(() => {
    if (currentVideo) {
      setOriginalDrafts(prev => {
        const next = { ...prev };
        let updated = false;
        currentVideo.comments.forEach(c => {
          if (!next[c.id]) {
            next[c.id] = c.aiReply;
            updated = true;
          }
        });
        return updated ? next : prev;
      });
    }
  }, [currentVideo]);

  const handleApproveClick = (comment: any) => {
    const original = originalDrafts[comment.id] || comment.aiReply;
    if (comment.aiReply !== original) {
      setFeedbackRating(5);
      setFeedbackReason('Too formal');
      setFeedbackTarget({
        commentId: comment.id,
        commentText: comment.text,
        originalReply: original,
        editedReply: comment.aiReply
      });
    } else {
      approveReply(currentVideo!.id, comment.id, comment.aiReply);
      setToast({ message: 'Reply approved and posted!', type: 'success' });
    }
  };

  const handleSubmitFeedback = (skip: boolean) => {
    if (!feedbackTarget) return;

    if (!skip) {
      // Validate reason enum and rating range before storing
      const reasonValidation = validateInput(FeedbackReasonSchema, feedbackReason);
      const ratingValidation = validateInput(RatingSchema, feedbackRating);

      if (!reasonValidation.success || !ratingValidation.success) {
        setToast({ message: 'Invalid feedback data — please try again.', type: 'error' });
        setFeedbackTarget(null);
        return;
      }

      submitFeedback({
        commentText: feedbackTarget.commentText,
        originalReply: feedbackTarget.originalReply,
        editedReply: feedbackTarget.editedReply,
        reason: reasonValidation.data,
        rating: ratingValidation.data
      });
      setToast({ message: 'Feedback submitted to AI memory.', type: 'success' });
    } else {
      setToast({ message: 'Reply approved without feedback.', type: 'info' });
    }

    // Approve the reply
    approveReply(currentVideo!.id, feedbackTarget.commentId, feedbackTarget.editedReply);
    setFeedbackTarget(null);
  };
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative' | 'very_angry' | 'excited'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CommentCategory>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'all' | PriorityTier>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'relevance' | 'newest'>('priority');

  const handleValidateUrl = (url: string): string | null => {
    const trimmed = url.trim();
    if (!trimmed) return 'Please enter a YouTube video URL';
    const result = validateInput(YouTubeUrlSchema, trimmed);
    return result.success ? null : result.error;
  };

  const handleCopyReply = async (commentId: string, text: string) => {
    const result = await copyToClipboard(text);
    if (result.success) {
      setCopiedCommentId(commentId);
      setToast({
        message: `Copied: "${clipboardPreview(result.copied, 50)}"`,
        type: 'success'
      });
      setTimeout(() => setCopiedCommentId(null), 2000);
    } else {
      setToast({ message: result.error ?? 'Failed to copy reply.', type: 'error' });
    }
  };

  const handleAnalyzeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    setToast(null);

    const validationError = handleValidateUrl(videoUrl);
    if (validationError) {
      setUrlError(validationError);
      return;
    }

    try {
      await analyzeVideo(videoUrl);
      setToast({
        message: 'Video comments successfully analyzed!',
        type: 'success'
      });
    } catch {
      setToast({
        message: 'Failed to analyze video comments. Please try again.',
        type: 'error'
      });
    }
  };

  const handleClearForm = () => {
    setVideoUrl('');
    setUrlError(null);
  };

  // Filter Comments
  const filteredComments = currentVideo
    ? currentVideo.comments.filter(comment => {
        const matchesSentiment = sentimentFilter === 'all' || comment.sentiment === sentimentFilter;
        const matchesCategory = categoryFilter === 'all' || comment.category === categoryFilter;
        const matchesPriority = priorityFilter === 'all' || comment.priorityTier === priorityFilter;
        return matchesSentiment && matchesCategory && matchesPriority;
      })
    : [];

  // Sort Comments (Phase 7 priority default)
  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortBy === 'priority') {
      return (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
    }
    if (sortBy === 'newest') {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
    return 0; // maintain original relevance order
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-slide-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white">
          Analyze Video
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
          Fetch and draft automated, context-aware AI replies for comments on your video.
        </p>
      </div>

      {/* URL Input Form */}
      <section className="glass-panel rounded-3xl shadow-xl p-6 md:p-8 relative overflow-hidden transition-all duration-300">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleAnalyzeSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="youtube-url-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              YouTube Video URL or Video ID
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                id="youtube-url-input"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                maxLength={500}
                placeholder="Enter YouTube URL or 11-char Video ID (e.g. dQw4w9WgXcQ)"
                className={`flex-1 px-5 py-3.5 rounded-2xl border bg-slate-50/50 dark:bg-slate-900/30 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium ${
                  urlError 
                    ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' 
                    : 'border-slate-200 dark:border-slate-800/80 focus:border-primary-500'
                }`}
                disabled={isAnalyzing}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-md shadow-primary-500/10 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Analyze</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearForm}
                  disabled={isAnalyzing || !videoUrl}
                  className="px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
            {urlError && (
              <div className="flex items-center gap-2 mt-2 text-rose-600 dark:text-rose-400 text-sm font-semibold animate-slide-in">
                <AlertCircle className="w-4 h-4" />
                <span>{urlError}</span>
              </div>
            )}
          </div>
        </form>
      </section>

      {/* Main Analysis Dashboard */}
      {isAnalyzing ? (
        <section className="space-y-6">
          {/* Skeleton Video Header */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row gap-6 animate-pulse">
            <div className="w-full md:w-56 h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="flex-1 space-y-4 py-2">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            </div>
          </div>
          {/* Skeleton Comments */}
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-panel rounded-3xl p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
              </div>
            ))}
          </div>
        </section>
      ) : currentVideo ? (
        <div className="space-y-6">
          {/* Active Video Info Card */}
          <section className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start relative hover:shadow-2xl transition-all duration-300">
            <div className="relative w-full md:w-60 aspect-video md:aspect-auto md:h-36 rounded-2xl overflow-hidden group shadow-md border border-slate-200/50 dark:border-slate-800/50 flex-shrink-0 bg-slate-900">
              <img 
                src={currentVideo.thumbnail} 
                alt={currentVideo.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
                  <Play className="w-6 h-6 fill-white" />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                  YouTube Video
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Sentiment Clean
                </span>
              </div>
              <h2 className="font-heading font-extrabold text-xl md:text-2xl text-slate-800 dark:text-slate-100 leading-tight">
                {currentVideo.title}
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span>{currentVideo.channelTitle}</span>
                <span>•</span>
                <span>{currentVideo.views}</span>
                <span>•</span>
                <span>{currentVideo.publishedAt}</span>
              </div>
            </div>
          </section>

          {/* AI Video Insights & Context Panel */}
          {currentVideo.summary && (
            <section className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
              <button
                type="button"
                onClick={() => setShowInsights(prev => !prev)}
                className="w-full flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-bold uppercase tracking-wider">AI Video Analyzer Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {showInsights ? 'Hide Details' : 'Show Details'}
                  </span>
                  {showInsights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {showInsights && (
                <div className="p-6 md:p-8 border-t border-slate-200/60 dark:border-slate-800/60 space-y-6 animate-slide-in">
                  
                  {/* Grid section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Summary & Main Topic Card */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-violet-500" />
                          <span>Video Summary</span>
                        </h4>
                        <p className="text-sm text-slate-750 dark:text-slate-350 leading-relaxed font-medium">
                          {currentVideo.summary}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>Main Topic & Thesis</span>
                        </h4>
                        <p className="text-sm text-slate-750 dark:text-slate-350 leading-relaxed font-medium">
                          {currentVideo.mainTopic}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <FolderHeart className="w-3.5 h-3.5" />
                          <span>Category</span>
                        </span>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {currentVideo.category}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Language</span>
                        </span>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {currentVideo.language}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Tags className="w-3.5 h-3.5" />
                          <span>Keywords</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentVideo.keywords?.map((keyword, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded animate-fade-in"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transcript Outline Section */}
                  {currentVideo.transcript && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-primary-500" />
                        <span>Reconstructed Transcript Outline</span>
                      </h4>
                      <div className="bg-slate-950 text-slate-300 p-5 rounded-2xl border border-slate-800 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                        {currentVideo.transcript}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Autopilot and Filtering Dashboard controls */}
          <section className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-100">
                  Manage Comments
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  {currentVideo.comments.length} loaded
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Filter and review suggestions generated by AI.
              </p>
            </div>

            {/* Phase 11: 3-Way Approval Mode Segmented Control */}
            <div className="flex bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-center lg:self-auto">
              <button
                onClick={() => setApprovalMode('auto')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  approvalMode === 'auto'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow shadow-purple-500/10'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Automatically reply to safe comments"
              >
                <Zap className="w-4 h-4" /> Auto Reply
              </button>
              <button
                onClick={() => setApprovalMode('approve')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  approvalMode === 'approve'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow shadow-indigo-500/10'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Draft replies but wait for your approval"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve First
              </button>
              <button
                onClick={() => setApprovalMode('suggestion')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  approvalMode === 'suggestion'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow shadow-amber-500/10'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Only suggest actions; do not draft text"
              >
                <Lightbulb className="w-4 h-4" /> Suggestion Only
              </button>
            </div>
          </section>

          {/* Filters Bar */}
          <div className="flex flex-col gap-4 p-5 bg-slate-50/40 dark:bg-slate-900/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            {/* Row 1: Sentiment & Sort */}
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">Sentiment:</span>
                {(['all', 'positive', 'neutral', 'negative', 'very_angry', 'excited'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSentimentFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      sentimentFilter === filter
                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent shadow'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'very_angry' ? '😡 Very Angry' : filter === 'excited' ? '🤩 Excited' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-violet-500" /> Sort By:
                </span>
                {(['priority', 'relevance', 'newest'] as const).map((sortOption) => (
                  <button
                    key={sortOption}
                    onClick={() => setSortBy(sortOption)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      sortBy === sortOption
                        ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {sortOption === 'priority' ? '🔥 AI Priority' : sortOption === 'relevance' ? '📌 YouTube Pinned' : '🕒 Date'}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Priority Tiers */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">AI Priority:</span>
              {(['all', 'highest', 'high', 'medium', 'low', 'ignore'] as const).map((filter) => {
                const pri = filter !== 'all' ? PRIORITY_META[filter] : null;
                return (
                  <button
                    key={filter}
                    onClick={() => setPriorityFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      priorityFilter === filter
                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent shadow'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {filter === 'all' ? 'All Priorities' : `${pri?.emoji} ${pri?.label}`}
                  </button>
                );
              })}
            </div>

            {/* Row 3: Category Selector */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Category:</span>
                <button
                  onClick={() => setShowCategoryFilter(p => !p)}
                  className="px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1"
                >
                  {categoryFilter === 'all' ? 'All categories' : categoryFilter}
                  {showCategoryFilter ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {categoryFilter !== 'all' && (
                  <button onClick={() => setCategoryFilter('all')} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">
                    Clear
                  </button>
                )}
              </div>
              {showCategoryFilter && (
                <div className="flex flex-wrap gap-2 animate-slide-in">
                  <button
                    onClick={() => { setCategoryFilter('all'); setShowCategoryFilter(false); }}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      categoryFilter === 'all'
                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent shadow'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >All</button>
                  {COMMENT_CATEGORIES.map((m) => (
                    <button
                      key={m.label}
                      onClick={() => { setCategoryFilter(m.label); setShowCategoryFilter(false); }}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        categoryFilter === m.label ? `${m.badge} shadow-sm` : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comments List */}
          <section className="space-y-4">
            {sortedComments.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 animate-slide-in">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h4 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">No matching comments</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Try clearing your filter parameters to view other responses.
                </p>
              </div>
            ) : (
              sortedComments.map((comment) => {
                const catMeta = getCategoryMeta(comment.category);
                const sentMeta = SENTIMENT_META[comment.sentiment] ?? SENTIMENT_META.neutral;
                const priMeta = comment.priorityTier ? PRIORITY_META[comment.priorityTier] : PRIORITY_META.medium;

                return (
                  <div 
                    key={comment.id}
                    className={`glass-panel rounded-3xl p-6 transition-all duration-300 relative border overflow-hidden ${
                      comment.status === 'replied' 
                        ? 'border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-500/5 dark:bg-emerald-950/5' 
                        : comment.status === 'ignored'
                        ? 'opacity-50 hover:opacity-80 border-slate-200 dark:border-slate-800'
                        : `${priMeta.ring} hover:border-slate-350 dark:hover:border-slate-750`
                    }`}
                  >
                    {/* Glowing side accent for status & priority */}
                    {comment.status === 'replied' ? (
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500"></div>
                    ) : comment.priorityTier === 'highest' ? (
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500 to-orange-500"></div>
                    ) : comment.priorityTier === 'high' ? (
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-500 to-amber-500"></div>
                    ) : null}

                    <div className="flex flex-col gap-4">
                      {/* Comment Header info */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={comment.authorAvatar} 
                            alt={comment.authorName} 
                            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                {comment.authorName}
                              </span>
                              {comment.isVerified && (
                                <span className="p-0.5 rounded-full bg-blue-500 text-white flex items-center justify-center" title="Verified Creator">
                                  <UserCheck className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] block text-slate-400 dark:text-slate-500 font-medium">
                              {comment.publishedAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {/* Priority Score badge */}
                          {comment.priorityTier && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priMeta.badge}`}>
                              {priMeta.emoji} Priority: {priMeta.label} ({comment.priorityScore})
                            </span>
                          )}
                          {comment.isPinned && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 flex items-center gap-1">
                              <Pin className="w-3 h-3 fill-amber-500" />
                              <span>Pinned</span>
                            </span>
                          )}
                          {comment.isSuperThanks && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 flex items-center gap-1">
                              <Heart className="w-3 h-3 fill-yellow-500 text-yellow-500 animate-pulse" />
                              <span>Super Thanks</span>
                            </span>
                          )}
                          {comment.isMember && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 flex items-center gap-1">
                              <Crown className="w-3 h-3 fill-violet-500 text-violet-500" />
                              <span>Member</span>
                            </span>
                          )}
                          {/* Phase 6 Sentiment badge */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${sentMeta.badge}`}>
                            {sentMeta.emoji} {comment.sentiment.replace('_', ' ')}
                            {comment.sentimentScore !== undefined && (
                              <span className="ml-1 font-mono opacity-70">{comment.sentimentScore}</span>
                            )}
                          </span>
                          {/* Phase 5 Category badge */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${catMeta.badge}`}>
                            {catMeta.emoji} {catMeta.label}
                          </span>
                          {/* Phase 6 Emotion badge */}
                          {comment.emotion && comment.emotion !== 'neutral' && (() => {
                            const em = EMOTION_META[comment.emotion];
                            return em ? (
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${em.badge}`}>
                                {em.emoji} {comment.emotion}
                              </span>
                            ) : null;
                          })()}
                          {/* Thoughtful score badge */}
                          {comment.thoughtfulnessScore !== undefined && comment.thoughtfulnessScore >= 75 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 flex items-center gap-1">
                              <Award className="w-3 h-3 text-indigo-500" />
                              <span>Thoughtful ({comment.thoughtfulnessScore})</span>
                            </span>
                          )}
                          {/* Phase 8: Decision badge */}
                          {(() => {
                            const dec = (comment.aiDecision ?? 'reply') as DecisionAction;
                            const dm = DECISION_META[dec];
                            if (!dm) return null;
                            return (
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${dm.badge}`}
                                title={comment.aiDecisionReason ?? dm.description}
                              >
                                <Zap className="w-2.5 h-2.5" />
                                <span>{dm.emoji} {dm.label}</span>
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Comment Body */}
                      <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed pl-1">
                        {comment.text}
                      </p>

                      {/* Draft Box/Result Box */}
                      {comment.status === 'replied' ? (
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="w-4.5 h-4.5" />
                            <span>Replied and Published to YouTube</span>
                          </div>
                          <div className="px-4 py-3 bg-emerald-500/5 dark:bg-emerald-950/10 border-l-2 border-emerald-500 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-r-xl">
                            "{comment.repliedText}"
                          </div>
                        </div>
                      ) : comment.status === 'ignored' ? (
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-bold mt-1">
                          <Ban className="w-4 h-4" />
                          <span>This comment has been ignored / muted</span>
                        </div>
                      ) : (
                        <div className="space-y-3 mt-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 animate-slide-in">
                          {/* Decision action header */}
                          {(() => {
                            const dec = (comment.aiDecision ?? 'reply') as DecisionAction;
                            const dm = DECISION_META[dec];
                            const isNonReply = dec === 'like' || dec === 'heart' || dec === 'hide' || dec === 'escalate' || dec === 'flag' || dec === 'ignore' || dec === 'review';
                            return (
                              <>
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-2 py-1 rounded-lg border ${dm?.badge ?? ''}`}>
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>AI Decision: {dm?.emoji} {dm?.label}</span>
                                  </span>
                                  {/* Override dropdown */}
                                  <select
                                    value={dec}
                                    onChange={e => applyDecision(currentVideo.id, comment.id, e.target.value as DecisionAction)}
                                    className="text-[10px] font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                                  >
                                    {ALL_DECISION_ACTIONS.map(a => {
                                      const m = DECISION_META[a];
                                      return <option key={a} value={a}>{m.emoji} {m.label}</option>;
                                    })}
                                  </select>
                                </div>
                                {comment.aiDecisionReason && (
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                                    🤖 {comment.aiDecisionReason}
                                  </p>
                                )}
                                {isNonReply && (
                                  <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold ${dm?.badge ?? ''}`}>
                                    <span className="text-base">{dm?.emoji}</span>
                                    <span>{dm?.description} — no text reply needed.</span>
                                  </div>
                                )}

                                {/* Phase 9: Prompt Inspector accordion */}
                                {(() => {
                                  const inspectorOpen = showPromptInspector[comment.id] ?? false;
                                  const personalityLabel = (() => {
                                    const sp = getPersonalitySystemPrompt();
                                    if (!sp) return 'None set';
                                    if (sp.includes('[CREATOR VOICE')) return 'Custom creator voice';
                                    const match = sp.match(/^You are a (.+?) YouTube/);
                                    return match ? match[1] : 'Custom personality';
                                  })();

                                  return (
                                    <div className="border border-slate-200/60 dark:border-slate-800/60 rounded-xl overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={() => setShowPromptInspector(prev => ({
                                          ...prev,
                                          [comment.id]: !prev[comment.id]
                                        }))}
                                        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer"
                                      >
                                        <span className="flex items-center gap-1.5">
                                          <ScanSearch className="w-3 h-3 text-violet-400" />
                                          🔍 Prompt Inspector — context used for this reply
                                        </span>
                                        {inspectorOpen
                                          ? <ChevronUp className="w-3 h-3" />
                                          : <ChevronDown className="w-3 h-3" />}
                                      </button>
                                      {inspectorOpen && (
                                        <div className="px-3 py-3 space-y-2 bg-slate-950/5 dark:bg-slate-950/30 animate-slide-in">
                                          {/* Context rows */}
                                          {([
                                            {
                                              icon: '🎬',
                                              label: 'Video Summary',
                                              value: currentVideo.summary
                                                ? currentVideo.summary.slice(0, 120) + (currentVideo.summary.length > 120 ? '…' : '')
                                                : 'Not available',
                                              present: !!currentVideo.summary,
                                            },
                                            {
                                              icon: '🎭',
                                              label: 'Creator Style',
                                              value: personalityLabel,
                                              present: !!getPersonalitySystemPrompt(),
                                            },
                                            {
                                              icon: '🌐',
                                              label: 'Language',
                                              value: currentVideo.language ?? 'English',
                                              present: true,
                                            },
                                            {
                                              icon: '🏷️',
                                              label: 'Comment Category',
                                              value: comment.category,
                                              present: true,
                                            },
                                            {
                                              icon: '📋',
                                              label: 'Channel Rules',
                                              value: activePromptRules.length > 0
                                                ? `${activePromptRules.length} rule${activePromptRules.length > 1 ? 's' : ''} active`
                                                : 'No rules set',
                                              present: activePromptRules.length > 0,
                                            },
                                            {
                                              icon: '💬',
                                              label: 'Previous Replies',
                                              value: (comment.replies?.length ?? 0) > 0
                                                ? `${comment.replies!.length} thread repl${comment.replies!.length > 1 ? 'ies' : 'y'} injected`
                                                : 'No thread replies',
                                              present: (comment.replies?.length ?? 0) > 0,
                                            },
                                          ] as { icon: string; label: string; value: string; present: boolean }[]).map(row => (
                                            <div key={row.label} className="flex items-start gap-2">
                                              <span className="text-sm flex-shrink-0 mt-px">{row.icon}</span>
                                              <div className="flex-1 min-w-0">
                                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                                                  {row.label}
                                                </span>
                                                <span className={`text-[11px] font-semibold leading-snug block ${
                                                  row.present
                                                    ? 'text-slate-700 dark:text-slate-300'
                                                    : 'text-slate-400 dark:text-slate-600 italic'
                                                }`}>
                                                  {row.value}
                                                </span>
                                              </div>
                                              <span className={`text-[10px] mt-0.5 flex-shrink-0 ${row.present ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {row.present ? '✓' : '—'}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </>
                            );
                          })()}

                          {/* Only show textarea for reply/escalate decisions */}
                          {(() => {
                            const dec = (comment.aiDecision ?? 'reply') as DecisionAction;
                            const showTextarea = dec === 'reply' || dec === 'escalate' || !comment.aiDecision;
                            if (!showTextarea) return null;
                            return (
                              <textarea
                                value={comment.aiReply}
                                onChange={(e) => updateReplyText(currentVideo.id, comment.id, e.target.value)}
                                disabled={comment.category === 'Spam'}
                                maxLength={1000}
                                placeholder="Type a custom reply or draft response here..."
                                rows={3}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all rounded-xl resize-none disabled:opacity-50"
                              />
                            );
                          })()}

                          <div className="flex flex-wrap gap-2 justify-end">
                            <button
                              onClick={() => ignoreComment(currentVideo.id, comment.id)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/10 hover:bg-rose-500/10 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Ignore</span>
                            </button>
                            {comment.category !== 'Spam' && (
                              <>
                                <button
                                  onClick={() => handleCopyReply(comment.id, comment.aiReply)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    copiedCommentId === comment.id
                                      ? 'text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 bg-emerald-500/10'
                                      : 'text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                                  }`}
                                  aria-label="Copy reply text to clipboard"
                                  title="Copy reply as plain text"
                                >
                                  {copiedCommentId === comment.id
                                    ? <ClipboardCheck className="w-3.5 h-3.5" />
                                    : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedCommentId === comment.id ? 'Copied!' : 'Copy'}</span>
                                </button>
                                <button
                                  onClick={() => regenerateReply(currentVideo.id, comment.id)}
                                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  {approvalMode === 'suggestion' && !comment.aiReply ? (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                      <span>Draft AI Reply</span>
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      <span>Regenerate</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleApproveClick(comment)}
                                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Approve &amp; Post</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Nested Replies Section */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/85 space-y-3.5 pl-4 md:pl-8">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                            Thread Replies ({comment.replies.length})
                          </span>
                          <div className="space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3 items-start animate-slide-in">
                                <img
                                  src={reply.authorAvatar}
                                  alt={reply.authorName}
                                  className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-800 object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                    <span className="font-semibold text-xs text-slate-700 dark:text-slate-350">
                                      {reply.authorName}
                                    </span>
                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                                      {reply.publishedAt}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                                    {reply.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      ) : (
        /* Empty State */
        <section className="glass-panel rounded-3xl p-12 md:p-16 text-center max-w-xl mx-auto space-y-6 animate-slide-in relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-20 h-20 bg-primary-500/10 text-primary-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-float">
            <Video className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-100">
              Ready to Moderate comments?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
              Submit your YouTube URL in the bar above. Engage AI will crawl the latest comment feed, evaluate sentiment levels, and construct context-aware response proposals.
            </p>
          </div>
        </section>
      )}

      {feedbackTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-950 dark:text-white">
                  Calibration Memory Feedback
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Engage AI detected edits. Save this correction to calibrate future prompts.
                </p>
              </div>
            </div>

            {/* Stars selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                How would you rate the draft suggestion?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="text-slate-300 dark:text-slate-700 hover:scale-110 active:scale-95 transition-transform cursor-pointer border-none bg-transparent"
                  >
                    <Star 
                      className={`w-7 h-7 ${
                        star <= feedbackRating 
                          ? 'fill-amber-500 text-amber-500' 
                          : 'text-slate-300 dark:text-slate-800'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Reason selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Primary Reason for edits?
              </label>
              <select
                value={feedbackReason}
                onChange={(e) => setFeedbackReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="Too formal">Too formal (Sounds like corporate speech)</option>
                <option value="Too informal">Too informal (Slang or emoji overload)</option>
                <option value="Incorrect details">Incorrect details (Wrong facts/features)</option>
                <option value="Wrong tone">Wrong tone (Mismatch with comment sentiment)</option>
                <option value="Other">Other / Appended links & signatures</option>
              </select>
            </div>

            {/* Diff comparisons view */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Diff comparisons preview
              </label>
              <div className="space-y-2 text-xs border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/30 max-h-[140px] overflow-y-auto">
                <div>
                  <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block">Original Proposal:</span>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">{feedbackTarget.originalReply}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider block">Your Edited Version:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-bold">{feedbackTarget.editedReply}</p>
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <button
                type="button"
                onClick={() => handleSubmitFeedback(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer border-none bg-transparent"
              >
                Skip Feedback
              </button>
              <button
                type="button"
                onClick={() => handleSubmitFeedback(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-md cursor-pointer transition-colors border-none"
              >
                Submit & Post
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
