import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Send, Loader2, Bot, User, X, MessageSquare, ClipboardList, Bookmark, Scissors, MoreHorizontal, MoreVertical, Sparkles, Copy, Share2, Plus } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface SidebarAppProps {
  videoId?: string | null;
}

export default function SidebarApp({ videoId }: SidebarAppProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat'>('chat');
  const [viewMode, setViewMode] = useState<'standard' | 'full'>('standard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatModeMenuOpen, setIsChatModeMenuOpen] = useState(false);
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const [status, setStatus] = useState<'processing' | 'ready' | 'error'>('processing');
  const [hasProcessingMessage, setHasProcessingMessage] = useState(false);
  const [hasReadyMessage, setHasReadyMessage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const chatModeMenuRef = useRef<HTMLDivElement>(null);
  const fullMenuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (chatModeMenuRef.current && !chatModeMenuRef.current.contains(event.target)) {
        setIsChatModeMenuOpen(false);
      }
      if (fullMenuRef.current && !fullMenuRef.current.contains(event.target)) {
        setIsFullMenuOpen(false);
      }
    };

    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, []);

  useEffect(() => {
    if (!videoId) {
      setIsCollapsed(true);
      return;
    }

    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: 'Welcome! I\'m here to help you learn from this video. Let me process the transcript first.',
        timestamp: new Date(),
        isStreaming: false
      };
      setMessages([welcomeMessage]);
      setStatus('processing');
      setHasProcessingMessage(true);
    }
  }, [videoId, messages.length]);

  const processVideo = async () => {
    if (!videoId || isProcessing) return;

    setIsProcessing(true);
    
    try {
      const response = await fetch('https://youtube-ai-extension-sable.vercel.app/api/video/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: `https://www.youtube.com/watch?v=${videoId}` }),
      });

      if (!response.ok) {
        throw new Error('Failed to process video');
      }

      const data = await response.json();
      
      const readyMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Video "${data.videoInfo.title}" processed successfully! You can now ask questions about it.`,
        timestamp: new Date(),
        isStreaming: false
      };
      
      setMessages(prev => [...prev, readyMessage]);
      setStatus('ready');
      setHasReadyMessage(true);
    } catch (error) {
      console.error('Error processing video:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Failed to process video. Please try again.',
        timestamp: new Date(),
        isStreaming: false
      };
      setMessages(prev => [...prev, errorMessage]);
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://youtube-ai-extension-sable.vercel.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          videoId: videoId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  )
                );
              }
              if (data.done) {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
                break;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isStreaming: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  if (isCollapsed) {
    return (
      <button 
        className="chatpye-open-pill" 
        type="button" 
        onClick={() => setIsCollapsed(false)}
      >
        <Bot size={18} />
        <span>Open YouTube AI Chat</span>
      </button>
    );
  }

  const isFullMode = viewMode === "full";

  return (
    <div className={`chatpye-shell ${isFullMode ? "is-full" : ""}`}>
      <header className="shell-header">
        <div className="brand">
          <div className="brand-icon">
            <Bot size={22} />
          </div>
          <div className="brand-copy">
            <h1>YouTube AI Chat</h1>
            <span>Always learning with your video</span>
          </div>
        </div>
        <div className="header-controls">
          <div className={`status-pill tone-${status}`}>
            <span className="status-dot" />
            <span>{status === 'processing' ? 'Processing' : status === 'ready' ? 'Ready' : 'Error'}</span>
            {status === 'error' && (
              <button type="button" className="status-action" onClick={() => setStatus("processing")}>
                Retry
              </button>
            )}
          </div>
          {isFullMode && (
            <div className="chat-mode-menu" ref={fullMenuRef}>
              <button
                type="button"
                className="menu-icon"
                aria-label="Full chat menu"
                onClick={() => setIsFullMenuOpen(!isFullMenuOpen)}
                aria-expanded={isFullMenuOpen}
              >
                <MoreHorizontal size={18} />
              </button>
              {isFullMenuOpen && (
                <div className="mode-menu is-full">
                  <button type="button" onClick={() => setViewMode("standard")}>
                    <MessageSquare size={14} /> Switch mode
                  </button>
                </div>
              )}
            </div>
          )}
          <button 
            type="button" 
            className="close-button" 
            aria-label="Close sidebar" 
            onClick={() => setIsCollapsed(true)}
          >
            <X size={16} />
          </button>
        </div>
      </header>


      {viewMode === "standard" && (
        <nav className="tab-nav" aria-label="Sidebar views">
          <button
            type="button"
            className="is-active tab-button-expanded"
          >
            <MessageSquare size={17} />
            <span className="tab-label">Chat</span>
          </button>
          <div className="mode-toggle" ref={chatModeMenuRef}>
            <button
              type="button"
              className="menu-icon"
              aria-label="Chat mode options"
              onClick={() => setIsChatModeMenuOpen(!isChatModeMenuOpen)}
              aria-expanded={isChatModeMenuOpen}
            >
              <MoreVertical size={18} />
            </button>
            {isChatModeMenuOpen && (
              <div className="mode-menu">
                <button type="button" onClick={() => setViewMode("full")}>
                  <MessageSquare size={14} /> Full chat mode
                </button>
              </div>
            )}
          </div>
        </nav>
      )}

      <main className={`tab-panel ${isFullMode ? "is-full" : ""}`}>
        <section className={`chat-pane ${isFullMode ? "is-full" : ""}`}>
            <div className={`message-list ${isFullMode ? "is-full" : ""}`} style={{ 
              display: 'flex', 
              flexDirection: 'column-reverse',
              overflowY: 'auto',
              maxHeight: '400px',
              minHeight: '300px'
            }}>
              {messages.map((message) => (
                <article key={message.id} className={`message-row is-${message.role}`}>
                  {message.role === "assistant" && (
                    <div className="avatar">
                      <Bot size={16} />
                    </div>
                  )}
                  <div className="message-bubble">
                    <header>
                      <span>{message.role === "assistant" ? "YouTube AI Chat" : "You"}</span>
                      <span>
                        {message.isStreaming ? (
                          <span className="streaming">
                            <Loader2 size={12} /> streaming
                          </span>
                        ) : (
                          message.timestamp.toLocaleTimeString()
                        )}
                      </span>
                    </header>
                    <p>{message.content}</p>
                    {message.role === "assistant" && (
                      <footer className="message-actions">
                        <button type="button">
                          <Copy size={14} />
                        </button>
                        <button type="button">
                          <Share2 size={14} />
                        </button>
                        <button type="button">
                          <Plus size={14} />
                        </button>
                      </footer>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="avatar user">
                      <User size={16} />
                    </div>
                  )}
                </article>
              ))}
              
              {messages.length === 0 && (
                <div className="text-center py-8" style={{ order: -1 }}>
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm text-gray-600 mb-4">
                    {videoId ? 'Process this video to start chatting!' : 'No video detected'}
                  </p>
                  {videoId && (
                    <Button
                      onClick={processVideo}
                      disabled={isProcessing}
                      size="sm"
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Process Video'
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {!isFullMode && (
              <div className="prompt-row">
                <button type="button" onClick={() => handlePromptClick("Summarize this video")}>Summarise</button>
                <button type="button" onClick={() => handlePromptClick("What are the key points?")}>Key points</button>
                <button type="button" onClick={() => handlePromptClick("Explain this simply")}>Explain simply</button>
              </div>
            )}

            <form className="composer" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  handleKeyDown(e);
                }}
                onKeyPress={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                placeholder="Ask anything about the video…"
                aria-label="Ask YouTube AI Chat"
                disabled={isLoading}
                style={{ 
                  isolation: 'isolate',
                  position: 'relative',
                  zIndex: 1000
                }}
              />
              <button type="submit" disabled={!input.trim() || isLoading}>
                <Send size={16} />
              </button>
            </form>
          </section>
      </main>
    </div>
  );
}
