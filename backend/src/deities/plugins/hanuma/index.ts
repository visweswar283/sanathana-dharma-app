import { DeityPlugin } from '../../base/DeityPlugin';
import type { DeityMetadata, TextBlock } from '../../base/types';
import { HANUMA_METADATA } from './metadata';
import { HANUMA_SYSTEM_PROMPT } from './systemPrompt';
import { HANUMA_KNOWLEDGE_BLOCKS } from './knowledge';

export class HanumaDeity extends DeityPlugin {
  readonly metadata: DeityMetadata = HANUMA_METADATA;

  buildSystemPrompt(): string {
    return HANUMA_SYSTEM_PROMPT;
  }

  getKnowledgeBlocks(): TextBlock[] {
    return HANUMA_KNOWLEDGE_BLOCKS;
  }

  transformUserMessage(raw: string, emotionalState?: string): string {
    if (!emotionalState || emotionalState === 'neutral') return raw;
    return `[Devotee's emotional state: ${emotionalState}]\n\n${raw}`;
  }
}
