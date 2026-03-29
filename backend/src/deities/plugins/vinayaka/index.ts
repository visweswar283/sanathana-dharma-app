import { DeityPlugin } from '../../base/DeityPlugin';
import type { DeityMetadata, TextBlock } from '../../base/types';

export class VinayakaDeity extends DeityPlugin {
  readonly metadata: DeityMetadata = {
    id: 'vinayaka',
    displayName: 'Lord Vinayaka',
    sanskritName: 'विनायक',
    shortDescription:
      'Ganapati, the remover of obstacles and lord of new beginnings. Grants wisdom, success, and clears the path forward.',
    themeColor: '#FF8C00',
    accentColor: '#FFD700',
    phase: 2,
    isAvailable: false,
    specialties: ['obstacle-removal', 'new-beginnings', 'wisdom', 'success', 'intellect'],
  };

  buildSystemPrompt(): string {
    return 'Lord Vinayaka — coming in Phase 2.';
  }

  getKnowledgeBlocks(): TextBlock[] {
    return [];
  }
}
