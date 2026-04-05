import { create } from 'zustand';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { fetchTTSStatus, synthesizeText } from '../services/api/ttsApi';

interface VoiceState {
  isVoiceEnabled: boolean;   // user toggle — on/off
  isTTSAvailable: boolean;   // server has ElevenLabs key
  isSpeaking: boolean;       // audio currently playing
  isLoading: boolean;        // fetching audio from backend
  player: AudioPlayer | null;

  checkTTSAvailability: () => Promise<void>;
  toggleVoice: () => void;
  speak: (text: string, deityId: string) => Promise<void>;
  stopSpeaking: () => void;
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  isVoiceEnabled: false,
  isTTSAvailable: false,
  isSpeaking: false,
  isLoading: false,
  player: null,

  checkTTSAvailability: async () => {
    try {
      const { available } = await fetchTTSStatus();
      set({ isTTSAvailable: available });
    } catch {
      set({ isTTSAvailable: false });
    }
  },

  toggleVoice: () => {
    const { isVoiceEnabled, stopSpeaking } = get();
    if (isVoiceEnabled) stopSpeaking();
    set({ isVoiceEnabled: !isVoiceEnabled });
  },

  speak: async (text: string, deityId: string) => {
    const { isVoiceEnabled, isTTSAvailable, stopSpeaking } = get();
    if (!isVoiceEnabled || !isTTSAvailable) return;

    stopSpeaking();
    set({ isLoading: true });

    try {
      await setAudioModeAsync({ playsInSilentMode: true });

      const { audioBase64 } = await synthesizeText(text, deityId);

      // Write base64 audio to a temp file — expo-audio needs a file URI
      const tempPath = `${FileSystem.cacheDirectory}tts_response.mp3`;
      await FileSystem.writeAsStringAsync(tempPath, audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const player = createAudioPlayer({ uri: tempPath });
      set({ player, isLoading: false, isSpeaking: true });

      player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          player.remove();
          set({ isSpeaking: false, player: null });
        }
      });

      player.play();
    } catch {
      set({ isLoading: false, isSpeaking: false });
    }
  },

  stopSpeaking: () => {
    const { player } = get();
    if (player) {
      player.remove();
    }
    set({ player: null, isSpeaking: false, isLoading: false });
  },
}));
