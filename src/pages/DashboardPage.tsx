import React, { useMemo } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Sparkles, 
  Clock, 
  ShieldAlert,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  Edit2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { analyzedVideos, approveReply, ignoreComment } = useDashboard();
  const navigate = useNavigate();

  // Aggregate metrics across all videos
  const metrics = useMemo(() => {
    let commentsToday = 0;
    let repliesGenerated = 0;
    let pending = 0;
    let spam = 0;
    let questions = 0;
    let positive = 0;
    let negative = 0;

    analyzedVideos.forEach(video => {
      video.comments.forEach(c => {
        commentsToday++;
        if (c.status === 'replied') repliesGenerated++;
        if (c.status === 'pending') pending++;
        if (c.category === 'Spam') spam++;
        if (c.category === 'Question') questions++;
        if (c.sentiment === 'positive' || c.sentiment === 'excited') positive++;
        if (c.sentiment === 'negative' || c.sentiment === 'very_angry') negative++;
      });
    });

    return { commentsToday, repliesGenerated, pending, spam, questions, positive, negative };
  }, [analyzedVideos]);

  // Aggregate recent comments across all videos
  const recentComments = useMemo(() => {
    const all = analyzedVideos.flatMap(v => v.comments.map(c => ({ ...c, videoId: v.id, videoTitle: v.title })));
    // Sort logic could be added here if dates were present, but for now we'll just reverse to show latest first
    return all.reverse().slice(0, 50); // Show top 50
  }, [analyzedVideos]);

  const kpiCards = [
    { title: 'Comments Today', value: metrics.commentsToday, icon: MessageSquare, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Replies Generated', value: metrics.repliesGenerated, icon: Sparkles, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Pending', value: metrics.pending, icon: Clock, color: 'text-slate-500 bg-slate-500/10' },
    { title: 'Spam', value: metrics.spam, icon: ShieldAlert, color: 'text-rose-500 bg-rose-500/10' },
    { title: 'Questions', value: metrics.questions, icon: HelpCircle, color: 'text-indigo-500 bg-indigo-500/10' },
    { title: 'Positive', value: metrics.positive, icon: ThumbsUp, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Negative', value: metrics.negative, icon: ThumbsDown, color: 'text-red-500 bg-red-500/10' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-in">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
          Real-time overview of your channel engagement.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className="glass-panel border border-slate-200/80 dark:border-slate-800/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 flex flex-col justify-center items-center text-center gap-2"
            >
              <div className={`p-2 rounded-xl ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
                {card.value}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
            </div>
          );
        })}
      </section>

      {/* Recent Comments Feed */}
      <section className="space-y-4">
        <h2 className="font-heading font-bold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Recent Comments
        </h2>
        
        <div className="space-y-4">
          {recentComments.length === 0 ? (
            <div className="glass-panel p-8 rounded-3xl text-center text-slate-500">
              No comments found. Connect a video to get started.
            </div>
          ) : (
            recentComments.map((comment) => (
              <div key={comment.id} className="glass-panel p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/60 shadow-sm flex flex-col md:flex-row gap-6">
                {/* Left: User Comment */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={comment.authorAvatar} alt={comment.authorName} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{comment.authorName}</h4>
                      <p className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">{comment.videoTitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                    {comment.text}
                  </p>
                </div>

                {/* Right: AI Reply & Actions */}
                <div className="flex-1 space-y-3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> AI Reply
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      comment.status === 'replied' ? 'bg-emerald-500/10 text-emerald-500' :
                      comment.status === 'ignored' ? 'bg-slate-500/10 text-slate-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {comment.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 bg-primary-50 dark:bg-primary-500/5 p-3 rounded-2xl italic border border-primary-100 dark:border-primary-500/10">
                    "{comment.aiReply}"
                  </p>
                  
                  {comment.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-2">
                      <button 
                        onClick={() => approveReply(comment.videoId, comment.id, comment.aiReply)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button 
                        onClick={() => ignoreComment(comment.videoId, comment.id)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button 
                        onClick={() => navigate('/categorize')} // User can go to categorize page to edit
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                        title="Edit Reply"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
