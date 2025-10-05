import { YoutubeTranscript } from 'youtube-transcript';

export interface YouTubeVideoInfo {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  channelTitle: string;
}

export interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
}

export async function getYouTubeVideoInfo(videoId: string): Promise<YouTubeVideoInfo> {
  try {
    // Extract video ID from URL if full URL is provided
    const id = extractVideoId(videoId);
    
    // For now, we'll use a simple approach. In production, you'd use YouTube Data API
    const response = await fetch(`https://www.youtube.com/watch?v=${id}`);
    const html = await response.text();
    
    // Extract title from HTML (basic approach)
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown Title';
    
    return {
      id: id,
      title: title,
      description: '',
      duration: '',
      thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      channelTitle: 'Unknown Channel'
    };
  } catch (error) {
    console.error('Error getting YouTube video info:', error);
    throw new Error('Failed to get YouTube video info');
  }
}

export async function getYouTubeTranscript(videoId: string): Promise<TranscriptItem[]> {
  try {
    const id = extractVideoId(videoId);
    
    const transcript = await YoutubeTranscript.fetchTranscript(id);
    
    return transcript.map((item: { text: string; duration: number; offset: number }) => ({
      text: item.text,
      duration: item.duration,
      offset: item.offset
    }));
  } catch (error) {
    console.error('Error getting YouTube transcript:', error);
    throw new Error('Failed to get YouTube transcript');
  }
}

export function extractVideoId(urlOrId: string): string {
  // If it's already just an ID, return it
  if (!urlOrId.includes('youtube.com') && !urlOrId.includes('youtu.be')) {
    return urlOrId;
  }
  
  // Extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = urlOrId.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  throw new Error('Invalid YouTube URL');
}

export function formatTranscript(transcript: TranscriptItem[]): string {
  return transcript
    .map(item => item.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getTimestampFromOffset(offset: number): string {
  const minutes = Math.floor(offset / 60);
  const seconds = Math.floor(offset % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
