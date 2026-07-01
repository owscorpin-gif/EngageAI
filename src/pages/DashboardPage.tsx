import React from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  ArrowRight,
  Trash2, 
  MessageCircle,
  Play
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { kpis, analyzedVideos, setCurrentVideoById, clearVideo } = useDashboard();
  const navigate = useNavigate();

  const handleSelectVideoForModeration = (id: string) => {
    setCurrentVideoById(id);
    navigate('/analyze');
  };

  const kpiCards = [
    { 
      title: 'Videos Analyzed', 
      value: kpis.videosAnalyzed, 
      desc: kpis.videosAnalyzed > 0 ? 'Active session library' : 'No activity this session', 
      icon: Video, 
      color: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/10' 
    },
    { 
      title: 'Total Comments', 
      value: kpis.totalComments, 
      desc: kpis.totalComments > 0 ? 'Crawled from feed' : 'Waiting for connection', 
      icon: MessageSquare, 
      color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' 
    },
    { 
      title: 'AI Replies', 
      value: kpis.aiReplies, 
      desc: kpis.aiReplies > 0 ? `${kpis.aiReplies} replies proposed/posted` : 'Auto-pilot disabled', 
      icon: Sparkles, 
      color: 'text-amber-500 bg-amber-500/5 border-amber-500/10' 
    },
    { 
      title: 'Pending Reviews', 
      value: kpis.pendingReviews, 
      desc: kpis.pendingReviews > 0 ? 'Awaiting creator check' : 'Inbox is clean', 
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
          Track video statistics, review pending drafts, and view automated replies across your channels.
        </p>
      </div>

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
                <span className="font-heading font-extrabold text-4xl text-slate-900 dark:text-white tracking-tight animate-slide-in">
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

      {/* Recently Analyzed History Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-xl text-slate-800 dark:text-slate-100">
            Session Analysis History
          </h2>
          {analyzedVideos.length > 0 && (
            <button 
              onClick={() => navigate('/analyze')}
              className="flex items-center gap-1.5 text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors cursor-pointer"
            >
              <span>Analyze New Video</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {analyzedVideos.length === 0 ? (
          /* Empty History CTA */
          <div className="glass-panel rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">
                No videos analyzed yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Connect your first YouTube video link to start crawler and drafting replies in seconds.
              </p>
            </div>
            <button
              onClick={() => navigate('/analyze')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-md shadow-primary-500/10 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Start Analyzing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* History Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyzedVideos.map((video) => {
              const pendingCount = video.comments.filter(c => c.status === 'pending').length;
              const repliedCount = video.comments.filter(c => c.status === 'replied').length;

              return (
                <div 
                  key={video.id}
                  className="glass-panel rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/60 shadow-sm hover:shadow-xl hover:scale-[1.005] transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="p-5 flex gap-4">
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 group">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                        {video.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold truncate">
                        {video.channelTitle} • {video.views}
                      </p>
                    </div>
                  </div>

                  {/* Footer Stats / Action Bar */}
                  <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between gap-4">
                    <div className="flex gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{repliedCount} Replied</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>{pendingCount} Pending</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => clearVideo(video.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent transition-all cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSelectVideoForModeration(video.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                      >
                        <span>Moderate</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

