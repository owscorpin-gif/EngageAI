import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  publishedAt: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: 'Question' | 'Feedback' | 'Spam' | 'Appreciation';
  aiReply: string;
  status: 'pending' | 'replied' | 'ignored';
  repliedText?: string;
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
}

interface KPIStats {
  videosAnalyzed: number;
  totalComments: number;
  aiReplies: number;
  pendingReviews: number;
}

interface DashboardContextType {
  analyzedVideos: AnalyzedVideo[];
  currentVideo: AnalyzedVideo | null;
  kpis: KPIStats;
  isAnalyzing: boolean;
  autoPilotActive: boolean;
  analyzeVideo: (url: string) => Promise<void>;
  approveReply: (videoId: string, commentId: string, replyText: string) => void;
  ignoreComment: (videoId: string, commentId: string) => void;
  regenerateReply: (videoId: string, commentId: string) => void;
  updateReplyText: (videoId: string, commentId: string, text: string) => void;
  clearVideo: (videoId: string) => void;
  toggleAutoPilot: () => void;
  setCurrentVideoById: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const PRESET_MOCK_VIDEOS: Record<string, Omit<AnalyzedVideo, 'comments' | 'analyzedAt'>> = {
  'dQw4w9WgXcQ': {
    id: 'dQw4w9WgXcQ',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    channelTitle: 'Rick Astley',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    views: '1.4B views',
    publishedAt: '16 years ago'
  },
  'v8n43Ssd114': {
    id: 'v8n43Ssd114',
    url: 'https://www.youtube.com/watch?v=v8n43Ssd114',
    title: 'Is this new AI framework actually good? | Hands-on Review',
    channelTitle: 'Fireship.io',
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=480&auto=format&fit=crop&q=80',
    views: '245K views',
    publishedAt: '2 days ago'
  }
};

const MOCK_COMMENTS_TEMPLATES = [
  {
    authorName: 'Alex Johnson',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    text: 'Can you explain how the authentication middleware is secured? I am trying to implement this in my own production app.',
    sentiment: 'neutral' as const,
    category: 'Question' as const,
    replies: [
      'Hi Alex! The authentication middleware is secured using Firebase JWT token validation. Let me know if you need code snippets!',
      'Great question Alex! We validate the token sent in the authorization header using firebase-admin. Let me know if you want the setup guide.'
    ]
  },
  {
    authorName: 'Sarah Miller',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    text: 'Absolutely love this walkthrough! Simple, clear, and very well edited. Subscribed immediately!',
    sentiment: 'positive' as const,
    category: 'Appreciation' as const,
    replies: [
      'Thank you so much, Sarah! Appreciate the support and welcome to the channel!',
      'Thanks Sarah! Glad you found it helpful. More content coming soon!'
    ]
  },
  {
    authorName: 'Dev_Guru_99',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    text: 'Great video, but there is a bug in the styling of the mobile menu. It overlaps the main heading when resized below 640px.',
    sentiment: 'negative' as const,
    category: 'Feedback' as const,
    replies: [
      'Thanks for pointing that out! I will look into the CSS for the mobile layout and push a fix. Appreciate the feedback.',
      'Aha! Good catch on the responsive break. I will update the Tailwind classes shortly.'
    ]
  },
  {
    authorName: 'CryptoMoonBot',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    text: 'Make 500$ daily easily! Click my channel link for free binary trading signal bots, 100% legit and approved!',
    sentiment: 'neutral' as const,
    category: 'Spam' as const,
    replies: [
      '[Draft Muted: Comment classified as Spam. Auto-respond disabled.]'
    ]
  },
  {
    authorName: 'Michael Chang',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    text: 'When is the next episode coming out? You mentioned a part 2 on database integration and hosting.',
    sentiment: 'neutral' as const,
    category: 'Question' as const,
    replies: [
      'Hi Michael! Part 2 is currently in production and is scheduled to launch next Tuesday. Stay tuned!',
      'Hey Michael! I am working on the database integration video now. Hoping to post it by early next week!'
    ]
  },
  {
    authorName: 'Emily Taylor',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    text: 'The best explanation of this topic on the entire platform. The visual animations really helped me grasp the state management.',
    sentiment: 'positive' as const,
    category: 'Appreciation' as const,
    replies: [
      'Wow, thank you Emily! It took a lot of time to make those animations, so I am thrilled they helped!',
      'Thanks Emily! Visual learning is super important, glad it resonated with you!'
    ]
  }
];

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analyzedVideos, setAnalyzedVideos] = useState<AnalyzedVideo[]>(() => {
    const saved = localStorage.getItem('engage_ai_videos');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentVideo, setCurrentVideo] = useState<AnalyzedVideo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoPilotActive, setAutoPilotActive] = useState(false);

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
    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/;
    const match = url.trim().match(regExp);
    return match ? match[1] : 'default_id';
  };

  const analyzeVideo = async (url: string) => {
    setIsAnalyzing(true);
    // Simulate API fetch delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const videoId = extractVideoId(url);
    const existing = analyzedVideos.find(v => v.id === videoId);

    if (existing) {
      setCurrentVideo(existing);
      setIsAnalyzing(false);
      return;
    }

    // Generate new video metadata
    const preset = PRESET_MOCK_VIDEOS[videoId];
    const newVideoMeta = preset || {
      id: videoId,
      url,
      title: `Full-Stack Tutorial: Master AI Workflows and Real-Time Databases (Video ID: ${videoId})`,
      channelTitle: 'CodeCraft Academics',
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      views: '54K views',
      publishedAt: '3 hours ago'
    };

    // Generate unique mock comments for this video
    const generatedComments: Comment[] = MOCK_COMMENTS_TEMPLATES.map((tmpl, index) => ({
      id: `${videoId}-comment-${index}`,
      authorName: tmpl.authorName,
      authorAvatar: tmpl.authorAvatar,
      text: tmpl.text,
      publishedAt: `${index * 12 + 5} mins ago`,
      sentiment: tmpl.sentiment,
      category: tmpl.category,
      aiReply: tmpl.replies[0],
      status: 'pending'
    }));

    const newVideo: AnalyzedVideo = {
      ...newVideoMeta,
      comments: generatedComments,
      analyzedAt: new Date().toISOString()
    };

    setAnalyzedVideos(prev => [newVideo, ...prev]);
    setCurrentVideo(newVideo);
    setIsAnalyzing(false);
  };

  const approveReply = (videoId: string, commentId: string, replyText: string) => {
    setAnalyzedVideos(prev => prev.map(video => {
      if (video.id !== videoId) return video;
      
      const updatedComments = video.comments.map(c => {
        if (c.id !== commentId) return c;
        return {
          ...c,
          status: 'replied' as const,
          repliedText: replyText
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
          c.id === commentId ? { ...c, status: 'replied' as const, repliedText: replyText } : c
        )
      };
    });
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

  const regenerateReply = (videoId: string, commentId: string) => {
    const templateIdx = MOCK_COMMENTS_TEMPLATES.findIndex(tmpl => 
      commentId.endsWith(`-${MOCK_COMMENTS_TEMPLATES.indexOf(tmpl)}`)
    );

    if (templateIdx === -1) return;

    const replies = MOCK_COMMENTS_TEMPLATES[templateIdx].replies;
    
    setAnalyzedVideos(prev => prev.map(video => {
      if (video.id !== videoId) return video;
      
      const updatedComments = video.comments.map(c => {
        if (c.id !== commentId) return c;
        // Toggles between first and second preset reply
        const currentIdx = replies.indexOf(c.aiReply);
        const nextIdx = (currentIdx + 1) % replies.length;
        return { ...c, aiReply: replies[nextIdx] };
      });

      return { ...video, comments: updatedComments };
    }));

    setCurrentVideo(prev => {
      if (!prev || prev.id !== videoId) return prev;
      return {
        ...prev,
        comments: prev.comments.map(c => {
          if (c.id !== commentId) return c;
          const currentIdx = replies.indexOf(c.aiReply);
          const nextIdx = (currentIdx + 1) % replies.length;
          return { ...c, aiReply: replies[nextIdx] };
        })
      };
    });
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

  // Simulate auto-pilot approvals
  useEffect(() => {
    if (!autoPilotActive || !currentVideo) return;

    const pendingComments = currentVideo.comments.filter(c => c.status === 'pending');
    if (pendingComments.length === 0) {
      setAutoPilotActive(false);
      return;
    }

    const timer = setTimeout(() => {
      // Find first non-spam comment
      const firstValid = pendingComments.find(c => c.category !== 'Spam');
      if (firstValid) {
        approveReply(currentVideo.id, firstValid.id, firstValid.aiReply);
      } else {
        // Only spam comments left, ignore them
        pendingComments.forEach(c => {
          ignoreComment(currentVideo.id, c.id);
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [autoPilotActive, currentVideo]);

  const toggleAutoPilot = () => {
    setAutoPilotActive(prev => !prev);
  };

  return (
    <DashboardContext.Provider value={{
      analyzedVideos,
      currentVideo,
      kpis,
      isAnalyzing,
      autoPilotActive,
      analyzeVideo,
      approveReply,
      ignoreComment,
      regenerateReply,
      updateReplyText,
      clearVideo,
      toggleAutoPilot,
      setCurrentVideoById
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
