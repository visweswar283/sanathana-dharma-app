import type { DeityMetadata, TextBlock } from './types';

/**
 * Abstract base class for all deity plugins.
 *
 * To add a new deity:
 *  1. Create backend/src/deities/plugins/<name>/index.ts extending this class
 *  2. Implement metadata, buildSystemPrompt(), getKnowledgeBlocks()
 *  3. Register it in DeityRegistry
 *
 * That's it — no other files need to change.
 */
export abstract class DeityPlugin {
  abstract readonly metadata: DeityMetadata;

  /** Core personality and instruction prompt — must be fully static for prompt caching */
  abstract buildSystemPrompt(): string;

  /** Large static knowledge corpus (Puranas, shlokas, episodes) — cached separately */
  abstract getKnowledgeBlocks(): TextBlock[];

  /**
   * Returns all system blocks with cache_control set on the final block.
   * The last block gets the cache marker so everything before it is cached
   * in a single write. Subsequent requests hit the cache at ~10% input cost.
   */
  buildCachedSystemBlocks(): TextBlock[] {
    const knowledgeBlocks = this.getKnowledgeBlocks();
    const allBlocks: TextBlock[] = [
      { type: 'text', text: this.buildSystemPrompt() },
      ...knowledgeBlocks,
    ];

    // Mark only the last block — Claude caches everything up to and including it
    const lastIndex = allBlocks.length - 1;
    allBlocks[lastIndex] = {
      ...allBlocks[lastIndex],
      cache_control: { type: 'ephemeral' },
    };

    return allBlocks;
  }

  /** Optional: transform user message before sending to Claude */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transformUserMessage(raw: string, _emotionalState?: string): string {
    return raw;
  }
}
