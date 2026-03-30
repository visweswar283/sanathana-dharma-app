import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ChatMessage } from '../../types/chat';
import { COLORS, SPACING, RADIUS, TYPE } from '../../theme';

interface ChatBubbleProps {
  message: ChatMessage;
  deityColor: string;
  deityAccent: string;
}

export function ChatBubble({ message, deityColor, deityAccent }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.deityRow}>
      {/* Deity glyph */}
      <View style={[styles.deityGlyph, { borderColor: deityColor }]}>
        <Text style={[styles.deityGlyphText, { color: deityAccent }]}>ॐ</Text>
      </View>

      <View style={styles.deityBubbleWrapper}>
        <LinearGradient
          colors={[deityColor + '18', deityColor + '08']}
          style={[styles.deityBubble, { borderColor: deityColor + '40' }]}
        >
          <Text style={styles.deityText}>
            {message.content}
            {message.isStreaming && (
              <Text style={[styles.cursor, { color: deityAccent }]}>▌</Text>
            )}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.md,
    paddingLeft: 60,
  },
  userBubble: {
    backgroundColor: COLORS.bubbleUser,
    borderWidth: 1,
    borderColor: COLORS.bubbleUserBorder,
    borderRadius: RADIUS.md,
    borderBottomRightRadius: 4,
    padding: SPACING.md,
    maxWidth: '100%',
  },
  userText: {
    ...TYPE.body,
    color: COLORS.textCream,
  },
  deityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingRight: 40,
    gap: SPACING.sm,
  },
  deityGlyph: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexShrink: 0,
    marginTop: 4,
  },
  deityGlyphText: { fontSize: 16 },
  deityBubbleWrapper: { flex: 1 },
  deityBubble: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    borderTopLeftRadius: 4,
    padding: SPACING.md,
  },
  deityText: {
    ...TYPE.body,
    color: COLORS.textCream,
    lineHeight: 26,
  },
  cursor: { fontSize: 16 },
});
