import React, { createContext, useContext, useState, useEffect } from 'react';
import { extractYoutubeVideoId } from '../utils/urlHelper';
import {
  safeParseStorage,
  validateInput,
  AnalyzedVideoSchema,
  LearningFeedbackSchema,
  PromptRulesArraySchema,
  YouTubeUrlSchema,
  PromptRuleSchema,
  GlobalBroadcastSchema,
} from '../utils/validation';
import { z } from 'zod';
import { fetchVideoDetails, fetchComments, postYouTubeReply } from '../services/youtube';
import { generateGeminiReply, analyzeVideoMetadata, analyzeAndDraftReplies } from '../services/gemini';
import { useAuth } from './AuthContext';
import type { CommentCategory, SentimentScore, EmotionType, PriorityTier, DecisionAction } from '../utils/commentMeta';
import { computePriorityScore, computeDecision } from '../utils/commentMeta';

export interface CommentReply {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  publishedAt: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  publishedAt: string;
  /** Phase 6: 5-way sentiment score */
  sentiment: SentimentScore;
  /** Phase 6: detected emotion */
  emotion?: EmotionType;
  /** Phase 6: 0-100 confidence score for sentiment */
  sentimentScore?: number;
  /** Phase 5: 17-category classification */
  category: CommentCategory;
  
  // Phase 7: Priority Score
  priorityScore?: number;
  priorityTier?: PriorityTier;
  isSuperThanks?: boolean;
  isMember?: boolean;
  isVerified?: boolean;
  thoughtfulnessScore?: number;

  // Phase 8: Decision Engine
  aiDecision?: DecisionAction;
  aiDecisionReason?: string;

  aiReply: string;
  originalAiReply?: string;
  status: 'pending' | 'replied' | 'ignored';
  repliedText?: string;
  replies?: CommentReply[];
  isPinned?: boolean;
  orderType?: 'top' | 'newest';
}

export interface LearningFeedback {
  id: string;
  commentText: string;
  originalReply: string;
  editedReply: string;
  reason: string;
  rating: number;
  submittedAt: string;
}

export interface AnalyzedVideo {
  id: string;
  url: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  views: string;
  publishedAt: string;
  comments: Comment[];
  analyzedAt: string;
  // Optional enriched fields from Gemini video analysis
  description?: string;
  transcript?: string;
  category?: string;
  keywords?: string[];
  summary?: string;
  mainTopic?: string;
  language?: string;
}

interface KPIStats {
  videosAnalyzed: number;
  totalComments: number;
  aiReplies: number;
  pendingReviews: number;
}

export type ApprovalMode = 'auto' | 'approve' | 'suggestion';

interface DashboardContextType {
  analyzedVideos: AnalyzedVideo[];
  currentVideo: AnalyzedVideo | null;
  kpis: KPIStats;
  isAnalyzing: boolean;
  approvalMode: ApprovalMode;
  feedbacks: LearningFeedback[];
  activePromptRules: string[];
  globalBroadcast: string | null;
  setGlobalBroadcast: (msg: string | null) => void;
  analyzeVideo: (url: string) => Promise<void>;
  approveReply: (videoId: string, commentId: string, replyText: string) => Promise<void>;
  ignoreComment: (videoId: string, commentId: string) => void;
  regenerateReply: (videoId: string, commentId: string) => void;
  updateReplyText: (videoId: string, commentId: string, text: string) => void;
  clearVideo: (videoId: string) => void;
  setApprovalMode: (mode: ApprovalMode) => void;
  setCurrentVideoById: (id: string) => void;
  submitFeedback: (feedback: Omit<LearningFeedback, 'id' | 'submittedAt'>) => void;
  addPromptRule: (rule: string) => void;
  removePromptRule: (rule: string) => void;
  /** Phase 5 & 6: Re-classify all comments for a video with full 17-cat + emotion */
  reclassifyComments: (videoId: string) => Promise<void>;
  /** Phase 8: Override/apply a decision action for a specific comment */
  applyDecision: (videoId: string, commentId: string, decision: DecisionAction, reason?: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);



export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuth(); // ensure auth context is present
  
  const [analyzedVideos, setAnalyzedVideos] = useState<AnalyzedVideo[]>(() => {
    const stored = safeParseStorage(
      'engage_ai_videos',
      z.array(AnalyzedVideoSchema),
      []
    );
    if (stored.length === 0) {
      return [];
    }
    return stored;
  });

  const [feedbacks, setFeedbacks] = useState<LearningFeedback[]>(() =>
    safeParseStorage(
      'engage_ai_learning_feedbacks',
      z.array(LearningFeedbackSchema),
      []
    )
  );

  const [activePromptRules, setActivePromptRules] = useState<string[]>(() =>
    safeParseStorage(
      'engage_ai_prompt_rules',
      PromptRulesArraySchema,
      [
        'Avoid emojis for critical feedback responses',
        'Keep educational breakdowns below 3 sentences',
        'Neutral responses must not sound overly enthusiastic'
      ]
    )
  );

  useEffect(() => {
    localStorage.setItem('engage_ai_learning_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem('engage_ai_prompt_rules', JSON.stringify(activePromptRules));
  }, [activePromptRules]);

  const submitFeedback = (fb: Omit<LearningFeedback, 'id' | 'submittedAt'>) => {
    const newFeedback: LearningFeedback = {
      ...fb,
      id: `fb-${Date.now()}`,
      submittedAt: new Date().toLocaleString()
    };
    setFeedbacks(prev => [newFeedback, ...prev]);

    // Simple heuristic to dynamically formulate prompt tuning recommendations:
    if (fb.rating <= 2) {
      let derivedRule = '';
      if (fb.reason === 'Too formal') {
        derivedRule = 'Adopt a warmer, more casual phrasing for casual viewers.';
      } else if (fb.reason === 'Wrong tone') {
        derivedRule = 'Align response sentiments strictly to comment contexts.';
      } else if (fb.reason === 'Incorrect details') {
        derivedRule = 'Double check video analysis data parameters before listing stats.';
      } else if (fb.reason === 'Too informal') {
        derivedRule = 'Elevate vocabulary and avoid slang elements.';
      }
      
      if (derivedRule && !activePromptRules.includes(derivedRule)) {
        setActivePromptRules(prev => [...prev, derivedRule]);
      }
    }
  };

  const addPromptRule = (rule: string) => {
    const validation = validateInput(PromptRuleSchema, rule);
    if (!validation.success) {
      if (import.meta.env.DEV) {
        console.warn('[Validation] addPromptRule rejected:', validation.error);
      }
      return;
    }
    const trimmed = validation.data;
    if (!activePromptRules.includes(trimmed)) {
      setActivePromptRules(prev => [...prev, trimmed]);
    }
  };

  const removePromptRule = (rule: string) => {
    setActivePromptRules(prev => prev.filter(r => r !== rule));
  };
  const [currentVideo, setCurrentVideo] = useState<AnalyzedVideo | null>(() => {
    const stored = safeParseStorage('engage_ai_videos', z.array(AnalyzedVideoSchema), []);
    return stored.length > 0 ? stored[0] : null;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('approve');
  
  const [globalBroadcast, setGlobalBroadcastState] = useState<string | null>(() => {
    const raw = localStorage.getItem('engage_ai_global_broadcast');
    if (!raw) return null;
    const validation = validateInput(GlobalBroadcastSchema, raw);
    return validation.success ? validation.data : null;
  });

  const setGlobalBroadcast = (msg: string | null) => {
    if (msg !== null) {
      const validation = validateInput(GlobalBroadcastSchema, msg);
      if (!validation.success) return; // reject invalid broadcasts silently
      setGlobalBroadcastState(validation.data);
      localStorage.setItem('engage_ai_global_broadcast', validation.data);
    } else {
      setGlobalBroadcastState(null);
      localStorage.removeItem('engage_ai_global_broadcast');
    }
  };

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('engage_ai_videos', JSON.stringify(analyzedVideos));
  }, [analyzedVideos]);

  // Recalculate KPIs dynamically based on all analyzed videos
  const kpis: KPIStats = React.useMemo(() => {
    let totalCommentsCount = 0;
    let aiRepliesCount = 0;
    let pendingReviewsCount = 0;

    analyzedVideos.forEach(v => {
      totalCommentsCount += v.comments.length;
      v.comments.forEach(c => {
        if (c.status === 'replied') {
          aiRepliesCount++;
        } else if (c.status === 'pending') {
          pendingReviewsCount++;
        }
      });
    });

    return {
      videosAnalyzed: analyzedVideos.length,
      totalComments: totalCommentsCount,
      aiReplies: aiRepliesCount,
      pendingReviews: pendingReviewsCount
    };
  }, [analyzedVideos]);

  // Helper to extract video ID
  const extractVideoId = (url: string): string => {
    return extractYoutubeVideoId(url) || 'default_id';
  };

  const analyzeVideo = async (url: string) => {
    // Validate the URL with Zod before any processing
    const urlValidation = validateInput(YouTubeUrlSchema, url);
    if (!urlValidation.success) {
      throw new Error(urlValidation.error);
    }

    setIsAnalyzing(true);

    try {
      const videoId = extractVideoId(urlValidation.data);
      const existing = analyzedVideos.find(v => v.id === videoId);

      if (existing) {
        setCurrentVideo(existing);
        setIsAnalyzing(false);
        return;
      }

      // Fetch real video metadata and comments using YouTube API
      const apiKey = localStorage.getItem('engage_ai_youtube_api_key') || '';
      if (!apiKey) {
        throw new Error('YouTube API key not set. Please add it in Settings.');
      }
      const videoMeta = await fetchVideoDetails(videoId, apiKey);

      // Analyze metadata with Gemini to produce context details (transcript, category, keywords, summary, main topic, language)
      const analysis = await analyzeVideoMetadata(videoMeta.title, videoMeta.description, videoMeta.tags);

      const fetchedComments = await fetchComments(videoId, apiKey);

      // Draft context-aware AI replies and classify comments in a single batch
      const draftedComments = await analyzeAndDraftReplies(fetchedComments, {
        title: videoMeta.title,
        description: videoMeta.description,
        transcript: analysis.transcript,
        category: analysis.category,
        keywords: analysis.keywords,
        summary: analysis.summary,
        mainTopic: analysis.mainTopic,
        language: analysis.language,
        channelRules: activePromptRules,
        pastLearnings: feedbacks,
      }, approvalMode);

      const processedComments = draftedComments.map((c, idx) => {
        const textLower = c.text.toLowerCase();
        const isSuperThanks = (textLower.includes('thank') || textLower.includes('love') || textLower.includes('awesome') || textLower.includes('super') || textLower.includes('support')) && idx % 7 === 3;
        const isMember = idx % 5 === 1;
        const isVerified = idx % 6 === 2;

        const enriched = {
          ...c,
          isSuperThanks,
          isMember,
          isVerified
        };

        const { score, tier } = computePriorityScore(enriched.category, {
          isSuperThanks: enriched.isSuperThanks,
          isMember: enriched.isMember,
          isPinned: enriched.isPinned,
          isVerified: enriched.isVerified,
          textLength: enriched.text.length,
          sentiment: enriched.sentiment,
          thoughtfulnessScore: enriched.thoughtfulnessScore,
        });

        // Phase 8: compute decision — use Gemini aiDecision if present, else deterministic
        const localDecision = computeDecision(
          enriched.category, tier, enriched.sentiment,
          enriched.isMember, enriched.isSuperThanks, enriched.isVerified, enriched.thoughtfulnessScore
        );

        return {
          ...enriched,
          originalAiReply: enriched.aiReply,
          priorityScore: score,
          priorityTier: tier,
          aiDecision: (enriched as any).aiDecision ?? localDecision.action,
          aiDecisionReason: (enriched as any).aiDecisionReason ?? localDecision.reason,
        };
      });

      const newVideo: AnalyzedVideo = {
        id: videoId,
        url,
        title: videoMeta.title,
        channelTitle: videoMeta.channelTitle,
        thumbnail: videoMeta.thumbnail,
        views: videoMeta.views,
        publishedAt: videoMeta.publishedAt,
        comments: processedComments,
        analyzedAt: new Date().toISOString(),
        description: videoMeta.description,
        transcript: analysis.transcript,
        category: analysis.category,
        keywords: analysis.keywords,
        summary: analysis.summary,
        mainTopic: analysis.mainTopic,
        language: analysis.language
      };

      setAnalyzedVideos(prev => [newVideo, ...prev]);
      setCurrentVideo(newVideo);
    } catch (error) {
      console.error('Error analyzing video:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const approveReply = async (videoId: string, commentId: string, replyText: string) => {
    const youtubeApiKey = localStorage.getItem('engage_ai_youtube_api_key') || '';
    if (!youtubeApiKey) {
      console.error('No YouTube API key set. Configure it in Settings.');
      return;
    }

    const video = analyzedVideos.find(v => v.id === videoId);
    const comment = video?.comments.find(c => c.id === commentId);

    // Phase 14: Learning System — capture edits
    if (comment && comment.originalAiReply && comment.originalAiReply !== replyText) {
      submitFeedback({
        commentText: comment.text,
        originalReply: comment.originalAiReply,
        editedReply: replyText,
        reason: 'Creator manually edited AI draft before posting.',
        rating: 5
      });
    }

    try {
      const newReply = await postYouTubeReply(commentId, replyText, youtubeApiKey);

      setAnalyzedVideos(prev => prev.map(video => {
        if (video.id !== videoId) return video;
        
        const updatedComments = video.comments.map(c => {
          if (c.id !== commentId) return c;
          return {
            ...c,
            status: 'replied' as const,
            repliedText: replyText,
            replies: [...(c.replies || []), newReply]
          };
        });

        return { ...video, comments: updatedComments };
      }));

      // Sync current active video
      setCurrentVideo(prev => {
        if (!prev || prev.id !== videoId) return prev;
        return {
          ...prev,
          comments: prev.comments.map(c => 
            c.id === commentId ? { 
              ...c, 
              status: 'replied' as const, 
              repliedText: replyText,
              replies: [...(c.replies || []), newReply] 
            } : c
          )
        };
      });
    } catch (error) {
      console.error('Error posting YouTube reply:', error);
      // Depending on the app's error handling, we might want to alert the user here
      throw error;
    }
  };

  const ignoreComment = (videoId: string, commentId: string) => {
    setAnalyzedVideos(prev => prev.map(video => {
      if (video.id !== videoId) return video;
      
      const updatedComments = video.comments.map(c => {
        if (c.id !== commentId) return c;
        return { ...c, status: 'ignored' as const };
      });

      return { ...video, comments: updatedComments };
    }));

    setCurrentVideo(prev => {
      if (!prev || prev.id !== videoId) return prev;
      return {
        ...prev,
        comments: prev.comments.map(c => 
          c.id === commentId ? { ...c, status: 'ignored' as const } : c
        )
      };
    });
  };

  const regenerateReply = async (videoId: string, commentId: string) => {
    const video = analyzedVideos.find(v => v.id === videoId);
    const comment = video?.comments.find(c => c.id === commentId);
    if (!comment || !video) return;

    try {
      // Phase 9: pass full 7-layer context for grounded, natural reply generation
      const newReply = await generateGeminiReply(comment.text, {
        title: video.title,
        description: video.description,
        transcript: video.transcript,
        category: video.category,
        keywords: video.keywords,
        summary: video.summary,
        mainTopic: video.mainTopic,
        language: video.language,
        // Phase 9 enrichments
        channelRules: activePromptRules,
        previousReplies: comment.replies,
        commentCategory: comment.category,
        commentSentiment: comment.sentiment,
        pastLearnings: feedbacks,
      }, 'approve'); // Always pass 'approve' here so explicit generation works
      // Update comment with new AI reply
      setAnalyzedVideos(prev => prev.map(v => {
        if (v.id !== videoId) return v;
        const updatedComments = v.comments.map(c =>
          c.id === commentId ? { ...c, aiReply: newReply, originalAiReply: newReply } : c
        );
        return { ...v, comments: updatedComments };
      }));
      setCurrentVideo(prev => {
        if (!prev || prev.id !== videoId) return prev;
        const updatedComments = prev.comments.map(c =>
          c.id === commentId ? { ...c, aiReply: newReply, originalAiReply: newReply } : c
        );
        return { ...prev, comments: updatedComments };
      });
    } catch (err) {
      console.error('Gemini reply generation failed', err);
    }
  };

  const updateReplyText = (videoId: string, commentId: string, text: string) => {
    setAnalyzedVideos(prev => prev.map(video => {
      if (video.id !== videoId) return video;
      
      const updatedComments = video.comments.map(c => {
        if (c.id !== commentId) return c;
        return { ...c, aiReply: text };
      });

      return { ...video, comments: updatedComments };
    }));

    setCurrentVideo(prev => {
      if (!prev || prev.id !== videoId) return prev;
      return {
        ...prev,
        comments: prev.comments.map(c => 
          c.id === commentId ? { ...c, aiReply: text } : c
        )
      };
    });
  };

  const clearVideo = (videoId: string) => {
    setAnalyzedVideos(prev => prev.filter(v => v.id !== videoId));
    if (currentVideo?.id === videoId) {
      setCurrentVideo(null);
    }
  };

  const setCurrentVideoById = (id: string) => {
    const video = analyzedVideos.find(v => v.id === id);
    if (video) {
      setCurrentVideo(video);
    }
  };

  // Phase 8 Auto-pilot: decision-aware routing
  useEffect(() => {
    if (approvalMode !== 'auto' || !currentVideo) return;

    const pendingComments = currentVideo.comments.filter(c => c.status === 'pending');
    if (pendingComments.length === 0) {
      setApprovalMode('approve');
      return;
    }

    const timer = setTimeout(() => {
      // 1. Process flag/hide/ignore first to clear the queue
      const highPriorityMute = pendingComments.find(
        (c) => c.aiDecision === 'flag' || c.aiDecision === 'hide' || c.aiDecision === 'ignore'
          || c.category === 'Hate' || c.category === 'Spam' || c.category === 'Bot'
      );
      if (highPriorityMute) {
        ignoreComment(currentVideo.id, highPriorityMute.id);
        return;
      }

      // 2. Sort actionable comments (reply/escalate/like/heart) by priorityScore desc
      const actionable = pendingComments
        .filter(c => c.aiDecision !== 'flag' && c.aiDecision !== 'hide' && c.aiDecision !== 'ignore')
        .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));

      if (actionable.length > 0) {
        const top = actionable[0];
        // For reply/escalate: approve the reply text; for like/heart: also approve
        approveReply(currentVideo.id, top.id, top.aiReply).catch(err => {
          console.error("Auto-pilot failed to post reply:", err);
          // If a post fails, revert to manual mode so the user can investigate
          setApprovalMode('approve');
        });
      } else {
        setApprovalMode('approve');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [approvalMode, currentVideo]);


  /**
   * Phase 8: Override the AI decision for a specific comment.
   * Creators can change the recommended action at any time.
   */
  const applyDecision = (videoId: string, commentId: string, decision: DecisionAction, reason?: string) => {
    const updater = (comments: Comment[]) =>
      comments.map(c =>
        c.id === commentId
          ? { ...c, aiDecision: decision, aiDecisionReason: reason ?? c.aiDecisionReason }
          : c
      );

    setAnalyzedVideos(prev =>
      prev.map(v => v.id !== videoId ? v : { ...v, comments: updater(v.comments) })
    );
    setCurrentVideo(prev =>
      prev && prev.id === videoId ? { ...prev, comments: updater(prev.comments) } : prev
    );
  };

  /**
   * Phase 5 & 6: Re-run full Gemini classification for all comments in a video.
   * Updates category (17-way), sentiment (5-way), emotion, and sentimentScore.
   */
  const reclassifyComments = async (videoId: string) => {
    const video = analyzedVideos.find(v => v.id === videoId);
    if (!video) return;

    try {
      const reclassified = await analyzeAndDraftReplies(video.comments, {
        title: video.title,
        description: video.description,
        transcript: video.transcript,
        category: video.category,
        keywords: video.keywords,
        summary: video.summary,
        mainTopic: video.mainTopic,
        language: video.language,
        channelRules: activePromptRules,
        pastLearnings: feedbacks,
      }, approvalMode);

      const processed = reclassified.map((c) => {
        const existing = video.comments.find(xc => xc.id === c.id);
        const enriched = {
          ...c,
          isSuperThanks: existing?.isSuperThanks ?? c.isSuperThanks,
          isMember: existing?.isMember ?? c.isMember,
          isVerified: existing?.isVerified ?? c.isVerified,
        };

        const { score, tier } = computePriorityScore(enriched.category, {
          isSuperThanks: enriched.isSuperThanks,
          isMember: enriched.isMember,
          isPinned: enriched.isPinned,
          isVerified: enriched.isVerified,
          textLength: enriched.text.length,
          sentiment: enriched.sentiment,
          thoughtfulnessScore: enriched.thoughtfulnessScore,
        });

        const localDecision = computeDecision(
          enriched.category, tier, enriched.sentiment,
          enriched.isMember, enriched.isSuperThanks, enriched.isVerified, enriched.thoughtfulnessScore
        );

        return {
          ...enriched,
          originalAiReply: enriched.aiReply,
          priorityScore: score,
          priorityTier: tier,
          aiDecision: (enriched as any).aiDecision ?? localDecision.action,
          aiDecisionReason: (enriched as any).aiDecisionReason ?? localDecision.reason,
        };
      });

      setAnalyzedVideos(prev =>
        prev.map(v => (v.id !== videoId ? v : { ...v, comments: processed }))
      );
      setCurrentVideo(prev =>
        prev && prev.id === videoId ? { ...prev, comments: processed } : prev
      );
    } catch (err) {
      console.error('reclassifyComments failed:', err);
    }
  };

  return (
    <DashboardContext.Provider value={{
      analyzedVideos,
      currentVideo,
      kpis,
      isAnalyzing,
      approvalMode,
      feedbacks,
      activePromptRules,
      globalBroadcast,
      setGlobalBroadcast,
      analyzeVideo,
      approveReply,
      ignoreComment,
      regenerateReply,
      updateReplyText,
      clearVideo,
      setApprovalMode,
      setCurrentVideoById,
      submitFeedback,
      addPromptRule,
      removePromptRule,
      reclassifyComments,
      applyDecision
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
