import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SacredScene } from './SacredScene';
import { COLORS, SPACING, TYPE } from '../../theme';

const { width: SCREEN_W } = Dimensions.get('window');

interface DeityPresenceProps {
  deityName: string;
  sanskritName: string;
  accentColor: string;
  themeColor: string;
  lastMessage: string;
  isStreaming: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
}

/**
 * Full-screen sacred 3D Presence Mode.
 *
 * Layers (back to front):
 *   1. LinearGradient — deep dark background
 *   2. SacredScene (expo-gl) — 3D mandala, particles, rings, lights
 *   3. Text overlay — deity name, state label, last message
 *
 * The 3D scene reacts to isSpeaking / isStreaming:
 *   Idle     — slow golden ripple, gentle particle drift
 *   Streaming — medium speed, shimmer
 *   Speaking  — fast bright pulse, intense particles
 */
export function DeityPresence({
  deityName,
  sanskritName,
  accentColor,
  themeColor,
  lastMessage,
  isStreaming,
  isSpeaking,
  isLoading,
}: DeityPresenceProps) {
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;

  // Fade in name on mount
  useEffect(() => {
    Animated.timing(nameOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Fade in/out message when it changes
  useEffect(() => {
    if (!lastMessage) return;
    messageOpacity.setValue(0);
    Animated.timing(messageOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [lastMessage]);

  const stateLabel = isSpeaking
    ? 'Speaking...'
    : isLoading
    ? 'Preparing voice...'
    : isStreaming
    ? 'Responding...'
    : 'Present with you';

  return (
    <View style={styles.container}>
      {/* Layer 1 — background gradient */}
      <LinearGradient
        colors={[COLORS.bgDeep, '#120300', COLORS.bgMid]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Layer 2 — 3D sacred scene */}
      <SacredScene isSpeaking={isSpeaking} isStreaming={isStreaming} />

      {/* Layer 3 — text overlay */}
      <View style={styles.overlay} pointerEvents="none">
        {/* Deity name at top */}
        <Animated.View style={[styles.nameRow, { opacity: nameOpacity }]}>
          <Text style={[styles.sanskritName, { color: accentColor }]}>
            {sanskritName}
          </Text>
          <Text style={styles.deityName}>{deityName}</Text>
        </Animated.View>

        {/* Spacer — 3D scene lives in the middle */}
        <View style={styles.spacer} />

        {/* State label */}
        <Text style={[styles.stateLabel, { color: themeColor }]}>
          {stateLabel}
        </Text>

        {/* Last deity message */}
        {lastMessage.length > 0 && (
          <Animated.View style={[styles.messageBox, { opacity: messageOpacity }]}>
            <Text style={styles.messageText} numberOfLines={4}>
              {lastMessage}
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  nameRow: {
    alignItems: 'center',
    zIndex: 10,
  },
  sanskritName: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
    // Subtle text shadow so it reads over the 3D scene
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  deityName: {
    ...TYPE.caption,
    color: COLORS.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  spacer: { flex: 1 },
  stateLabel: {
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: SPACING.md,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  messageBox: {
    marginHorizontal: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    maxWidth: SCREEN_W - SPACING.xl * 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.12)',
    marginBottom: SPACING.sm,
  },
  messageText: {
    ...TYPE.body,
    color: COLORS.textCream,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
});
