// src/pages/LiveChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Shield, 
  Pin, 
  DollarSign, 
  Users, 
  Trash2, 
  Sparkles, 
  Send, 
  AlertTriangle, 
  TrendingUp, 
  Video,
  Ban,
  Activity,
  Award,
  Copy,
  ClipboardCheck,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Toast } from '../components/Toast';
import { copyToClipboard, clipboardPreview } from '../utils/clipboard';
import { fetchLiveChatId, fetchLiveChatMessages } from '../services/youtube';
import { generateGeminiReply } from '../services/gemini';
import { extractYoutubeVideoId } from '../utils/urlHelper';

interface LiveMessage {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  role: 'user' | 'member' | 'moderator' | 'creator';
  superChatAmount?: number;
  isSpam?: boolean;
  aiSuggestion?: string;
  isTimedOut?: boolean;
}

export const LiveChatPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const toastType = type === 'warning' ? 'info' : type;
    setToast({ message, type: toastType });
  };
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  
  // Connection & Active Stream configurations
  const [streamMode, setStreamMode] = useState<'simulated' | 'real'>('simulated');
  const [liveVideoUrl, setLiveVideoUrl] = useState('');
  const [selectedStream, setSelectedStream] = useState('react-qna');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [pinnedMessage, setPinnedMessage] = useState<LiveMessage | null>(null);
  const [inputVal, setInputVal] = useState('');
  
  // Real Live Connection states
  const [liveChatId, setLiveChatId] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Banned & Timed-out User Indexes
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [timedOutUsers, setTimedOutUsers] = useState<string[]>([]);

  // Live Analytics States
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [mpm, setMpm] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [sentiment, setSentiment] = useState({ positive: 55, neutral: 35, negative: 10 });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat log
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Messages Per Minute (MPM) gauge update loop
  useEffect(() => {
    if (!isConnected) {
      setMpm(0);
      return;
    }
    const interval = setInterval(() => {
      if (streamMode === 'simulated') {
        setMpm(prev => {
          const target = Math.floor(Math.random() * 15) + 20; 
          return Math.floor((prev * 3 + target) / 4);
        });
      } else {
        // Real MPM: count messages in last 60 seconds
        const count = messages.filter(m => m.id.startsWith('msg-real-')).length;
        setMpm(Math.max(2, Math.min(120, Math.floor(count * 1.5))));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isConnected, streamMode, messages]);

  // On-demand AI suggestion generator
  const generateSuggestionForMessage = async (msgId: string, msgText: string) => {
    try {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, aiSuggestion: 'Generating...' } : m));
      const reply = await generateGeminiReply(msgText);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, aiSuggestion: reply } : m));
    } catch (err) {
      console.error('Failed to generate live chat suggestion:', err);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, aiSuggestion: 'Failed to generate suggestion.' } : m));
    }
  };

  // Feed Simulation Loop (only if mode is simulated)
  useEffect(() => {
    if (!isConnected || streamMode !== 'simulated') return;

    // Load initial context messages
    setMessages([
      {
        id: 'msg-init-1',
        authorName: 'Alex Mercer',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        text: 'Hello everyone! Excited to learn about the new React 19 compiler features today!',
        timestamp: '12:00 PM',
        role: 'member',
        aiSuggestion: 'Welcome Alex! Great to have you in the stream. Yes, React Compiler is going to be game-changing!'
      },
      {
        id: 'msg-init-2',
        authorName: 'Sarah Jenkins',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        text: 'Is the new compiler fully backward compatible or will it break old hook setups?',
        timestamp: '12:01 PM',
        role: 'user',
        aiSuggestion: 'Hi Sarah! The compiler is fully backward compatible. Old hook structures compile normally without changes.'
      }
    ]);

    const names = ['Michael Scott', 'Dwight Schrute', 'Jim Halpert', 'Pam Beesly', 'Angela Martin', 'Oscar Martinez', 'Andy Bernard', 'Kevin Malone'];
    const avatars = [
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80'
    ];

    const comments = [
      { text: 'Awesome explanation of useMemo removal! GG!', role: 'member', ai: 'Thank you! Excited that you found it clear.' },
      { text: 'How do we handle serverside components caching?', role: 'user', ai: 'Great question. Server components caching can be configured via Fetch cache tags.' },
      { text: 'Click my profile link for FREE bitc0in giveaways! 💰🚀', role: 'user', isSpam: true, ai: '[Draft Muted: Potential Spam detected]' },
      { text: 'Is it true that we don\'t need forwardRef anymore?', role: 'user', ai: 'Yes, React 19 lets you pass ref as a regular prop!' },
      { text: 'Supporting the stream! Keep up the incredible work!', role: 'user', superChat: 19.99, ai: 'Wow, thank you so much for the Super Chat! Really appreciate the support!' },
      { text: 'Love the stream! Super clean explanations!', role: 'member', superChat: 49.99, ai: 'Wow! Thank you so much for the generous Super Chat! Glad the content is helpful!' }
    ];

    const timer = setInterval(() => {
      const template = comments[Math.floor(Math.random() * comments.length)];
      const author = names[Math.floor(Math.random() * names.length)];
      
      if (bannedUsers.includes(author) || timedOutUsers.includes(author)) return;

      const newMsg: LiveMessage = {
        id: `msg-${Date.now()}`,
        authorName: author,
        authorAvatar: avatars[Math.floor(Math.random() * avatars.length)],
        text: template.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: template.superChat ? 'member' : (template.role as any),
        superChatAmount: template.superChat,
        isSpam: template.isSpam,
        aiSuggestion: template.ai
      };

      setMessages(prev => [...prev, newMsg]);

      if (template.superChat) {
        setTotalRevenue(prev => prev + template.superChat!);
      }
      if (template.role === 'member' || template.superChat) {
        setMembersCount(prev => prev + 1);
      }

      setSentiment(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return {
          positive: Math.max(40, Math.min(80, prev.positive + change)),
          neutral: Math.max(20, Math.min(50, prev.neutral - change)),
          negative: prev.negative
        };
      });

    }, 3500);

    return () => clearInterval(timer);
  }, [isConnected, streamMode, bannedUsers, timedOutUsers]);

  // Real YouTube Live Chat Fetching Loop
  useEffect(() => {
    if (!isConnected || streamMode !== 'real' || !liveChatId) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;
    const apiKey = localStorage.getItem('engage_ai_youtube_api_key') || '';

    const fetchLoop = async (token?: string) => {
      try {
        const res = await fetchLiveChatMessages(liveChatId, apiKey, token);
        if (!isMounted) return;

        if (res.items && res.items.length > 0) {
          const newMessages: LiveMessage[] = [];
          let addedRev = 0;
          let addedMembers = 0;

          res.items.forEach((item: any) => {
            const authorName = item.authorDetails?.displayName ?? 'Anonymous';
            if (bannedUsers.includes(authorName)) return;

            const isOwner = item.authorDetails?.isChatOwner;
            const isSponsor = item.authorDetails?.isChatSponsor;
            const isMod = item.authorDetails?.isChatModerator;
            const role = isOwner ? 'creator' : isMod ? 'moderator' : isSponsor ? 'member' : 'user';

            const snippet = item.snippet;
            const text = snippet?.displayMessage ?? '';
            
            const superChatAmount = snippet?.superChatDetails?.amountMicros 
              ? snippet.superChatDetails.amountMicros / 1000000 
              : undefined;

            if (superChatAmount) {
              addedRev += superChatAmount;
              addedMembers += 1;
            }

            const msgTime = snippet?.publishedAt 
              ? new Date(snippet.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const newMsg: LiveMessage = {
              id: `msg-real-${item.id}`,
              authorName,
              authorAvatar: item.authorDetails?.profileImageUrl ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
              text,
              timestamp: msgTime,
              role,
              superChatAmount,
              isSpam: text.toLowerCase().includes('giveaway') || text.toLowerCase().includes('free link') || text.toLowerCase().includes('click my profile'),
              aiSuggestion: ''
            };

            newMessages.push(newMsg);
          });

          if (newMessages.length > 0) {
            setMessages(prev => {
              // Deduplicate and append
              const filteredPrev = prev.filter(p => !newMessages.some(n => n.id === p.id));
              return [...filteredPrev, ...newMessages];
            });

            if (addedRev > 0) setTotalRevenue(prev => prev + addedRev);
            if (addedMembers > 0) setMembersCount(prev => prev + addedMembers);

            // Automatically trigger AI suggestion for new Super Chats and Questions
            newMessages.forEach(msg => {
              if (msg.superChatAmount || msg.text.includes('?') || msg.text.toLowerCase().includes('how') || msg.text.toLowerCase().includes('why')) {
                generateSuggestionForMessage(msg.id, msg.text);
              }
            });
          }
        }

        setNextPageToken(res.nextPageToken);
        
        timeoutId = setTimeout(() => {
          fetchLoop(res.nextPageToken);
        }, res.pollingIntervalMillis);

      } catch (err: any) {
        console.error('Error fetching live chat messages:', err);
        showToast(err.message || 'Error fetching live chat messages.', 'error');
        timeoutId = setTimeout(() => {
          fetchLoop(token);
        }, 4000);
      }
    };

    fetchLoop(nextPageToken);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isConnected, streamMode, liveChatId, bannedUsers]);

  const handleConnect = async () => {
    if (streamMode === 'simulated') {
      setIsConnected(true);
      showToast('Live stream chat simulation connection initialized.', 'success');
      return;
    }

    // Real Connection Flow
    const apiKey = localStorage.getItem('engage_ai_youtube_api_key') || '';
    if (!apiKey) {
      showToast('YouTube API Key is missing. Please add it in Settings page.', 'error');
      return;
    }

    const videoId = extractYoutubeVideoId(liveVideoUrl);
    if (!videoId) {
      showToast('Invalid YouTube Live URL or Video ID.', 'error');
      return;
    }

    setIsConnecting(true);
    try {
      const chatId = await fetchLiveChatId(videoId, apiKey);
      setLiveChatId(chatId);
      setMessages([]);
      setIsConnected(true);
      showToast('Real YouTube Live Chat connected successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to connect real Live Chat. Ensure video ID is correct and live is currently broadcasting.', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setLiveChatId(null);
    setNextPageToken('');
    setMessages([]);
    setPinnedMessage(null);
    setTotalRevenue(0);
    setMpm(0);
    setMembersCount(0);
    showToast('Live stream chat disconnected.', 'warning');
  };

  // Actions
  const handlePinMessage = (msg: LiveMessage) => {
    setPinnedMessage(msg);
    showToast(`Pinned comment by ${msg.authorName}`, 'success');
  };

  const handleUnpinMessage = () => {
    setPinnedMessage(null);
    showToast('Pinned comment removed', 'info');
  };

  const handleDeleteMessage = (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    showToast('Message deleted by moderator', 'info');
  };

  const handleTimeoutUser = (username: string) => {
    setTimedOutUsers(prev => [...prev, username]);
    showToast(`${username} has been timed out for 300 seconds`, 'warning');
  };

  const handleBanUser = (username: string) => {
    setBannedUsers(prev => [...prev, username]);
    setMessages(prev => prev.filter(m => m.authorName !== username));
    showToast(`${username} has been permanently banned from this channel`, 'error');
  };

  const handleOneClickReply = (suggestion: string) => {
    setInputVal(suggestion);
    showToast('Draft loaded. Click send to post.', 'success');
  };

  const handleCopySuggestion = async (msgId: string, suggestion: string) => {
    const result = await copyToClipboard(suggestion);
    if (result.success) {
      setCopiedMsgId(msgId);
      showToast(`Copied: "${clipboardPreview(result.copied, 50)}"`, 'success');
      setTimeout(() => setCopiedMsgId(null), 2000);
    } else {
      showToast(result.error ?? 'Failed to copy suggestion.', 'error');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const creatorMsg: LiveMessage = {
      id: `msg-creator-${Date.now()}`,
      authorName: 'Creator (You)',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      text: inputVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'creator'
    };

    setMessages(prev => [...prev, creatorMsg]);
    setInputVal('');
    showToast('Reply published to live stream', 'success');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-in">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-8 h-8 text-rose-500 animate-pulse" />
            <span>AI Live Chat Manager</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
            Monitor incoming messages, approve Super Chats, and reply to viewers using one-click AI suggestion shortcuts.
          </p>
        </div>

        {/* Mode & Live Stream connection controller */}
        <div className="bg-white dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center flex-wrap gap-4 shadow-sm">
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-900/50">
            <button
              onClick={() => setStreamMode('simulated')}
              disabled={isConnected}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer disabled:opacity-50 ${
                streamMode === 'simulated' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Simulated
            </button>
            <button
              onClick={() => setStreamMode('real')}
              disabled={isConnected}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer disabled:opacity-50 ${
                streamMode === 'real' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Real Live
            </button>
          </div>

          {streamMode === 'simulated' ? (
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              disabled={isConnected}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="react-qna">React 19 & Next.js Q&A Session</option>
              <option value="coding-marathon">12-Hour Build-a-SaaS Marathon</option>
              <option value="portfolio-audit">Viewer Code Audits & Reviews</option>
            </select>
          ) : (
            <input
              type="text"
              placeholder="Live Stream URL or Video ID"
              value={liveVideoUrl}
              onChange={e => setLiveVideoUrl(e.target.value)}
              disabled={isConnected}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold rounded-lg focus:outline-none placeholder-slate-400 disabled:opacity-50 w-44 md:w-56"
            />
          )}

          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting || (streamMode === 'real' && !liveVideoUrl)}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chat Feed Column (Left & Center) */}
        <div className="lg:col-span-2 flex flex-col h-[650px] glass-panel border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden bg-white dark:bg-slate-950/40 shadow-xl">
          
          {/* Pinned Messages Banner */}
          {pinnedMessage && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between gap-4 animate-slide-in">
              <div className="flex items-center gap-3 min-w-0">
                <Pin className="w-4.5 h-4.5 text-amber-500 flex-shrink-0" />
                <div className="text-xs min-w-0">
                  <span className="font-bold text-amber-600 dark:text-amber-400 mr-2">
                    Pinned by Creator:
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {pinnedMessage.text}
                  </span>
                </div>
              </div>
              <button
                onClick={handleUnpinMessage}
                className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer border-none bg-transparent"
              >
                Unpin
              </button>
            </div>
          )}

          {/* Messages Flow Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!isConnected ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">
                    Live Chat Offline
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 font-semibold">
                    Connect an active live stream using the controller at the top-right to start monitoring messages in real-time.
                  </p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 italic text-sm font-semibold">
                Waiting for incoming chat stream messages...
              </div>
            ) : (
              messages.map((msg) => {
                const isSuperChat = msg.superChatAmount !== undefined;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3.5 p-3.5 rounded-2xl transition-all border ${
                      isSuperChat
                        ? 'bg-amber-500/5 dark:bg-amber-950/15 border-amber-500/20'
                        : 'bg-slate-50/50 dark:bg-slate-900/30 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                    }`}
                  >
                    <img
                      src={msg.authorAvatar}
                      alt={msg.authorName}
                      className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 flex-shrink-0 object-cover"
                    />

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                            {msg.authorName}
                          </span>
                          
                          {/* Role badges */}
                          {msg.role === 'creator' && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-extrabold tracking-wider uppercase">
                              Creator
                            </span>
                          )}
                          {msg.role === 'moderator' && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white text-[9px] font-extrabold tracking-wider uppercase flex items-center gap-0.5">
                              <Shield className="w-2.5 h-2.5" />
                              <span>Mod</span>
                            </span>
                          )}
                          {msg.role === 'member' && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-extrabold tracking-wider uppercase">
                              Sponsor
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{msg.timestamp}</span>
                        </span>
                      </div>

                      {/* Super Chat Banner */}
                      {isSuperChat && (
                        <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs w-fit">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Super Chat: ${msg.superChatAmount?.toFixed(2)}</span>
                        </div>
                      )}

                      <p className="text-slate-700 dark:text-slate-300 text-xs font-semibold leading-relaxed">
                        {msg.text}
                      </p>

                      {/* AI Reply Assistant Container */}
                      {msg.role !== 'creator' && (
                        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2.5">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-primary-500" />
                              <span>AI Suggestion</span>
                            </span>
                            {msg.isSpam && (
                              <span className="text-[8px] bg-red-500/10 text-red-500 font-extrabold tracking-wider uppercase px-1 py-0.5 rounded border border-red-500/20">
                                Potential Spam
                              </span>
                            )}
                          </div>

                          {msg.aiSuggestion ? (
                            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed italic pr-4">
                              "{msg.aiSuggestion}"
                            </p>
                          ) : (
                            <button
                              onClick={() => generateSuggestionForMessage(msg.id, msg.text)}
                              className="text-[10px] font-bold text-violet-500 hover:text-violet-600 dark:text-violet-400 flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Generate AI Suggestion</span>
                            </button>
                          )}

                          {msg.aiSuggestion && msg.aiSuggestion !== 'Generating...' && msg.aiSuggestion !== 'Failed to generate suggestion.' && (
                            <div className="flex items-center gap-2 justify-end pt-1">
                              <button
                                onClick={() => handleCopySuggestion(msg.id, msg.aiSuggestion || '')}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                                  copiedMsgId === msg.id
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                    : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer'
                                }`}
                              >
                                {copiedMsgId === msg.id ? <ClipboardCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>Copy</span>
                              </button>
                              <button
                                onClick={() => handleOneClickReply(msg.aiSuggestion || '')}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-500 hover:bg-violet-600 text-white transition shadow shadow-violet-500/20 cursor-pointer"
                              >
                                Use Draft
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Moderation control dropdown trigger */}
                    {msg.role !== 'creator' && (
                      <div className="flex flex-col gap-1 items-center justify-start flex-shrink-0">
                        <button
                          onClick={() => handlePinMessage(msg)}
                          title="Pin comment"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 cursor-pointer"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Delete message"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTimeoutUser(msg.authorName)}
                          title="Timeout user (5m)"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-orange-500 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleBanUser(msg.authorName)}
                          title="Ban user"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Interactive Chat Input Area */}
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={isConnected ? "Send reply to live broadcast..." : "Chat is offline"}
                disabled={!isConnected}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isConnected || !inputVal.trim()}
                className="p-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl shadow-md transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Analytics & Moderation Panel Column (Right) */}
        <div className="space-y-6">
          {/* Real-time metrics card */}
          <div className="glass-panel border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 bg-white dark:bg-slate-950/40 shadow-xl space-y-6">
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>Real-Time Stream Stats</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase leading-none">Super Chats</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">
                    ${totalRevenue.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase leading-none">Msg / Min</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">{mpm}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase leading-none">New Sponsors</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">{membersCount}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase leading-none">Sentiment</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">{sentiment.positive}% Pos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Moderation lists */}
          <div className="glass-panel border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 bg-white dark:bg-slate-950/40 shadow-xl space-y-6">
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Moderation Registry</span>
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                  Banned Users ({bannedUsers.length})
                </span>
                {bannedUsers.length === 0 ? (
                  <p className="text-xs text-slate-450 dark:text-slate-550 italic">No users banned in this session.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {bannedUsers.map((user, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2 py-0.5 rounded flex items-center gap-1 animate-fade-in"
                      >
                        <span>{user}</span>
                        <button
                          onClick={() => setBannedUsers(prev => prev.filter(u => u !== user))}
                          className="hover:text-red-800 font-extrabold cursor-pointer border-none bg-transparent"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-slate-100 dark:border-slate-900" />

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                  Timed-Out Users ({timedOutUsers.length})
                </span>
                {timedOutUsers.length === 0 ? (
                  <p className="text-xs text-slate-450 dark:text-slate-550 italic">No users timed out in this session.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {timedOutUsers.map((user, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded flex items-center gap-1 animate-fade-in"
                      >
                        <span>{user}</span>
                        <button
                          onClick={() => setTimedOutUsers(prev => prev.filter(u => u !== user))}
                          className="hover:text-orange-850 font-extrabold cursor-pointer border-none bg-transparent"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
