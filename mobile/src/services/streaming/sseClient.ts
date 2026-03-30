import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/client';

export interface SSEChunk {
  type: 'chunk';
  content: string;
}

export interface SSEDone {
  type: 'done';
  conversationId: string;
  cachedTokens: number;
  totalTokens: number;
}

export interface SSEError {
  type: 'error';
  message: string;
}

export type SSEEvent = SSEChunk | SSEDone | SSEError;

interface ChatPayload {
  conversationId: string | null;
  message: string;
  emotionalState?: string;
}

/**
 * Streams a deity response from the backend via SSE (Server-Sent Events).
 * Uses fetch + ReadableStream because React Native does not support the
 * browser EventSource API natively.
 *
 * Calls onEvent for each parsed SSE event until 'done' or 'error'.
 */
export async function streamChatResponse(
  deityId: string,
  payload: ChatPayload,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const token = await AsyncStorage.getItem('auth_token');

  const response = await fetch(`${BASE_URL}/chat/${deityId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const parsed = JSON.parse(errorText);
      onEvent({ type: 'error', message: parsed?.error?.message ?? 'Request failed' });
    } catch {
      onEvent({ type: 'error', message: `Request failed (${response.status})` });
    }
    return;
  }

  if (!response.body) {
    onEvent({ type: 'error', message: 'No response stream received' });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE format: "data: {...}\n\n"
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data: ')) continue;

      try {
        const event = JSON.parse(line.slice(6)) as SSEEvent;
        onEvent(event);
        if (event.type === 'done' || event.type === 'error') return;
      } catch {
        // Malformed SSE line — skip
      }
    }
  }
}
