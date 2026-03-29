import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Deity } from '../../types/deity';
import { COLORS, SPACING, RADIUS, TYPE } from '../../theme';

interface DeityCardProps {
  deity: Deity;
  onPress: () => void;
}

export function DeityCard({ deity, onPress }: DeityCardProps) {
  const isLocked = !deity.isAvailable;

  return (
    <TouchableOpacity
      style={[styles.wrapper, isLocked && styles.locked]}
      onPress={isLocked ? undefined : onPress}
      activeOpacity={isLocked ? 1 : 0.85}
    >
      <LinearGradient
        colors={
          isLocked
            ? ['#1A1A1A', '#2A2A2A']
            : [deity.themeColor + '33', deity.themeColor + '11']
        }
        style={styles.card}
      >
        {/* Deity initial / icon placeholder */}
        <View style={[styles.avatar, { borderColor: isLocked ? '#444' : deity.themeColor }]}>
          <Text style={[styles.avatarText, { color: isLocked ? '#555' : deity.accentColor }]}>
            {deity.sanskritName.charAt(0)}
          </Text>
        </View>

        <Text style={[styles.name, isLocked && styles.lockedText]}>
          {deity.displayName}
        </Text>
        <Text style={[styles.sanskrit, isLocked && styles.lockedText]}>
          {deity.sanskritName}
        </Text>
        <Text style={[styles.description, isLocked && styles.lockedText]} numberOfLines={3}>
          {deity.shortDescription}
        </Text>

        {isLocked && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Phase {deity.phase}</Text>
          </View>
        )}

        {!isLocked && (
          <View style={[styles.ctaRow]}>
            <Text style={[styles.cta, { color: deity.accentColor }]}>
              Seek Blessings →
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  locked: { opacity: 0.5 },
  card: {
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  avatarText: { fontSize: 28, fontWeight: '700' },
  name: { ...TYPE.heading2, marginBottom: 2 },
  sanskrit: { ...TYPE.sanskrit, fontSize: 14, marginBottom: SPACING.sm },
  description: { ...TYPE.bodySmall, color: COLORS.textMuted, lineHeight: 20 },
  lockedText: { color: '#555' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginTop: SPACING.sm,
  },
  badgeText: { color: '#888', fontSize: 11, fontWeight: '600' },
  ctaRow: { marginTop: SPACING.sm },
  cta: { fontSize: 14, fontWeight: '600' },
});
