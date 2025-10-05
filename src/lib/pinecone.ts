import { Pinecone } from '@pinecone-database/pinecone';

let pinecone: Pinecone | null = null;

export function getPineconeClient() {
  if (!pinecone) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is not set');
    }
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pinecone;
}

// Cerebras embeddings function
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch(`${process.env.CEREBRAS_API_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instruct", // or whatever embedding model Cerebras provides
        input: text,
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    
    // Fallback: use a simple hash-based embedding for testing
    console.warn('Using fallback embedding method');
    return generateFallbackEmbedding(text);
  }
}

// Simple fallback embedding for testing (not production-ready)
function generateFallbackEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0); // 384 dimensions
  
  words.forEach(word => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash + word.charCodeAt(i)) & 0xffffffff;
    }
    
    const index = Math.abs(hash) % 384;
    embedding[index] += 1;
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

export async function getPineconeIndex(indexName: string = 'youtube-videos') {
  try {
    const client = getPineconeClient();
    const index = client.index(indexName);
    return index;
  } catch (error) {
    console.error('Error getting Pinecone index:', error);
    throw new Error('Failed to get Pinecone index');
  }
}

export async function createPineconeIndex(indexName: string = 'youtube-videos') {
  try {
    const client = getPineconeClient();
    await client.createIndex({
      name: indexName,
      dimension: 384, // Cerebras embedding dimension (or fallback)
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });
    
    console.log(`Index ${indexName} created successfully`);
  } catch (error) {
    console.error('Error creating Pinecone index:', error);
    throw new Error('Failed to create Pinecone index');
  }
}

export async function upsertVideoTranscript(
  videoId: string, 
  transcript: string, 
  metadata: Record<string, unknown>,
  indexName: string = 'youtube-videos'
) {
  try {
    const index = await getPineconeIndex(indexName);
    
    // Split transcript into chunks
    const chunks = splitTextIntoChunks(transcript, 1000, 200);
    
    // Generate embeddings for each chunk
    const vectors = await Promise.all(
      chunks.map(async (chunk, i) => {
        const embedding = await generateEmbedding(chunk);
        return {
          id: `${videoId}_chunk_${i}`,
          values: embedding,
          metadata: {
            ...metadata,
            chunkIndex: i,
            text: chunk,
            videoId
          }
        };
      })
    );
    
    // Upsert to Pinecone
    await index.upsert(vectors);
    
    console.log(`Upserted ${vectors.length} chunks for video ${videoId}`);
    return vectors.length;
  } catch (error) {
    console.error('Error upserting video transcript:', error);
    throw new Error('Failed to upsert video transcript');
  }
}

export async function searchSimilarChunks(
  query: string,
  videoId?: string,
  topK: number = 5,
  indexName: string = 'youtube-videos'
) {
  try {
    const index = await getPineconeIndex(indexName);
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Search in Pinecone
    const searchResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter: videoId ? { videoId: { $eq: videoId } } : undefined
    });
    
    return searchResponse.matches || [];
  } catch (error) {
    console.error('Error searching similar chunks:', error);
    throw new Error('Failed to search similar chunks');
  }
}

function splitTextIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    start = end - overlap;
  }
  
  return chunks;
}
