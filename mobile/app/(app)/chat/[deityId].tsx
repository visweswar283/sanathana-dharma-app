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
import { ChatBubble } from '../../../src/components/chat/ChatBubble';
import { ChatInput } from '../../../src/components/chat/ChatInput';
import { EmotionPicker } from '../../../src/components/chat/EmotionPicker';
import { TypingIndicator } from '../../../src/components/chat/TypingIndicator';
import type { EmotionalState } from '../../../src/types/chat';
import { COLORS, SPACING, TYPE } from '../../../src/theme';

export default function ChatScreen() {
  const { deityId } = useLocalSearchParams<{ deityId: string }>();
  const getDeity = useDeityStore((s) => s.getDeity);
  const { messages, isStreaming, sendMessage, clearConversation } = useChatStore();
  const deity = getDeity(deityId);

  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [emotionLocked, setEmotionLocked] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Clear chat on unmount
  useEffect(() => {
    return () => { clearConversation(); };
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
    sendMessage(deityId, text, emotionalState ?? undefined);
  };

  const isFirstMessage = messages.length === 0;
  const showTyping = isStreaming && messages.at(-1)?.role === 'deity' && messages.at(-1)?.content === '';

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
            <TouchableOpacity onPress={clearConversation} style={styles.backBtn}>
              <Ionicons name="refresh" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Emotion Picker — shown only before first message */}
          {isFirstMessage && !emotionLocked && (
            <EmotionPicker selected={emotionalState} onSelect={setEmotionalState} />
          )}

          {/* Welcome message when no messages yet */}
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
            </View>
          )}

          {/* Messages */}
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

          {/* Input */}
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
  welcome: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  welcomeOm: { fontSize: 40, marginBottom: SPACING.sm },
  welcomeTitle: { ...TYPE.heading2, marginBottom: SPACING.sm },
  welcomeText: { ...TYPE.body, color: COLORS.textMuted, textAlign: 'center', lineHeight: 24 },
  messages: { flex: 1 },
  messagesContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
});
