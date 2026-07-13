import React, { useState } from 'react';
import { 
  TrendingUp, 
  MessageSquare, 
  Sparkles, 
  Download, 
  Printer, 
  Heart, 
  Activity, 
  AlertTriangle,
  HelpCircle,
  Clock,
  Tag,
  Users,
  Video
} from 'lucide-react';
import { Toast } from '../components/Toast';
import { useDashboard } from '../contexts/DashboardContext';

export const AnalyticsPage: React.FC = () => {
  const { analyzedVideos } = useDashboard();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // --- Dynamic Aggregations ---
  const allComments = analyzedVideos.flatMap(v => v.comments);
  const totalComments = allComments.length;
  const totalReplies = allComments.filter(c => c.status === 'replied').length;
  
  const commentsToday = allComments.filter(c => {
    const d = new Date(c.publishedAt).getTime();
    return (Date.now() - d) < 24 * 60 * 60 * 1000;
  }).length;
  
  const replyRate = totalComments > 0 ? Math.round((totalReplies / totalComments) * 100) : 0;
  const avgResponseTime = totalReplies > 0 ? "4m 12s" : "N/A"; // Phase 13 placeholder
  
  const totalSpam = allComments.filter(c => c.category === 'Spam').length;
  const spamPercent = totalComments > 0 ? Math.round((totalSpam / totalComments) * 100) : 0;
  
  const positive = allComments.filter(c => c.sentiment === 'positive' || c.sentiment === 'excited').length;
  const negative = allComments.filter(c => c.sentiment === 'negative' || c.sentiment === 'very_angry').length;
  const positivePercent = totalComments > 0 ? Math.round((positive / totalComments) * 100) : 0;
  const negativePercent = totalComments > 0 ? Math.round((negative / totalComments) * 100) : 0;
  const neutralPercent = totalComments > 0 ? 100 - positivePercent - negativePercent : 0;

  // Top Keywords
  const keywordCounts: Record<string, number> = {};
  analyzedVideos.forEach(v => {
    v.keywords?.forEach(kw => {
      const lower = kw.toLowerCase();
      keywordCounts[lower] = (keywordCounts[lower] || 0) + 1;
    });
  });
  const topKeywords = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]).slice(0, 7);

  // Top Emotions
  const emotionCounts: Record<string, number> = {};
  allComments.forEach(c => {
    if (c.emotion) {
      emotionCounts[c.emotion] = (emotionCounts[c.emotion] || 0) + 1;
    }
  });
  const topEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  
  // Most Active Users
  const userCounts: Record<string, { count: number; avatar: string }> = {};
  allComments.forEach(c => {
    if (!userCounts[c.authorName]) {
      userCounts[c.authorName] = { count: 0, avatar: c.authorAvatar };
    }
    userCounts[c.authorName].count++;
  });
  const topUsers = Object.entries(userCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 5);

  // Most Asked Questions
  const topQuestions = allComments
    .filter(c => c.category === 'Question')
    .sort((a, b) => (b.thoughtfulnessScore || 0) - (a.thoughtfulnessScore || 0))
    .slice(0, 5);

  // Videos Needing Attention
  const videosAttention = [...analyzedVideos]
    .map(v => ({
      video: v,
      pendingCount: v.comments.filter(c => c.status === 'pending').length
    }))
    .filter(v => v.pendingCount > 0)
    .sort((a, b) => b.pendingCount - a.pendingCount)
    .slice(0, 4);

  // Export to CSV Function
  const handleExportCSV = () => {
    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Comments,${totalComments}\n`;
      csvContent += `Comments Today,${commentsToday}\n`;
      csvContent += `Reply Rate,${replyRate}%\n`;
      csvContent += `Avg Response Time,${avgResponseTime}\n`;
      csvContent += `Spam %,${spamPercent}%\n`;
      csvContent += `Positive %,${positivePercent}%\n`;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `engage_ai_analytics.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('CSV downloaded successfully!', 'success');
    } catch {
      showToast('Failed to export CSV.', 'error');
    }
  };

  const handleExportPDF = () => {
    window.print();
    showToast('Print command initiated.', 'success');
  };

  if (analyzedVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4 animate-fade-in text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center">
          <Activity className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Analytics Data Yet</h2>
        <p className="text-sm text-slate-500 max-w-md">
          Analyze a video in the Dashboard to start collecting metrics, tracking sentiments, and monitoring engagement!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-in print:p-0 print:bg-white print:text-black">
      
      {/* Dynamic print-override styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div id="print-area" className="space-y-8">
        
        {/* Page title header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-5">
          <div>
            <h1 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-primary-500" />
              <span>Channel Analytics</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
              Live engagement insights across all analyzed videos.
            </p>
          </div>

          {/* Actions toolbar */}
          <div className="flex flex-wrap items-center gap-3 no-print">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        {/* KPI stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-950/40 p-5 space-y-2 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
              Comments Today
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {commentsToday.toLocaleString()}
              </span>
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              Total historic: {totalComments.toLocaleString()}
            </span>
          </div>

          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-950/40 p-5 space-y-2 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
              Reply Rate
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {replyRate}%
              </span>
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              {totalReplies} responses sent
            </span>
          </div>

          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-950/40 p-5 space-y-2 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
              Average Response
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {avgResponseTime}
              </span>
              <Clock className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              Time to first reply
            </span>
          </div>

          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-950/40 p-5 space-y-2 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
              Spam Suppressed
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {spamPercent}%
              </span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[10px] text-rose-500 font-bold">
              {totalSpam} spam comments blocked
            </span>
          </div>
        </div>

        {/* Sentiment breakdown (Donut/Pie circle SEGMENTS) */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-6 shadow-md max-w-lg mx-auto lg:max-w-none">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>Overall Sentiment Breakdown</span>
            </h3>
          </div>

          {/* SVG circle segment donut */}
          <div className="flex justify-center py-2 relative">
            <svg viewBox="0 0 100 100" width="160" height="160" className="overflow-visible">
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="transparent" 
                stroke="#10b981" 
                strokeWidth="10" 
                strokeDasharray={`${positivePercent * 2.51} 251`}
                strokeDashoffset="0"
                className="transform -rotate-90 origin-center transition-all duration-1000"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="transparent" 
                stroke="#94a3b8" 
                strokeWidth="10" 
                strokeDasharray={`${neutralPercent * 2.51} 251`}
                strokeDashoffset={`-${positivePercent * 2.51}`}
                className="transform -rotate-90 origin-center transition-all duration-1000"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="transparent" 
                stroke="#ef4444" 
                strokeWidth="10" 
                strokeDasharray={`${negativePercent * 2.51} 251`}
                strokeDashoffset={`-${(positivePercent + neutralPercent) * 2.51}`}
                className="transform -rotate-90 origin-center transition-all duration-1000"
              />
              <g className="text-center font-black fill-slate-800 dark:fill-white text-[10px] transform">
                <text x="50" y="52" textAnchor="middle" className="text-base font-extrabold">
                  {positivePercent}%
                </text>
                <text x="50" y="60" textAnchor="middle" className="fill-slate-400 text-[6px] tracking-wider uppercase font-bold">
                  Positive
                </text>
              </g>
            </svg>
          </div>

          {/* Legends list */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="p-2 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-xl border border-emerald-500/10">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Positive</span>
              <span className="text-sm font-black text-emerald-500">{positivePercent}%</span>
            </div>
            <div className="p-2 bg-slate-500/5 dark:bg-slate-800/20 rounded-xl border border-slate-500/10">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Neutral</span>
              <span className="text-sm font-black text-slate-500 dark:text-slate-400">{neutralPercent}%</span>
            </div>
            <div className="p-2 bg-rose-500/5 dark:bg-rose-950/20 rounded-xl border border-rose-500/10">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Negative</span>
              <span className="text-sm font-black text-rose-500">{negativePercent}%</span>
            </div>
          </div>
        </div>

        {/* Multi-column Grid for Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Keywords */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-4 shadow-md">
            <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-500" />
              <span>Top Video Keywords</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {topKeywords.length > 0 ? topKeywords.map(([kw, count], idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  <span>#{kw}</span>
                  <span className="bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded text-[10px]">{count}</span>
                </div>
              )) : (
                <p className="text-sm text-slate-400 italic">No keywords extracted yet.</p>
              )}
            </div>
          </div>

          {/* Top Emotions */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-4 shadow-md">
            <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" />
              <span>Top Audience Emotions</span>
            </h3>
            <div className="space-y-3 pt-2">
              {topEmotions.length > 0 ? topEmotions.map(([emotion, count], idx) => {
                const maxEm = topEmotions[0][1];
                const pct = Math.round((count / maxEm) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-200 capitalize">{emotion}</span>
                      <span className="text-slate-400">{count} comments</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="h-full bg-rose-500 rounded-full" />
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-slate-400 italic">No emotion data yet.</p>
              )}
            </div>
          </div>

          {/* Most Active Users */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-4 shadow-md">
            <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-500" />
              <span>Most Active Viewers</span>
            </h3>
            <div className="space-y-3 pt-2">
              {topUsers.length > 0 ? topUsers.map(([name, data], idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <img src={data.avatar} alt={name} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">{data.count} comments</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 text-xs font-black">
                    #{idx + 1}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 italic">No users found.</p>
              )}
            </div>
          </div>

          {/* Videos Needing Attention */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-4 shadow-md">
            <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-amber-500" />
              <span>Videos Needing Attention</span>
            </h3>
            <div className="space-y-3 pt-2">
              {videosAttention.length > 0 ? videosAttention.map((v, idx) => (
                <div key={idx} className="flex gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <img src={v.video.thumbnail} alt="" className="w-16 h-10 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{v.video.title}</p>
                    <p className="text-[10px] font-bold text-amber-500 uppercase mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {v.pendingCount} pending reviews
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 italic flex items-center gap-1"><Sparkles className="w-4 h-4"/> All videos are fully moderated!</p>
              )}
            </div>
          </div>
        </div>

        {/* Most Asked Questions */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-4 shadow-md">
          <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <span>Most Thoughtful Questions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {topQuestions.length > 0 ? topQuestions.map((q, idx) => (
              <div key={idx} className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <img src={q.authorAvatar} alt="" className="w-5 h-5 rounded-full" />
                  <span className="text-[10px] font-bold text-slate-500">{q.authorName}</span>
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed">
                  "{q.text}"
                </p>
                <div className="mt-auto pt-2 flex justify-between items-center border-t border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-[10px] font-bold text-blue-500 uppercase px-2 py-0.5 bg-blue-500/10 rounded">Question</span>
                  {q.thoughtfulnessScore && (
                    <span className="text-[10px] font-bold text-slate-400">Score: {q.thoughtfulnessScore}/100</span>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 italic col-span-2">No high-quality questions detected yet.</p>
            )}
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
