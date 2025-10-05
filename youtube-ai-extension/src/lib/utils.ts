import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

export function getCurrentVideoId(): string | null {
  const url = window.location.href;
  try {
    return extractVideoId(url);
  } catch {
    return null;
  }
}
