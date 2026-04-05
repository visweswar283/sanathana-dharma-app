import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PulseRing } from './PulseRing';
import { COLORS, SPACING, TYPE } from '../../theme';

const { width: SCREEN_W } = Dimensions.get('window');

const SYMBOL_SIZE = 140;
const RING_BASE = SYMBOL_SIZE + 20;

interface DeityPresenceProps {
  deityName: string;
  sanskritName: string;
  accentColor: string;
  themeColor: string;
  lastMessage: string;
  isStreaming: boolean;
  isSpeaking: boolean;
  isLoading: boolean; // TTS loading
}

/**
 * Full-screen sacred visualization for Presence Mode.
 *
 * Visual states:
 *  Idle      — slow golden rings, OM symbol gently glowing
 *  Streaming — symbol pulses while Hanuma composes his response
 *  Speaking  — fast bright rings, symbol brightens
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
  // Symbol glow/scale when active
  const symbolScale = useRef(new Animated.Value(1)).current;
  const symbolGlow = useRef(new Animated.Value(0.8)).current;
  const symbolAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    symbolAnim.current?.stop();

    if (isSpeaking) {
      // Breathing pulse while speaking
      symbolAnim.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(symbolScale, { toValue: 1.08, duration: 600, useNativeDriver: true }),
            Animated.timing(symbolGlow, { toValue: 1, duration: 600, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(symbolScale, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(symbolGlow, { toValue: 0.8, duration: 600, useNativeDriver: true }),
          ]),
        ])
      );
    } else if (isStreaming || isLoading) {
      // Subtle shimmer while composing / fetching audio
      symbolAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(symbolGlow, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(symbolGlow, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        ])
      );
    } else {
      // Idle — slow peaceful breathing
      symbolAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(symbolGlow, { toValue: 1, duration: 2500, useNativeDriver: true }),
          Animated.timing(symbolGlow, { toValue: 0.6, duration: 2500, useNativeDriver: true }),
        ])
      );
      symbolScale.setValue(1);
    }

    symbolAnim.current.start();
    return () => { symbolAnim.current?.stop(); };
  }, [isSpeaking, isStreaming, isLoading]);

  const stateLabel = isSpeaking
    ? 'Speaking...'
    : isLoading
    ? 'Preparing voice...'
    : isStreaming
    ? 'Responding...'
    : 'Present with you';

  // Rings: 5 concentric, staggered 600ms apart
  const ringDelays = [0, 600, 1200, 1800, 2400];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.bgDeep, '#1A0500', COLORS.bgMid]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Deity name */}
      <View style={styles.nameRow}>
        <Text style={[styles.sanskritName, { color: accentColor }]}>{sanskritName}</Text>
        <Text style={styles.deityName}>{deityName}</Text>
      </View>

      {/* Sacred symbol + rings */}
      <View style={styles.symbolArea}>
        {ringDelays.map((delay, i) => (
          <PulseRing
            key={i}
            size={RING_BASE + i * 55}
            color={i % 2 === 0 ? accentColor : themeColor}
            delay={isSpeaking ? delay * 0.4 : delay}
            isSpeaking={isSpeaking}
          />
        ))}

        {/* OM symbol */}
        <Animated.View
          style={[
            styles.symbolContainer,
            {
              transform: [{ scale: symbolScale }],
              opacity: symbolGlow,
              borderColor: accentColor,
              shadowColor: accentColor,
            },
          ]}
        >
          <Text style={[styles.om, { color: accentColor }]}>ॐ</Text>
        </Animated.View>
      </View>

      {/* State label */}
      <Text style={[styles.stateLabel, { color: themeColor }]}>{stateLabel}</Text>

      {/* Last message */}
      {lastMessage.length > 0 && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText} numberOfLines={4}>
            {lastMessage}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
  },
  sanskritName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  deityName: {
    ...TYPE.caption,
    color: COLORS.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  symbolArea: {
    width: RING_BASE + 4 * 55 + 80,
    height: RING_BASE + 4 * 55 + 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolContainer: {
    width: SYMBOL_SIZE,
    height: SYMBOL_SIZE,
    borderRadius: SYMBOL_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  om: {
    fontSize: 72,
    fontWeight: '300',
    lineHeight: 100,
  },
  stateLabel: {
    marginTop: SPACING.xl,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  messageBox: {
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    maxWidth: SCREEN_W - SPACING.xl * 2,
  },
  messageText: {
    ...TYPE.body,
    color: COLORS.textCream,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.85,
  },
});
