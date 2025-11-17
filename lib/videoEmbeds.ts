/**
 * Utilities for parsing YouTube video URLs
 */

export interface YouTubeVideoInfo {
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
}

/**
 * Parse YouTube URL and extract video ID
 * Supports formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&list=...
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Direct video ID (11 characters)
 */
export function parseYouTubeUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Parse YouTube URL and get full video information
 */
export function parseYouTubeVideoInfo(url: string): YouTubeVideoInfo | null {
  const videoId = parseYouTubeUrl(url);

  if (!videoId) {
    return null;
  }

  return {
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}
