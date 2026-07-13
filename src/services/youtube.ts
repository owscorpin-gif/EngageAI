import type { Comment, CommentReply } from '../contexts/DashboardContext';

/**
 * Fetch video details from YouTube Data API v3.
 * Returns minimal metadata needed for the dashboard.
 */
export async function fetchVideoDetails(videoId: string, apiKey: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error('Failed to fetch video details');
  }
  const data = await resp.json();
  const item = data.items?.[0];
  if (!item) {
    throw new Error('Video not found');
  }
  const { title, channelTitle, thumbnails, publishedAt, description, categoryId, tags } = item.snippet;
  const { viewCount } = item.statistics;
  return {
    title,
    channelTitle,
    thumbnail: thumbnails?.medium?.url ?? thumbnails?.default?.url,
    views: `${Number(viewCount).toLocaleString()} views`,
    publishedAt,
    description: description ?? '',
    categoryId: categoryId ?? '',
    tags: tags ?? [],
  };
}

/**
 * Fetch top-level comment threads for a video.
 * Returns an array of Comment objects compatible with DashboardContext.
 * Includes nested replies, top comments (relevance sorting), and flags pinned comments.
 */
export async function fetchComments(
  videoId: string,
  apiKey: string,
  maxResults = 25,
  order: 'relevance' | 'time' = 'relevance'
): Promise<Comment[]> {
  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${videoId}&maxResults=${maxResults}&order=${order}&key=${apiKey}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error('Failed to fetch comments');
  }
  const data = await resp.json();
  
  const comments: Comment[] = data.items?.map((thread: any, idx: number) => {
    const snippet = thread.snippet.topLevelComment.snippet;
    const threadReplies = thread.replies?.comments?.map((r: any) => ({
      id: r.id,
      authorName: r.snippet.authorDisplayName,
      authorAvatar: r.snippet.authorProfileImageUrl,
      text: r.snippet.textDisplay,
      publishedAt: r.snippet.publishedAt,
    })) ?? [];

    return {
      id: thread.id,
      authorName: snippet.authorDisplayName,
      authorAvatar: snippet.authorProfileImageUrl,
      text: snippet.textDisplay,
      publishedAt: snippet.publishedAt,
      sentiment: 'neutral' as const,
      category: 'Question' as const,
      aiReply: '',
      status: 'pending' as const,
      replies: threadReplies,
      isPinned: order === 'relevance' && idx === 0, // Pinned comments appear at the top in relevance mode
      orderType: order === 'relevance' ? 'top' : 'newest',
    };
  }) ?? [];
  
  return comments;
}

/**
 * Fetch the active live chat ID for a video.
 */
export async function fetchLiveChatId(videoId: string, apiKey: string): Promise<string> {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${apiKey}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error('Failed to fetch live stream details');
  }
  const data = await resp.json();
  const item = data.items?.[0];
  if (!item) {
    throw new Error('Live stream video not found');
  }
  const liveChatId = item.liveStreamingDetails?.activeLiveChatId;
  if (!liveChatId) {
    throw new Error('No active live chat found for this video ID. Ensure the video is a scheduled or active live broadcast.');
  }
  return liveChatId;
}

/**
 * Fetch incoming live chat messages for an active liveChatId.
 */
export async function fetchLiveChatMessages(
  liveChatId: string,
  apiKey: string,
  nextPageToken?: string
): Promise<{ items: any[]; nextPageToken: string; pollingIntervalMillis: number }> {
  let url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&maxResults=75&key=${apiKey}`;
  if (nextPageToken) {
    url += `&pageToken=${nextPageToken}`;
  }
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error('Failed to fetch live chat messages');
  }
  const data = await resp.json();
  return {
    items: data.items ?? [],
    nextPageToken: data.nextPageToken ?? '',
    pollingIntervalMillis: data.pollingIntervalMillis ?? 4000,
  };
}

/**
 * Phase 12: Post a reply to a YouTube comment using the authenticated user's OAuth access token.
 */
export async function postYouTubeReply(
  commentId: string,
  replyText: string,
  accessToken: string
): Promise<CommentReply> {
  // If the user is logged in with the developer mock token, simulate a successful post
  if (accessToken.startsWith('ya29.mock')) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: `mock-reply-${Date.now()}`,
      authorName: 'You (Creator)',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
      text: replyText,
      publishedAt: new Date().toISOString()
    };
  }

  const url = 'https://www.googleapis.com/youtube/v3/comments?part=snippet';
  
  const body = {
    snippet: {
      parentId: commentId,
      textOriginal: replyText
    }
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const errorData = await resp.text();
    throw new Error(`Failed to post YouTube reply: ${resp.status} ${resp.statusText} - ${errorData}`);
  }

  const data = await resp.json();
  const snippet = data.snippet;

  return {
    id: data.id,
    authorName: snippet.authorDisplayName,
    authorAvatar: snippet.authorProfileImageUrl,
    text: snippet.textDisplay,
    publishedAt: snippet.publishedAt
  };
}
