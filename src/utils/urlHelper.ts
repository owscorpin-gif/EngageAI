/**
 * Secure, ReDoS-safe utility to parse and extract YouTube Video ID from a URL.
 * Uses the browser's native URL constructor instead of complex regular expressions,
 * preventing catastrophic backtracking risks.
 */
export const extractYoutubeVideoId = (urlString: string): string | null => {
  try {
    const trimmed = urlString.trim();
    if (!trimmed) return null;

    // Handle short strings that are already the 11-char ID directly
    if (trimmed.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    // Convert string to absolute URL to parse via native constructor
    const absoluteUrlString = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const url = new URL(absoluteUrlString);
    
    // 1. youtu.be/<id>
    if (url.hostname === 'youtu.be' || url.hostname.endsWith('.youtu.be')) {
      const id = url.pathname.slice(1);
      return id.length === 11 ? id : null;
    }

    // 2. youtube.com/watch?v=<id> & youtube.com/shorts/<id> & youtube.com/embed/<id>
    if (url.hostname === 'youtube.com' || url.hostname.endsWith('.youtube.com') ||
        url.hostname === 'www.youtube.com' || url.hostname.endsWith('.www.youtube.com') ||
        url.hostname === 'm.youtube.com' || url.hostname.endsWith('.m.youtube.com')) {
      
      const paths = url.pathname.split('/');
      
      // Shorts
      const shortsIndex = paths.indexOf('shorts');
      if (shortsIndex !== -1 && paths[shortsIndex + 1]) {
        return paths[shortsIndex + 1].slice(0, 11);
      }
      
      // Embeds
      const embedIndex = paths.indexOf('embed');
      if (embedIndex !== -1 && paths[embedIndex + 1]) {
        return paths[embedIndex + 1].slice(0, 11);
      }
      
      // V path
      const vPathIndex = paths.indexOf('v');
      if (vPathIndex !== -1 && paths[vPathIndex + 1]) {
        return paths[vPathIndex + 1].slice(0, 11);
      }

      // Query param: ?v=ID
      const vQuery = url.searchParams.get('v');
      if (vQuery) {
        return vQuery.slice(0, 11);
      }
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Validates whether a given YouTube URL is syntactically correct and yields a valid Video ID.
 */
export const validateYoutubeUrl = (url: string): string | null => {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) {
    return 'Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)';
  }
  return null;
};
