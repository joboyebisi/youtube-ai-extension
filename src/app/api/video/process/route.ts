import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeVideoInfo, getYouTubeTranscript, formatTranscript } from '@/lib/youtube';
import { upsertVideoTranscript } from '@/lib/pinecone';

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Get video info and transcript
    const [videoInfo, transcript] = await Promise.all([
      getYouTubeVideoInfo(videoUrl),
      getYouTubeTranscript(videoUrl)
    ]);

    // Format transcript
    const formattedTranscript = formatTranscript(transcript);

    // Upsert to Pinecone
    const chunksCount = await upsertVideoTranscript(
      videoInfo.id,
      formattedTranscript,
      {
        title: videoInfo.title,
        description: videoInfo.description,
        channelTitle: videoInfo.channelTitle,
        thumbnail: videoInfo.thumbnail,
        duration: videoInfo.duration,
        processedAt: new Date().toISOString()
      }
    );

    const response = NextResponse.json({
      success: true,
      videoInfo,
      transcriptLength: transcript.length,
      chunksCount,
      message: 'Video processed successfully'
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error('Error processing video:', error);
    const response = NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  }
}
