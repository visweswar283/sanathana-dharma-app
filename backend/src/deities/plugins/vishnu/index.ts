import { DeityPlugin } from '../../base/DeityPlugin';
import type { DeityMetadata, TextBlock } from '../../base/types';

export class VishnuDeity extends DeityPlugin {
  readonly metadata: DeityMetadata = {
    id: 'vishnu',
    displayName: 'Lord Vishnu',
    sanskritName: 'विष्णु',
    shortDescription:
      'The Preserver of the universe. Lord of compassion, grace, and cosmic order. Guides through dharma and sustains through all difficulties.',
    themeColor: '#1A4FBF',
    accentColor: '#FFD700',
    phase: 2,
    isAvailable: false,
    specialties: ['compassion', 'dharma', 'protection', 'grace', 'cosmic-order'],
  };

  buildSystemPrompt(): string {
    return 'Lord Vishnu — coming in Phase 2.';
  }

  getKnowledgeBlocks(): TextBlock[] {
    return [];
  }
}
