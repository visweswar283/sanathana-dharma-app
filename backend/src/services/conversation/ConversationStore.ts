import { v4 as uuidv4 } from 'uuid';
import type { Conversation, Message, MessageRole } from '../../models/Conversation';
import type { EmotionalState } from '../../deities/base/types';
import { ConversationNotFoundError } from '../../utils/errors';

/**
 * In-memory conversation store for Phase 1.
 * Phase 2: swap this implementation for Redis or a database.
 * The interface stays identical — no other files need to change.
 */
export class ConversationStore {
  private readonly store = new Map<string, Conversation>();
  private readonly userIndex = new Map<string, string[]>();

  create(userId: string, deityId: string): Conversation {
    const id = uuidv4();
    const now = new Date();
    const conversation: Conversation = {
      id,
      userId,
      deityId,
      messages: [],
      startedAt: now,
      lastMessageAt: now,
    };
    this.store.set(id, conversation);

    const userConversations = this.userIndex.get(userId) ?? [];
    userConversations.push(id);
    this.userIndex.set(userId, userConversations);

    return conversation;
  }

  get(conversationId: string): Conversation {
    const conversation = this.store.get(conversationId);
    if (!conversation) throw new ConversationNotFoundError(conversationId);
    return conversation;
  }

  getByUser(userId: string): Conversation[] {
    const ids = this.userIndex.get(userId) ?? [];
    return ids
      .map((id) => this.store.get(id))
      .filter((c): c is Conversation => c !== undefined)
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  appendMessages(
    conversationId: string,
    entries: Array<{ role: MessageRole; content: string; emotionalState?: EmotionalState }>
  ): void {
    const conversation = this.get(conversationId);
    const now = new Date();

    for (const entry of entries) {
      const message: Message = {
        id: uuidv4(),
        conversationId,
        role: entry.role,
        content: entry.content,
        emotionalState: entry.emotionalState,
        timestamp: now,
      };
      conversation.messages.push(message);
    }

    conversation.lastMessageAt = now;
  }

  /** Returns last N message pairs formatted for Claude API */
  getClaudeHistory(
    conversationId: string,
    maxMessages = 20
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    const conversation = this.store.get(conversationId);
    if (!conversation) return [];

    return conversation.messages
      .slice(-maxMessages)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  }
}

export const conversationStore = new ConversationStore();
