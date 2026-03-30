import type { EmotionalState } from '../../deities/base/types';
import { deityRegistry } from '../../deities/registry';
import { conversationStore } from '../conversation/ConversationStore';
import { anthropic, CLAUDE_MODEL } from '../../config/anthropic';
import { DeityNotFoundError, DeityUnavailableError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { env } from '../../config/environment';
import { getMockResponse } from './MockResponses';

export interface StreamChunk {
  type: 'chunk';
  content: string;
}

export interface StreamDone {
  type: 'done';
  conversationId: string;
  cachedTokens: number;
  totalTokens: number;
}

export interface StreamError {
  type: 'error';
  message: string;
}

export type StreamEvent = StreamChunk | StreamDone | StreamError;

export class ChatService {
  async *streamDeityResponse(
    deityId: string,
    userId: string,
    conversationId: string | null,
    userMessage: string,
    emotionalState?: EmotionalState
  ): AsyncGenerator<StreamEvent> {
    const deity = deityRegistry.getDeity(deityId);
    if (!deity) throw new DeityNotFoundError(deityId);
    if (!deity.metadata.isAvailable) throw new DeityUnavailableError(deityId);

    // Load or create conversation
    const conversation =
      conversationId !== null
        ? conversationStore.get(conversationId)
        : conversationStore.create(userId, deityId);

    // Get prior history for Claude
    const history = conversationStore.getClaudeHistory(conversation.id);

    // Let the deity plugin transform the user message (e.g., prepend emotional state)
    const transformedMessage = deity.transformUserMessage(userMessage, emotionalState);

    // Build system blocks with prompt caching
    const systemBlocks = deity.buildCachedSystemBlocks();

    logger.debug(`Streaming response from ${deity.metadata.displayName}`, {
      conversationId: conversation.id,
      historyLength: history.length,
    });

    let fullResponse = '';
    let cachedTokens = 0;
    let totalTokens = 0;

    const isMockMode = !env.ANTHROPIC_API_KEY || env.MOCK_MODE;

    if (isMockMode) {
      // Stream a pre-written response word-by-word so the UI feels real
      fullResponse = getMockResponse(emotionalState);
      const words = fullResponse.split(' ');
      for (const word of words) {
        yield { type: 'chunk', content: word + ' ' };
        await new Promise((r) => setTimeout(r, 40));
      }
    } else {
      try {
        const stream = anthropic.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: 1024,
          system: systemBlocks as Parameters<typeof anthropic.messages.stream>[0]['system'],
          messages: [
            ...history,
            { role: 'user', content: transformedMessage },
          ],
        });

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullResponse += event.delta.text;
            yield { type: 'chunk', content: event.delta.text };
          }
        }

        const finalMessage = await stream.finalMessage();
        cachedTokens = (finalMessage.usage as unknown as Record<string, number>)['cache_read_input_tokens'] ?? 0;
        totalTokens = finalMessage.usage.input_tokens + finalMessage.usage.output_tokens;

        if (cachedTokens > 0) {
          logger.debug(
            `Cache hit: ${cachedTokens} tokens served from cache (saved ~${Math.round((cachedTokens / totalTokens) * 100)}% input cost)`
          );
        }
      } catch (err) {
        logger.error('Claude API error', err);
        yield { type: 'error', message: 'The divine connection was interrupted. Please try again.' };
        return;
      }
    }

    // Persist both messages
    conversationStore.appendMessages(conversation.id, [
      { role: 'user', content: userMessage, emotionalState },
      { role: 'assistant', content: fullResponse },
    ]);

    yield { type: 'done', conversationId: conversation.id, cachedTokens, totalTokens };
  }
}

export const chatService = new ChatService();
