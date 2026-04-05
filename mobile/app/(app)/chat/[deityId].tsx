import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDeityStore } from '../../../src/store/deityStore';
import { useChatStore } from '../../../src/store/chatStore';
import { useVoiceStore } from '../../../src/store/voiceStore';
import { ChatBubble } from '../../../src/components/chat/ChatBubble';
import { ChatInput } from '../../../src/components/chat/ChatInput';
import { EmotionPicker } from '../../../src/components/chat/EmotionPicker';
import { TypingIndicator } from '../../../src/components/chat/TypingIndicator';
import { VoiceToggle } from '../../../src/components/chat/VoiceToggle';
import { DeityPresence } from '../../../src/components/presence/DeityPresence';
import type { EmotionalState } from '../../../src/types/chat';
import { COLORS, SPACING, TYPE } from '../../../src/theme';

type ViewMode = 'chat' | 'presence';

export default function ChatScreen() {
  const { deityId } = useLocalSearchParams<{ deityId: string }>();
  const getDeity = useDeityStore((s) => s.getDeity);
  const { messages, isStreaming, sendMessage, clearConversation } = useChatStore();
  const {
    isVoiceEnabled,
    isTTSAvailable,
    isSpeaking,
    isLoading: isTTSLoading,
    checkTTSAvailability,
    toggleVoice,
    speak,
    stopSpeaking,
  } = useVoiceStore();

  const deity = getDeity(deityId);
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [emotionLocked, setEmotionLocked] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => { checkTTSAvailability(); }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Auto-play voice when deity finishes streaming
  const prevStreamingRef = useRef(false);
  useEffect(() => {
    const wasStreaming = prevStreamingRef.current;
    prevStreamingRef.current = isStreaming;

    if (wasStreaming && !isStreaming) {
      const lastMessage = messages.at(-1);
      if (lastMessage?.role === 'deity' && lastMessage.content && isVoiceEnabled) {
        speak(lastMessage.content, deityId);
      }
    }
  }, [isStreaming, messages, isVoiceEnabled, deityId]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      clearConversation();
    };
  }, []);

  if (!deity) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.textWhite }}>Deity not found</Text>
      </View>
    );
  }

  const handleSend = (text: string) => {
    setEmotionLocked(true);
    stopSpeaking();
    sendMessage(deityId, text, emotionalState ?? undefined);
  };

  const isFirstMessage = messages.length === 0;
  const showTyping = isStreaming && messages.at(-1)?.role === 'deity' && messages.at(-1)?.content === '';

  // Last deity message for presence mode subtitle
  const lastDeityMessage = [...messages].reverse().find((m) => m.role === 'deity')?.content ?? '';

  return (
    <LinearGradient colors={[COLORS.bgDeep, COLORS.bgMid]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={COLORS.textCream} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: deity.accentColor }]}>
                {deity.displayName}
              </Text>
              <Text style={styles.headerSub}>{deity.sanskritName}</Text>
            </View>
            <VoiceToggle
              isEnabled={isVoiceEnabled}
              isAvailable={isTTSAvailable}
              isSpeaking={isSpeaking}
              isLoading={isTTSLoading}
              onToggle={toggleVoice}
              accentColor={deity.accentColor}
            />
          </View>

          {/* Mode toggle — Chat | Presence */}
          <View style={styles.modeBar}>
            <TouchableOpacity
              style={[styles.modeTab, viewMode === 'chat' && styles.modeTabActive]}
              onPress={() => setViewMode('chat')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={14}
                color={viewMode === 'chat' ? deity.accentColor : COLORS.textMuted}
              />
              <Text style={[styles.modeLabel, viewMode === 'chat' && { color: deity.accentColor }]}>
                Chat
              </Text>
            </TouchableOpacity>

            <View style={styles.modeDivider} />

            <TouchableOpacity
              style={[styles.modeTab, viewMode === 'presence' && styles.modeTabActive]}
              onPress={() => setViewMode('presence')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="sparkles-outline"
                size={14}
                color={viewMode === 'presence' ? deity.accentColor : COLORS.textMuted}
              />
              <Text style={[styles.modeLabel, viewMode === 'presence' && { color: deity.accentColor }]}>
                Presence
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── PRESENCE MODE ── */}
          {viewMode === 'presence' && (
            <DeityPresence
              deityName={deity.displayName}
              sanskritName={deity.sanskritName}
              accentColor={deity.accentColor}
              themeColor={deity.themeColor}
              lastMessage={lastDeityMessage}
              isStreaming={isStreaming}
              isSpeaking={isSpeaking}
              isLoading={isTTSLoading}
            />
          )}

          {/* ── CHAT MODE ── */}
          {viewMode === 'chat' && (
            <>
              {isFirstMessage && !emotionLocked && (
                <EmotionPicker selected={emotionalState} onSelect={setEmotionalState} />
              )}

              {isFirstMessage && (
                <View style={styles.welcome}>
                  <Text style={styles.welcomeOm}>🙏</Text>
                  <Text style={[styles.welcomeTitle, { color: deity.accentColor }]}>
                    Jai Shri Ram
                  </Text>
                  <Text style={styles.welcomeText}>
                    {deity.displayName} is present with you.{'\n'}
                    Share what is in your heart.
                  </Text>
                  {isTTSAvailable && (
                    <Text style={styles.voiceHint}>
                      Enable voice mode to hear {deity.displayName} speak.
                      Switch to Presence mode for a sacred experience.
                    </Text>
                  )}
                </View>
              )}

              <ScrollView
                ref={scrollRef}
                style={styles.messages}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    deityColor={deity.themeColor}
                    deityAccent={deity.accentColor}
                  />
                ))}
                {showTyping && <TypingIndicator color={deity.accentColor} />}
              </ScrollView>
            </>
          )}

          {/* Input — always visible in both modes */}
          <ChatInput
            onSend={handleSend}
            isDisabled={isStreaming}
            accentColor={deity.accentColor}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgDeep },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backBtn: { padding: SPACING.sm, width: 44, alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { ...TYPE.heading3, fontWeight: '700' },
  headerSub: { ...TYPE.caption, color: COLORS.textMuted },
  // Mode toggle bar
  modeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modeTabActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  modeDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.sm,
  },
  // Chat mode
  welcome: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  welcomeOm: { fontSize: 40, marginBottom: SPACING.sm },
  welcomeTitle: { ...TYPE.heading2, marginBottom: SPACING.sm },
  welcomeText: { ...TYPE.body, color: COLORS.textMuted, textAlign: 'center', lineHeight: 24 },
  voiceHint: {
    marginTop: SPACING.sm,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  messages: { flex: 1 },
  messagesContent: { padding: SPACING.md, paddingBottom: SPACING.sm },
});
