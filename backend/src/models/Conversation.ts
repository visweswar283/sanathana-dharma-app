import type { EmotionalState } from '../deities/base/types';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  emotionalState?: EmotionalState;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  deityId: string;
  messages: Message[];
  startedAt: Date;
  lastMessageAt: Date;
}
