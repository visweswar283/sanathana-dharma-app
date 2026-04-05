import { create } from 'zustand';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { fetchTTSStatus, synthesizeText } from '../services/api/ttsApi';

interface VoiceState {
  isVoiceEnabled: boolean;   // user toggle — on/off
  isTTSAvailable: boolean;   // server has ElevenLabs key
  isSpeaking: boolean;       // audio currently playing
  isLoading: boolean;        // fetching audio from backend
  sound: Audio.Sound | null;

  checkTTSAvailability: () => Promise<void>;
  toggleVoice: () => void;
  speak: (text: string, deityId: string) => Promise<void>;
  stopSpeaking: () => Promise<void>;
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  isVoiceEnabled: false,
  isTTSAvailable: false,
  isSpeaking: false,
  isLoading: false,
  sound: null,

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
    if (isVoiceEnabled) {
      stopSpeaking();
    }
    set({ isVoiceEnabled: !isVoiceEnabled });
  },

  speak: async (text: string, deityId: string) => {
    const { isVoiceEnabled, isTTSAvailable, stopSpeaking } = get();
    if (!isVoiceEnabled || !isTTSAvailable) return;

    await stopSpeaking();
    set({ isLoading: true });

    try {
      // Set up audio session for playback
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      const { audioBase64 } = await synthesizeText(text, deityId);

      // Write base64 audio to a temp file — expo-av needs a file URI
      const tempPath = `${FileSystem.cacheDirectory}tts_response.mp3`;
      await FileSystem.writeAsStringAsync(tempPath, audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: tempPath },
        { shouldPlay: true }
      );

      set({ sound, isSpeaking: true, isLoading: false });

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          set({ isSpeaking: false, sound: null });
          sound.unloadAsync();
        }
      });
    } catch {
      set({ isLoading: false, isSpeaking: false });
    }
  },

  stopSpeaking: async () => {
    const { sound } = get();
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    set({ sound: null, isSpeaking: false, isLoading: false });
  },
}));
