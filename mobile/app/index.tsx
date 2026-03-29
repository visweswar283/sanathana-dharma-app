import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUserStore } from '../src/store/userStore';
import { COLORS } from '../src/theme';

export default function Index() {
  const token = useUserStore((s) => s.token);

  useEffect(() => {
    // Give the store a moment to load from AsyncStorage
    const timer = setTimeout(() => {
      if (token) {
        router.replace('/(app)/deities');
      } else {
        router.replace('/(auth)/login');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.gold} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
