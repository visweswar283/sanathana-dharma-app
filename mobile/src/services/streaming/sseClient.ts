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
 * Streams a deity response using XMLHttpRequest.onprogress —
 * React Native does not support fetch ReadableStream, but XHR
 * progressive loading works correctly on both iOS and Android.
 */
export function streamChatResponse(
  deityId: string,
  payload: ChatPayload,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise(async (resolve) => {
    const token = await AsyncStorage.getItem('auth_token');
    const xhr = new XMLHttpRequest();
    let cursor = 0;

    // Respect AbortSignal
    signal?.addEventListener('abort', () => {
      xhr.abort();
      resolve();
    });

    xhr.open('POST', `${BASE_URL}/chat/${deityId}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${token ?? ''}`);
    xhr.setRequestHeader('Accept', 'text/event-stream');

    // Called repeatedly as new data arrives
    xhr.onprogress = () => {
      const newText = xhr.responseText.slice(cursor);
      cursor = xhr.responseText.length;
      parseSSELines(newText, onEvent);
    };

    xhr.onload = () => {
      // Parse any remaining buffered data
      const remaining = xhr.responseText.slice(cursor);
      if (remaining) parseSSELines(remaining, onEvent);
      resolve();
    };

    xhr.onerror = () => {
      onEvent({ type: 'error', message: 'Network error — check your connection.' });
      resolve();
    };

    xhr.ontimeout = () => {
      onEvent({ type: 'error', message: 'Request timed out. Please try again.' });
      resolve();
    };

    xhr.timeout = 60000;
    xhr.send(JSON.stringify(payload));
  });
}

function parseSSELines(text: string, onEvent: (event: SSEEvent) => void): void {
  // SSE format: "data: {...}\n\n"
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data: ')) continue;
    try {
      const event = JSON.parse(trimmed.slice(6)) as SSEEvent;
      onEvent(event);
    } catch {
      // Incomplete or malformed line — skip
    }
  }
}
