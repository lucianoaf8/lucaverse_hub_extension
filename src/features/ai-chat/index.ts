/**
 * AI Chat feature module
 * Main entry point for AI chat functionality
 */

// Components (to be moved here)
export * from '@/components/panels/AiChat/AiChat';

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    tokens?: number;
    model?: string;
    temperature?: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  model: string;
  systemPrompt?: string;
}

export interface AiChatConfig {
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  temperature: number;
  maxTokens: number;
  enableStreaming: boolean;
  enableMarkdown: boolean;
  enableCodeHighlighting: boolean;
}

// Constants
export const AI_CHAT_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 8000,
  MAX_SESSIONS: 100,
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 2000,
  SUPPORTED_PROVIDERS: ['openai', 'anthropic', 'local'] as const,
} as const;
