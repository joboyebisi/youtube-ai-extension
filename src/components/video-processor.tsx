'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface VideoProcessorProps {
  onVideoProcessed: (videoInfo: { id: string; title: string; channelTitle: string; thumbnail: string }) => void;
}

export function VideoProcessor({ onVideoProcessed }: VideoProcessorProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleProcessVideo = async () => {
    if (!videoUrl.trim()) {
      setMessage('Please enter a YouTube URL');
      setStatus('error');
      return;
    }

    setIsProcessing(true);
    setStatus('processing');
    setMessage('Processing video...');

    try {
      const response = await fetch('/api/video/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: videoUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      setStatus('success');
      setMessage(`Video processed successfully! ${data.chunksCount} chunks created.`);
      onVideoProcessed(data.videoInfo);
      
      // Reset form after successful processing
      setTimeout(() => {
        setVideoUrl('');
        setStatus('idle');
        setMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error processing video:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to process video');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Process YouTube Video
          </h2>
          <p className="text-gray-600">
            Enter a YouTube URL to extract the transcript and make it searchable
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleProcessVideo()}
              disabled={isProcessing}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleProcessVideo}
            disabled={isProcessing || !videoUrl.trim()}
            className="w-full"
          >
            {getStatusIcon()}
            <span className="ml-2">
              {isProcessing ? 'Processing...' : 'Process Video'}
            </span>
          </Button>

          {message && (
            <div className={`p-3 rounded-md border ${getStatusColor()}`}>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className="text-sm">{message}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
