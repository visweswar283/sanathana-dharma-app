import { TouchableOpacity, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../theme';

interface VoiceToggleProps {
  isEnabled: boolean;
  isAvailable: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  onToggle: () => void;
  accentColor: string;
}

export function VoiceToggle({
  isEnabled,
  isAvailable,
  isSpeaking,
  isLoading,
  onToggle,
  accentColor,
}: VoiceToggleProps) {
  if (!isAvailable) {
    // TTS not configured — show grayed out icon with no action
    return (
      <View style={styles.wrapper}>
        <Ionicons name="volume-mute" size={20} color={COLORS.textMuted} />
      </View>
    );
  }

  const iconColor = isEnabled ? accentColor : COLORS.textMuted;

  return (
    <TouchableOpacity onPress={onToggle} style={styles.wrapper} activeOpacity={0.7}>
      {isLoading ? (
        <ActivityIndicator size="small" color={accentColor} />
      ) : isSpeaking ? (
        <View style={styles.speakingRow}>
          <Ionicons name="volume-high" size={20} color={accentColor} />
          <Text style={[styles.speakingLabel, { color: accentColor }]}>Speaking</Text>
        </View>
      ) : (
        <Ionicons
          name={isEnabled ? 'volume-medium' : 'volume-mute-outline'}
          size={20}
          color={iconColor}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: SPACING.sm,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  speakingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speakingLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
