/**
 * AIChat Panel Component
 * Multi-provider AI chat interface with message history
 * Migrated from vanilla JavaScript while preserving all functionality
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Panel } from '@/components/ui';
import { usePanelSelection } from '@/hooks/usePanelInteractions';
import type { Position, Size } from '@/types/panel';

// Types for AI Chat data structures
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

type AIProvider = 'claude' | 'gpt4' | 'gemini' | 'local';
type AIModel =
  | 'sonnet'
  | 'haiku'
  | 'opus'
  | 'gpt4-turbo'
  | 'gpt4'
  | 'gpt3.5-turbo'
  | 'gemini-pro'
  | 'gemini-ultra'
  | 'llama2'
  | 'codellama'
  | 'mistral';

export interface AIChatProps {
  id: string;
  position: Position;
  size: Size;
  onMove?: (position: Position) => void;
  onResize?: (size: Size) => void;
  className?: string;
}

export const AIChat: React.FC<AIChatProps> = ({
  id,
  position,
  size,
  onMove,
  onResize,
  className = '',
}) => {
  // State management
  const [chatSessions, setChatSessions] = useState<Record<string, ChatSession>>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiProvider, setAIProvider] = useState<AIProvider>('claude');
  const [aiModel, setAIModel] = useState<AIModel>('sonnet');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Panel selection state
  const { isSelected } = usePanelSelection(id);

  // Load data on mount
  useEffect(() => {
    loadChatSessions();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatSessions, activeChatId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [currentMessage]);

  // Load chat sessions from localStorage
  const loadChatSessions = useCallback(() => {
    try {
      const stored = localStorage.getItem('lucaverse_chat_sessions');
      if (stored) {
        const sessions = JSON.parse(stored);
        setChatSessions(sessions);

        // Find the most recent session
        const sessionArray = Object.values(sessions) as ChatSession[];
        if (sessionArray.length > 0) {
          const mostRecent = sessionArray.sort((a, b) => b.updatedAt - a.updatedAt)[0];
          if (mostRecent) {
            setActiveChatId(mostRecent.id);
          } else {
            createNewChat();
          }
        } else {
          createNewChat();
        }
      } else {
        createNewChat();
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      createNewChat();
    }
  }, []);

  // Save chat sessions to localStorage
  const saveChatSessions = useCallback((sessions: Record<string, ChatSession>) => {
    try {
      localStorage.setItem('lucaverse_chat_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save chat sessions:', error);
    }
  }, []);

  // Create new chat session
  const createNewChat = useCallback(() => {
    const chatId = `chat_${Date.now()}`;
    const newChat: ChatSession = {
      id: chatId,
      title: 'New Chat',
      messages: [
        {
          id: `msg_${Date.now()}`,
          type: 'assistant',
          content: "🚀 Hello! I'm your AI assistant. How can I help you today?",
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedSessions = { ...chatSessions, [chatId]: newChat };
    setChatSessions(updatedSessions);
    setActiveChatId(chatId);
    saveChatSessions(updatedSessions);
  }, [chatSessions, saveChatSessions]);

  // Switch to different chat
  const switchToChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  // Clear all chats
  const clearAllChats = useCallback(() => {
    setChatSessions({});
    setActiveChatId(null);
    createNewChat();
  }, [createNewChat]);

  // Get active chat
  const activeChat = activeChatId ? chatSessions[activeChatId] : null;

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handle sending message
  const sendMessage = useCallback(async () => {
    const message = currentMessage.trim();
    if (!message || !activeChatId || isThinking) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: Date.now(),
    };

    // Add user message to active chat
    const updatedSessions = { ...chatSessions };
    if (updatedSessions[activeChatId]) {
      updatedSessions[activeChatId].messages.push(userMessage);
      updatedSessions[activeChatId].updatedAt = Date.now();

      // Update title if this is the first user message
      if (updatedSessions[activeChatId].title === 'New Chat') {
        updatedSessions[activeChatId].title =
          message.length > 30 ? message.substring(0, 30) + '...' : message;
      }
    }

    setChatSessions(updatedSessions);
    setCurrentMessage('');
    setIsThinking(true);
    saveChatSessions(updatedSessions);

    // Simulate AI response
    try {
      const response = await generateAIResponse(message, aiProvider, aiModel);

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      const finalSessions = { ...updatedSessions };
      if (finalSessions[activeChatId]) {
        finalSessions[activeChatId].messages.push(assistantMessage);
        finalSessions[activeChatId].updatedAt = Date.now();
      }

      setChatSessions(finalSessions);
      saveChatSessions(finalSessions);
    } catch (error) {
      console.error('Failed to get AI response:', error);

      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };

      const errorSessions = { ...updatedSessions };
      if (errorSessions[activeChatId]) {
        errorSessions[activeChatId].messages.push(errorMessage);
        errorSessions[activeChatId].updatedAt = Date.now();
      }

      setChatSessions(errorSessions);
      saveChatSessions(errorSessions);
    } finally {
      setIsThinking(false);
    }
  }, [
    currentMessage,
    activeChatId,
    isThinking,
    chatSessions,
    aiProvider,
    aiModel,
    saveChatSessions,
  ]);

  // Generate AI response (simulation)
  const generateAIResponse = useCallback(
    async (message: string, _provider: AIProvider, _model: AIModel): Promise<string> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

      const responses = [
        "I understand your question. Based on current best practices, here's my analysis:",
        "That's an excellent point. Let me break this down into actionable steps for you.",
        "I've analyzed your request and here are my recommendations with examples.",
        "Interesting challenge! Here's a comprehensive solution approach.",
        'Great question! This relates to several key concepts in modern development.',
        "Let me help you with that. Here's what I recommend:",
        "Based on the latest information, here's my technical analysis:",
        "I can assist with that implementation. Here's the optimal approach:",
      ];

      const baseResponse = responses[Math.floor(Math.random() * responses.length)];

      // Add contextual response based on message content
      if (message.toLowerCase().includes('code')) {
        return `${baseResponse}\n\n\`\`\`javascript\n// Example implementation\nconst solution = () => {\n  // Your optimized code here\n  return result;\n};\n\`\`\`\n\nThis approach ensures maintainability and performance.`;
      } else if (message.toLowerCase().includes('debug')) {
        return `${baseResponse}\n\n1. **Check for common issues**\n2. **Verify input validation**\n3. **Review error handling**\n4. **Test edge cases**\n\nWould you like me to elaborate on any of these steps?`;
      } else if (message.toLowerCase().includes('optimize')) {
        return `${baseResponse}\n\n• **Performance improvements**\n• **Memory optimization**\n• **Code refactoring suggestions**\n• **Best practices implementation**\n\nLet me know which area you'd like to focus on first.`;
      }

      return `${baseResponse}\n\nRegarding "${message.split(' ').slice(-3).join(' ')}", I'd be happy to provide more specific guidance if you can share additional context.`;
    },
    []
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // Use message template
  const useTemplate = useCallback((templateType: string) => {
    const templates = {
      explain: 'Please explain this concept in simple terms: ',
      code: 'Please review this code and suggest improvements: ',
      debug: 'Help me debug this issue: ',
      optimize: 'How can I optimize this for better performance: ',
      translate: 'Please translate this to ',
    };

    if (templates[templateType as keyof typeof templates]) {
      setCurrentMessage(templates[templateType as keyof typeof templates]);
      textareaRef.current?.focus();
    }
  }, []);

  // Format timestamp
  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Get time ago string
  const getTimeAgo = useCallback((timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }, []);

  // Model options based on provider
  const getModelOptions = useCallback((provider: AIProvider) => {
    const modelOptions = {
      claude: [
        { value: 'sonnet', label: 'Claude 3.5 Sonnet' },
        { value: 'haiku', label: 'Claude 3 Haiku' },
        { value: 'opus', label: 'Claude 3 Opus' },
      ],
      gpt4: [
        { value: 'gpt4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt4', label: 'GPT-4' },
        { value: 'gpt3.5-turbo', label: 'GPT-3.5 Turbo' },
      ],
      gemini: [
        { value: 'gemini-pro', label: 'Gemini Pro' },
        { value: 'gemini-ultra', label: 'Gemini Ultra' },
      ],
      local: [
        { value: 'llama2', label: 'Llama 2 70B' },
        { value: 'codellama', label: 'Code Llama' },
        { value: 'mistral', label: 'Mistral 7B' },
      ],
    };

    return modelOptions[provider] || modelOptions.claude;
  }, []);

  // Update model when provider changes
  useEffect(() => {
    const options = getModelOptions(aiProvider);
    if (options.length > 0) {
      setAIModel(options[0].value as AIModel);
    }
  }, [aiProvider, getModelOptions]);

  // Chat sessions array for sidebar
  const chatSessionsArray = Object.values(chatSessions).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <Panel
      id={id}
      title="AI Command Center"
      icon="🤖"
      position={position}
      size={size}
      isSelected={isSelected}
      onMove={onMove || (() => {})}
      onResize={onResize || (() => {})}
      className={className}
      constraints={{
        minSize: { width: 400, height: 400 },
        maxSize: { width: 800, height: 800 },
      }}
    >
      <div className="h-full flex">
        {/* Chat History Sidebar */}
        <div className="w-1/3 border-r border-white border-opacity-10 flex flex-col">
          {/* Controls */}
          <div className="p-3 border-b border-white border-opacity-10">
            <div className="flex space-x-2 mb-3">
              <button
                onClick={createNewChat}
                className="flex-1 px-3 py-2 bg-blue-500 bg-opacity-20 text-blue-300 rounded text-sm hover:bg-opacity-30 transition-colors"
              >
                + New Chat
              </button>
              <button
                onClick={clearAllChats}
                className="px-3 py-2 bg-red-500 bg-opacity-20 text-red-300 rounded text-sm hover:bg-opacity-30 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Provider & Model Selection */}
            <div className="space-y-2">
              <select
                value={aiProvider}
                onChange={e => setAIProvider(e.target.value as AIProvider)}
                className="w-full px-2 py-1 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="claude">Claude</option>
                <option value="gpt4">GPT-4</option>
                <option value="gemini">Gemini</option>
                <option value="local">Local Models</option>
              </select>

              <select
                value={aiModel}
                onChange={e => setAIModel(e.target.value as AIModel)}
                className="w-full px-2 py-1 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {getModelOptions(aiProvider).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-auto">
            {chatSessionsArray.map(session => {
              const lastMessage = session.messages[session.messages.length - 1];
              const preview =
                lastMessage?.content && lastMessage.content.length > 40
                  ? lastMessage.content.substring(0, 40) + '...'
                  : lastMessage?.content || 'New conversation';

              return (
                <div
                  key={session.id}
                  onClick={() => switchToChat(session.id)}
                  className={`p-3 cursor-pointer border-b border-white border-opacity-5 hover:bg-white hover:bg-opacity-5 transition-colors ${
                    activeChatId === session.id ? 'bg-white bg-opacity-10' : ''
                  }`}
                >
                  <div className="text-white text-sm font-medium truncate mb-1">
                    {session.title}
                  </div>
                  <div className="text-white text-opacity-60 text-xs truncate mb-1">{preview}</div>
                  <div className="text-white text-opacity-40 text-xs">
                    {getTimeAgo(session.updatedAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Message Templates */}
          <div className="p-3 border-b border-white border-opacity-10">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'explain', label: '📝 Explain', emoji: '📝' },
                { key: 'code', label: '💻 Code Review', emoji: '💻' },
                { key: 'debug', label: '🐛 Debug', emoji: '🐛' },
                { key: 'optimize', label: '⚡ Optimize', emoji: '⚡' },
              ].map(template => (
                <button
                  key={template.key}
                  onClick={() => useTemplate(template.key)}
                  className="px-2 py-1 bg-white bg-opacity-10 text-white text-opacity-80 rounded text-xs hover:bg-opacity-20 transition-colors"
                >
                  {template.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {activeChat?.messages.map(message => (
              <div
                key={message.id}
                className={`message ${message.type === 'user' ? 'ml-8' : 'mr-8'}`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 bg-opacity-20 text-blue-100 ml-auto'
                      : 'bg-white bg-opacity-10 text-white'
                  }`}
                >
                  <div className="font-medium text-sm mb-1">
                    {message.type === 'user' ? 'You' : '🤖 Lucaverse AI'}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-60 mt-2">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="mr-8">
                <div className="bg-white bg-opacity-10 text-white p-3 rounded-lg">
                  <div className="font-medium text-sm mb-1">🤖 Lucaverse AI</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Thinking</span>
                    <div className="flex space-x-1">
                      <div
                        className="w-1 h-1 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white border-opacity-10">
            <div className="flex space-x-2">
              <textarea
                ref={textareaRef}
                value={currentMessage}
                onChange={e => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isThinking ? '🤖 AI is thinking...' : 'Ask me anything... (Ctrl+Enter to send)'
                }
                disabled={isThinking}
                rows={1}
                className="flex-1 px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isThinking}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};

AIChat.displayName = 'AIChat';

export default AIChat;
