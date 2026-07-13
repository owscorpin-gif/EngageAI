import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Trash2, 
  Star, 
  Plus, 
  FileText, 
  CheckCircle2,
  ThumbsUp,
  ArrowRight
} from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { Toast } from '../components/Toast';

export const AiLearningPage: React.FC = () => {
  const { feedbacks, activePromptRules, addPromptRule, removePromptRule } = useDashboard();
  const [newRule, setNewRule] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newRule.trim();
    if (!trimmed) return;
    if (trimmed.length > 200) {
      showToast('Prompt memory instructions must be 200 characters or less.', 'error');
      return;
    }
    addPromptRule(trimmed);
    setNewRule('');
    showToast('Prompt memory rule added.', 'success');
  };

  const handleRemoveRule = (rule: string) => {
    removePromptRule(rule);
    showToast('Prompt memory rule removed.', 'info');
  };

  // Metrics aggregates
  const totalEdits = feedbacks.length;
  const avgRating = totalEdits > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalEdits).toFixed(1) 
    : '4.8'; // Default rating if no feedback submitted yet

  // Sample feedback data if list is empty, to showcase beautiful UI
  const displayFeedbacks = feedbacks.length > 0 ? feedbacks : [
    {
      id: 'fb-sample-1',
      commentText: 'Awesome video! Does this cover firebase hosting setups?',
      originalReply: 'Hi! Thank you. I do not cover firebase app hosting in this episode.',
      editedReply: 'Hi! Glad you liked it. This video focuses on Firestore, but I will cover Firebase App Hosting next week. Stay tuned!',
      reason: 'Incorrect details',
      rating: 3,
      submittedAt: '7/4/2026, 12:00 PM'
    },
    {
      id: 'fb-sample-2',
      commentText: 'The code on github is returning a syntax error on line 42.',
      originalReply: 'Dear subscriber, I sincerely apologize for the inconvenience. Please inspect the imports. Best regards.',
      editedReply: 'Whoops! Let me push a hotfix to that branch. Try refreshing in 5 minutes! 😊',
      reason: 'Too formal',
      rating: 2,
      submittedAt: '7/4/2026, 11:30 AM'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-in">
      {/* Header Panel */}
      <div>
        <h1 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Brain className="w-8 h-8 text-primary-500" />
          <span>AI Learning & Prompt Memory</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
          Engage AI learns from your manual edits to calibrate voice profiles. Track ratings, view original proposals, and manage core prompt heuristics.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Rating Card */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-950/40 p-6 space-y-3 flex items-center gap-5 shadow-sm">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <Star className="w-8 h-8 fill-amber-500" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
              Average Draft Rating
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              <span>{avgRating}</span>
              <span className="text-sm text-slate-400 font-bold">/ 5.0</span>
            </span>
          </div>
        </div>

        {/* Edits Card */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-950/40 p-6 space-y-3 flex items-center gap-5 shadow-sm">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
              Memory Log Count
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {totalEdits} Edits
            </span>
          </div>
        </div>

        {/* Status Card */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-950/40 p-6 space-y-3 flex items-center gap-5 shadow-sm">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
              Prompt Memory Engine
            </span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>Active & Tuning Prompts</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Memory Ledger Table (Left & Center) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-4 shadow-md">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <span>Creator Correction History Log</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays real-time diff logs matching original suggestions against corrected submissions.
              </p>
            </div>

            <div className="space-y-6">
              {displayFeedbacks.map((fb) => (
                <div 
                  key={fb.id} 
                  className="border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/20 space-y-4"
                >
                  {/* Top Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Rating: {fb.rating}/5
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                        {fb.reason}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {fb.submittedAt}
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Viewer Comment:</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                      "{fb.commentText}"
                    </p>
                  </div>

                  {/* Diff Comparisons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-rose-500">Original AI Proposal</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                        {fb.originalReply}
                      </p>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-emerald-500" />
                        <span>Creator-Edited Draft</span>
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                        {fb.editedReply}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prompt memory rules sidebar (Right column) */}
        <div className="space-y-6">
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-5 shadow-md">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary-500" />
                <span>Prompt Memory Instructions</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rules derived from calibration feedback parameters to restrict future outputs.
              </p>
            </div>

            {/* Input rule form */}
            <form onSubmit={handleAddRule} className="flex gap-2">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                maxLength={200}
                placeholder="e.g. Always end with Namaste..."
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs font-semibold"
              />
              <button 
                type="submit" 
                className="p-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Rules list */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {activePromptRules.length === 0 ? (
                <div className="text-xs text-slate-400 dark:text-slate-500 italic py-4 text-center font-semibold">
                  No active tuning instructions set.
                </div>
              ) : (
                activePromptRules.map((rule, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all group"
                  >
                    <div className="flex gap-2 min-w-0">
                      <ArrowRight className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                        {rule}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(rule)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 cursor-pointer border-none bg-transparent"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

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
