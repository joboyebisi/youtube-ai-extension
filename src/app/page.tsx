'use client';

import { VideoProcessor } from '@/components/video-processor';
import { ChatInterface } from '@/components/chat-interface';
import { useState } from 'react';

export default function Home() {
  const [videoInfo, setVideoInfo] = useState<{ id: string; title: string; channelTitle: string; thumbnail: string } | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const handleVideoProcessed = (info: { id: string; title: string; channelTitle: string; thumbnail: string }) => {
    setVideoInfo(info);
    setActiveVideoId(info.id);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            YouTube AI Chat
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chat with any YouTube video using AI. Process videos to extract transcripts 
            and ask questions about their content using Cerebras and Llama 4.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Video Processor */}
          <div className="space-y-6">
            <VideoProcessor onVideoProcessed={handleVideoProcessed} />
            
            {videoInfo && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Video Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Title:</span>
                    <p className="text-gray-700">{videoInfo.title}</p>
                  </div>
                  <div>
                    <span className="font-medium">Channel:</span>
                    <p className="text-gray-700">{videoInfo.channelTitle}</p>
                  </div>
                  <div>
                    <span className="font-medium">Video ID:</span>
                    <p className="text-gray-700 font-mono text-sm">{videoInfo.id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Interface */}
          <div className="h-[600px]">
            <ChatInterface 
              videoId={activeVideoId || undefined}
              videoInfo={videoInfo || undefined}
            />
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">YouTube Integration</h3>
              <p className="text-gray-600">
                Extract transcripts from any YouTube video automatically
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Chat</h3>
              <p className="text-gray-600">
                Chat with videos using Cerebras and Llama 4 for intelligent responses
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Vector Search</h3>
              <p className="text-gray-600">
                Pinecone-powered semantic search for relevant video content
              </p>
            </div>
          </div>
        </div>
        </div>
      </main>
  );
}