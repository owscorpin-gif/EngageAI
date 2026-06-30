import React, { useState } from 'react';
import { Toast } from '../components/Toast';
import { 
  Video, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  Search, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validate YouTube Video URL
  const validateYoutubeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      return 'Please enter a YouTube video URL';
    }

    // YouTube regex pattern supporting watch, embed, mobile, share, and shorts links
    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})(?:\S+)?$/;
    const match = trimmed.match(regExp);

    if (!match) {
      return 'Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)';
    }

    return null;
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setToast(null);

    const validationError = validateYoutubeUrl(videoUrl);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Simulated short delay for validating aesthetics
    setIsValidating(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsValidating(false);

    setToast({
      message: 'Video URL accepted. Analysis module will be connected in the next phase.',
      type: 'success'
    });
  };

  const handleClear = () => {
    setVideoUrl('');
    setError(null);
    setToast(null);
  };

  const kpiCards = [
    { 
      title: 'Videos Analyzed', 
      value: 0, 
      desc: 'No activity this session', 
      icon: Video, 
      color: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/10' 
    },
    { 
      title: 'Total Comments', 
      value: 0, 
      desc: 'Waiting for connection', 
      icon: MessageSquare, 
      color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' 
    },
    { 
      title: 'AI Replies', 
      value: 0, 
      desc: 'Auto-pilot disabled', 
      icon: Sparkles, 
      color: 'text-amber-500 bg-amber-500/5 border-amber-500/10' 
    },
    { 
      title: 'Pending Reviews', 
      value: 0, 
      desc: 'Inbox is clean', 
      icon: Clock, 
      color: 'text-rose-500 bg-rose-500/5 border-rose-500/10' 
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-slide-in">
      {/* Header and Welcome */}
      <div className="flex flex-col gap-2">
        <h1 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white">
          Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
          Submit YouTube links below to fetch, inspect, and draft automated replies.
        </p>
      </div>

      {/* Analyzer Card */}
      <section 
        id="analyzer-card" 
        className="glass-panel rounded-3xl shadow-xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-800"
      >
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-slate-800 dark:text-slate-100">
              Analyze YouTube Video
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Submit a video URL to start fetching comments.
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="youtube-url-input" 
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              YouTube Video URL
            </label>
            <div className="relative">
              <input
                type="text"
                id="youtube-url-input"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`w-full px-5 py-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-900/30 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium ${
                  error 
                    ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' 
                    : 'border-slate-200 dark:border-slate-800/80 focus:border-primary-500'
                }`}
                disabled={isValidating}
              />
            </div>
            {error && (
              <div 
                className="flex items-center gap-2 mt-2 text-rose-600 dark:text-rose-400 text-sm font-semibold animate-slide-in"
                id="url-error-msg"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="submit"
              disabled={isValidating}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-md shadow-primary-500/10 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              id="analyze-submit-btn"
            >
              {isValidating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={isValidating || !videoUrl}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              id="analyze-clear-btn"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </form>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className="glass-panel border border-slate-200/80 dark:border-slate-800/60 rounded-3xl p-6 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-2xl border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="font-heading font-extrabold text-4xl text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </span>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                  {card.desc}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Dynamic Toast System */}
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
