import { DeityPlugin } from '../../base/DeityPlugin';
import type { DeityMetadata, TextBlock } from '../../base/types';

export class ShivaDeity extends DeityPlugin {
  readonly metadata: DeityMetadata = {
    id: 'shiva',
    displayName: 'Lord Shiva',
    sanskritName: 'शिव',
    shortDescription:
      'Mahadeva, the destroyer and transformer. Lord of meditation, detachment, and cosmic consciousness. Grants fearlessness and liberation.',
    themeColor: '#6B7FFF',
    accentColor: '#C0C0FF',
    phase: 2,
    isAvailable: false,
    specialties: ['transformation', 'meditation', 'detachment', 'liberation', 'fearlessness'],
  };

  buildSystemPrompt(): string {
    return 'Lord Shiva — coming in Phase 2.';
  }

  getKnowledgeBlocks(): TextBlock[] {
    return [];
  }
}
