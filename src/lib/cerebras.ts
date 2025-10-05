// Cerebras API implementation using fetch
export async function generateResponse(prompt: string, context?: string) {
  try {
    const systemPrompt = context 
      ? `You are a helpful AI assistant that answers questions based on the provided context from a YouTube video. Use the context to provide accurate and relevant answers. If the context doesn't contain enough information to answer the question, say so.\n\nContext: ${context}\n\nQuestion: ${prompt}`
      : `You are a helpful AI assistant. Answer the following question: ${prompt}`;

    const response = await fetch(`${process.env.CEREBRAS_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
}

export async function generateStreamingResponse(prompt: string, context?: string) {
  try {
    const systemPrompt = context 
      ? `You are a helpful AI assistant that answers questions based on the provided context from a YouTube video. Use the context to provide accurate and relevant answers. If the context doesn't contain enough information to answer the question, say so.\n\nContext: ${context}\n\nQuestion: ${prompt}`
      : `You are a helpful AI assistant. Answer the following question: ${prompt}`;

    const response = await fetch(`${process.env.CEREBRAS_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error generating streaming response:', error);
    throw new Error('Failed to generate streaming response');
  }
}
