# YouTube AI Chat

A Chrome extension that lets you chat with YouTube videos using AI powered by Cerebras and Llama 4. Extract transcripts and ask intelligent questions about video content.

## Features

- 🤖 **AI-Powered Chat**: Ask questions about any YouTube video and get instant answers
- 📝 **Transcript Analysis**: Leverages video transcripts for accurate and contextual responses
- 🧠 **Cerebras & Pinecone**: Utilizes Cerebras for powerful LLM inference and Pinecone for efficient vector storage
- 🎯 **Smart Prompts**: Quick action buttons for common queries (Summarize, Key points, Explain simply)
- 🔒 **Isolated Input**: Text input is completely isolated from YouTube page interactions
- 📱 **Responsive Design**: Beautiful, modern UI that integrates seamlessly with YouTube

## Architecture

### Backend (Next.js)
- **API Routes**: `/api/video/process` and `/api/chat` for video processing and chat functionality
- **Cerebras Integration**: Streaming LLM responses using Llama 4
- **Pinecone Vector Store**: Efficient storage and retrieval of video transcript embeddings
- **YouTube Transcript**: Automatic transcript extraction using `youtube-transcript` library

### Extension (Plasmo)
- **Content Script**: Injects sidebar into YouTube pages
- **React UI**: Modern, responsive chat interface
- **Event Isolation**: Prevents interference with YouTube page interactions
- **Manifest V3**: Modern Chrome extension architecture

## Setup

### Prerequisites
- Node.js 18+
- pnpm
- Cerebras API key
- Pinecone API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd youtube-ai-chat
```

2. Install dependencies:
```bash
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
CEREBRAS_API_URL=https://api.cerebras.ai
CEREBRAS_API_KEY=your_cerebras_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

5. Start the development server:
```bash
pnpm dev
```

### Extension Setup

1. Navigate to the extension directory:
```bash
cd youtube-ai-extension
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the extension:
```bash
pnpm build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `build/chrome-mv3-prod` folder

## Usage

1. Install the extension and navigate to any YouTube video
2. The extension will automatically detect the video and show a sidebar
3. Click "Process Video" to extract and analyze the transcript
4. Once processed, you can ask questions about the video content
5. Use the quick prompt buttons for common queries

## API Endpoints

### POST /api/video/process
Processes a YouTube video by extracting its transcript and creating embeddings.

**Request:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "success": true,
  "videoInfo": {
    "id": "VIDEO_ID",
    "title": "Video Title",
    "channelTitle": "Channel Name",
    "thumbnail": "thumbnail_url"
  },
  "chunksProcessed": 15
}
```

### POST /api/chat
Handles chat messages and returns AI responses.

**Request:**
```json
{
  "message": "What is this video about?",
  "videoId": "VIDEO_ID"
}
```

**Response:** Streaming response with AI-generated content.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Extension Distribution

1. Build the production version:
```bash
pnpm build
```

2. Zip the `build/chrome-mv3-prod` folder
3. Upload to Chrome Web Store for distribution

## Development

### Backend Development
```bash
cd youtube-ai-chat
pnpm dev
```

### Extension Development
```bash
cd youtube-ai-extension
pnpm dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with [Plasmo](https://www.plasmo.com/) for Chrome extension development
- Powered by [Cerebras](https://www.cerebras.net/) for AI inference
- Vector storage with [Pinecone](https://www.pinecone.io/)
- UI components with [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
