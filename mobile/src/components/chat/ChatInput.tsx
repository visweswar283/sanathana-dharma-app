import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../theme';

interface ChatInputProps {
  onSend: (text: string) => void;
  isDisabled: boolean;
  accentColor: string;
}

export function ChatInput({ onSend, isDisabled, accentColor }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Speak to Lord Hanuma..."
        placeholderTextColor={COLORS.textMuted}
        multiline
        maxLength={2000}
        editable={!isDisabled}
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: accentColor },
          (isDisabled || !text.trim()) && styles.sendDisabled,
        ]}
        onPress={handleSend}
        disabled={isDisabled || !text.trim()}
        activeOpacity={0.8}
      >
        {isDisabled ? (
          <ActivityIndicator size="small" color={COLORS.bgDeep} />
        ) : (
          <Ionicons name="arrow-up" size={20} color={COLORS.bgDeep} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.bgMid,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    color: COLORS.textWhite,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});
