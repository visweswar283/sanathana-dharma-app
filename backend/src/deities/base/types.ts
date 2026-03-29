import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

export type DeityPhase = 1 | 2 | 3;

export type EmotionalState =
  | 'grief'
  | 'anxiety'
  | 'anger'
  | 'motivation-seeking'
  | 'spiritual-longing'
  | 'neutral';

export interface DeityMetadata {
  id: string;
  displayName: string;
  sanskritName: string;
  shortDescription: string;
  themeColor: string;
  accentColor: string;
  phase: DeityPhase;
  isAvailable: boolean;
  specialties: string[];
}

export interface DeityContext {
  userId: string;
  conversationId: string;
  emotionalState?: EmotionalState;
  messageHistory: MessageParam[];
}

export interface TextBlock {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
}
