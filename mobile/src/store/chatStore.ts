import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage, EmotionalState } from '../types/chat';
import { streamChatResponse } from '../services/streaming/sseClient';

interface ChatState {
  messages: ChatMessage[];
  conversationId: string | null;
  isStreaming: boolean;
  error: string | null;
  abortController: AbortController | null;

  sendMessage: (deityId: string, text: string, emotionalState?: EmotionalState) => Promise<void>;
  clearConversation: () => void;
  dismissError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversationId: null,
  isStreaming: false,
  error: null,
  abortController: null,

  sendMessage: async (deityId, text, emotionalState) => {
    const { conversationId } = get();

    // Add user message immediately
    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    // Placeholder for streaming deity response
    const deityMsgId = uuidv4();
    const deityMsg: ChatMessage = {
      id: deityMsgId,
      role: 'deity',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    set((s) => ({
      messages: [...s.messages, userMsg, deityMsg],
      isStreaming: true,
      error: null,
    }));

    const controller = new AbortController();
    set({ abortController: controller });

    await streamChatResponse(
      deityId,
      { conversationId, message: text, emotionalState },
      (event) => {
        if (event.type === 'chunk') {
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === deityMsgId
                ? { ...m, content: m.content + event.content }
                : m
            ),
          }));
        } else if (event.type === 'done') {
          set((s) => ({
            conversationId: event.conversationId,
            isStreaming: false,
            abortController: null,
            messages: s.messages.map((m) =>
              m.id === deityMsgId ? { ...m, isStreaming: false } : m
            ),
          }));
        } else if (event.type === 'error') {
          set((s) => ({
            isStreaming: false,
            error: event.message,
            abortController: null,
            messages: s.messages.map((m) =>
              m.id === deityMsgId
                ? { ...m, content: event.message, isStreaming: false }
                : m
            ),
          }));
        }
      },
      controller.signal
    );
  },

  clearConversation: () => {
    get().abortController?.abort();
    set({ messages: [], conversationId: null, isStreaming: false, error: null, abortController: null });
  },

  dismissError: () => set({ error: null }),
}));
