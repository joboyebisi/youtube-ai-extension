# Deployment Guide

## Vercel Deployment

### Prerequisites
- GitHub repository with the project code
- Vercel account
- Required API keys

### Steps

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/youtube-ai-chat.git
   git push -u origin master
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   In Vercel dashboard, add these environment variables:
   ```
   CEREBRAS_API_URL=https://api.cerebras.ai
   CEREBRAS_API_KEY=your_cerebras_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your Next.js app

5. **Update Extension**
   After deployment, update the API URLs in the extension:
   ```typescript
   // In youtube-ai-extension/src/components/sidebar-app.tsx
   const API_BASE_URL = 'https://your-app-name.vercel.app';
   ```

## Extension Distribution

### Chrome Web Store

1. **Prepare Extension**
   ```bash
   cd youtube-ai-extension
   pnpm build
   ```

2. **Create ZIP**
   - Zip the `build/chrome-mv3-prod` folder
   - Name it `youtube-ai-chat-extension.zip`

3. **Upload to Chrome Web Store**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Click "New Item"
   - Upload the ZIP file
   - Fill in store listing details
   - Submit for review

### Manual Installation (Development)

1. **Build Extension**
   ```bash
   cd youtube-ai-extension
   pnpm build
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build/chrome-mv3-prod` folder

## Environment Variables

### Required for Backend
- `CEREBRAS_API_URL`: Cerebras API endpoint
- `CEREBRAS_API_KEY`: Your Cerebras API key
- `PINECONE_API_KEY`: Your Pinecone API key

### Optional
- `YOUTUBE_API_KEY`: YouTube Data API key (not required for basic functionality)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure Vercel deployment URL is in extension's host permissions
   - Check that API routes have proper CORS headers

2. **Extension Not Loading**
   - Check browser console for errors
   - Verify manifest.json is valid
   - Ensure all dependencies are installed

3. **API Errors**
   - Verify environment variables are set correctly
   - Check API key permissions
   - Monitor Vercel function logs

### Debug Steps

1. **Check Extension Console**
   - Open Chrome DevTools
   - Go to Console tab
   - Look for any error messages

2. **Check Network Tab**
   - Monitor API requests
   - Verify responses are successful

3. **Check Vercel Logs**
   - Go to Vercel dashboard
   - Check function logs for backend errors

## Production Checklist

- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Extension builds successfully
- [ ] Manifest permissions correct
- [ ] CORS headers configured
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Responsive design tested
- [ ] Cross-browser compatibility tested
