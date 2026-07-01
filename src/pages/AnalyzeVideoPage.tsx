import React, { useState } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { Toast } from '../components/Toast';
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
  VolumeX,
  Volume2
} from 'lucide-react';

export const AnalyzeVideoPage: React.FC = () => {
  const {
    currentVideo,
    isAnalyzing,
    autoPilotActive,
    analyzeVideo,
    approveReply,
    ignoreComment,
    regenerateReply,
    updateReplyText,
    toggleAutoPilot
  } = useDashboard();

  const [videoUrl, setVideoUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Question' | 'Feedback' | 'Spam' | 'Appreciation'>('all');

  const validateYoutubeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      return 'Please enter a YouTube video URL';
    }
    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})(?:\S+)?$/;
    const match = trimmed.match(regExp);
    if (!match) {
      return 'Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)';
    }
    return null;
  };

  const handleAnalyzeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    setToast(null);

    const validationError = validateYoutubeUrl(videoUrl);
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
        return matchesSentiment && matchesCategory;
      })
    : [];

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
              YouTube Video URL
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
                placeholder="https://www.youtube.com/watch?v=..."
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

            {/* Auto Pilot Toggle Switch */}
            <button
              onClick={toggleAutoPilot}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                autoPilotActive 
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-600 dark:text-purple-400 shadow-md shadow-purple-500/5 ring-1 ring-purple-500/30' 
                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                {autoPilotActive ? (
                  <div className="absolute -inset-1 rounded-full bg-purple-500/40 animate-ping"></div>
                ) : null}
                {autoPilotActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider leading-none">Auto-Pilot</p>
                <p className="text-[10px] font-medium opacity-80 mt-0.5">
                  {autoPilotActive ? 'Automated Approvals Active' : 'Manual Moderation Mode'}
                </p>
              </div>
            </button>
          </section>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 self-center mr-2">Sentiment:</span>
              {(['all', 'positive', 'neutral', 'negative'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSentimentFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    sentimentFilter === filter
                      ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent shadow'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 self-center mr-2">Category:</span>
              {(['all', 'Question', 'Feedback', 'Spam', 'Appreciation'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCategoryFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    categoryFilter === filter
                      ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent shadow'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {filter === 'all' ? 'All categories' : filter}
                </button>
              ))}
            </div>
          </div>

          {/* Comments List */}
          <section className="space-y-4">
            {filteredComments.length === 0 ? (
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
              filteredComments.map((comment) => {
                const sentimentColors = {
                  positive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                  neutral: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
                  negative: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                };

                const categoryColors = {
                  Question: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                  Feedback: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
                  Spam: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                  Appreciation: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
                };

                return (
                  <div 
                    key={comment.id}
                    className={`glass-panel rounded-3xl p-6 transition-all duration-300 relative border overflow-hidden ${
                      comment.status === 'replied' 
                        ? 'border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-500/5 dark:bg-emerald-950/5' 
                        : comment.status === 'ignored'
                        ? 'opacity-50 hover:opacity-80 border-slate-200 dark:border-slate-800'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Glowing side accent */}
                    {comment.status === 'replied' && (
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500"></div>
                    )}

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
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                              {comment.authorName}
                            </span>
                            <span className="text-[10px] block text-slate-400 dark:text-slate-500 font-medium">
                              {comment.publishedAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${sentimentColors[comment.sentiment]}`}>
                            {comment.sentiment}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${categoryColors[comment.category]}`}>
                            {comment.category}
                          </span>
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
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                              <span>AI Draft Reply Suggestion</span>
                            </span>
                            {comment.category === 'Spam' && (
                              <span className="text-[10px] text-rose-500 font-bold px-1.5 py-0.5 rounded bg-rose-500/10">
                                Muted for Spam
                              </span>
                            )}
                          </div>

                          <textarea
                            value={comment.aiReply}
                            onChange={(e) => updateReplyText(currentVideo.id, comment.id, e.target.value)}
                            disabled={comment.category === 'Spam'}
                            placeholder="Type a custom reply or draft response here..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all rounded-xl resize-none disabled:opacity-50"
                          />

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
                                  onClick={() => regenerateReply(currentVideo.id, comment.id)}
                                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Regenerate</span>
                                </button>
                                <button
                                  onClick={() => approveReply(currentVideo.id, comment.id, comment.aiReply)}
                                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Approve & Post</span>
                                </button>
                              </>
                            )}
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
