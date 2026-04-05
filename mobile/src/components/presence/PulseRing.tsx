import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface PulseRingProps {
  size: number;
  color: string;
  delay: number;
  isSpeaking: boolean;
}

/**
 * A single animated ring that expands outward and fades.
 * Multiple rings staggered by delay create a ripple / divine-aura effect.
 *
 * Idle:    slow 3 s cycle — gentle divine presence
 * Speaking: fast 1.2 s cycle — Hanuma's voice radiating outward
 */
export function PulseRing({ size, color, delay, isSpeaking }: PulseRingProps) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const duration = isSpeaking ? 1200 : 3000;

    animRef.current?.stop();
    scale.setValue(0.3);
    opacity.setValue(0);

    animRef.current = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: isSpeaking ? 0.7 : 0.45,
              duration: duration * 0.3,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: duration * 0.7,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    );

    animRef.current.start();

    return () => { animRef.current?.stop(); };
  }, [isSpeaking, delay]);

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
});
