export type EmotionalState =
  | 'grief'
  | 'anxiety'
  | 'anger'
  | 'motivation-seeking'
  | 'spiritual-longing'
  | 'neutral';

export interface ChatMessage {
  id: string;
  role: 'user' | 'deity';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  deityId: string;
  messageCount: number;
  lastMessage: string;
  lastMessageAt: string;
}
