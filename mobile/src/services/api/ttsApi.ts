import { apiClient } from './client';

export interface TTSStatusResponse {
  available: boolean;
}

export interface TTSResponse {
  audioBase64: string;
  mimeType: 'audio/mpeg';
}

export async function fetchTTSStatus(): Promise<TTSStatusResponse> {
  const { data } = await apiClient.get<TTSStatusResponse>('/tts/status');
  return data;
}

export async function synthesizeText(text: string, deityId: string): Promise<TTSResponse> {
  const { data } = await apiClient.post<TTSResponse>('/tts', { text, deityId });
  return data;
}
