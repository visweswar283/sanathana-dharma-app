import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { EmotionalState } from '../../types/chat';
import { COLORS, SPACING, RADIUS } from '../../theme';

const EMOTIONS: Array<{ state: EmotionalState; emoji: string; label: string }> = [
  { state: 'grief', emoji: '😔', label: 'Sad' },
  { state: 'anxiety', emoji: '😰', label: 'Anxious' },
  { state: 'anger', emoji: '😤', label: 'Frustrated' },
  { state: 'motivation-seeking', emoji: '⚡', label: 'Unmotivated' },
  { state: 'spiritual-longing', emoji: '🙏', label: 'Seeking' },
  { state: 'neutral', emoji: '💬', label: 'Just talk' },
];

interface EmotionPickerProps {
  selected: EmotionalState | null;
  onSelect: (state: EmotionalState) => void;
}

export function EmotionPicker({ selected, onSelect }: EmotionPickerProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.prompt}>How are you feeling?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {EMOTIONS.map(({ state, emoji, label }) => {
          const isSelected = selected === state;
          return (
            <TouchableOpacity
              key={state}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelect(state)}
              activeOpacity={0.75}
            >
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  prompt: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  row: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: 5,
  },
  chipSelected: {
    backgroundColor: 'rgba(255,107,0,0.2)',
    borderColor: COLORS.saffron,
  },
  emoji: { fontSize: 16 },
  label: { color: COLORS.textMuted, fontSize: 13 },
  labelSelected: { color: COLORS.saffron, fontWeight: '600' },
});
