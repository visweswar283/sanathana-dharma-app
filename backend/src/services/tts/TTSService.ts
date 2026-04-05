import { env } from '../../config/environment';
import { deityRegistry } from '../../deities/registry';

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Voice settings tuned for a divine, warm, resonant Hanuma voice
const VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.75,
  style: 0.2,
  use_speaker_boost: true,
};

// Cap text length to stay within ElevenLabs free tier limits
const MAX_CHARS = 2500;

export function isTTSAvailable(): boolean {
  return Boolean(env.ELEVENLABS_API_KEY);
}

/**
 * Converts deity response text to MP3 audio using ElevenLabs.
 * Returns a Buffer of audio/mpeg data.
 */
export async function synthesizeSpeech(text: string, deityId: string): Promise<Buffer> {
  if (!env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Resolve voice ID: deity-specific first, then global default
  const deity = deityRegistry.getDeity(deityId);
  const voiceId = deity?.metadata.voiceId ?? env.ELEVENLABS_VOICE_ID;

  // Trim to char limit — long responses can exceed free tier quota
  const trimmedText = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + '...' : text;

  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: trimmedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: VOICE_SETTINGS,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
