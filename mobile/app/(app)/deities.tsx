import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useDeityStore } from '../../src/store/deityStore';
import { useUserStore } from '../../src/store/userStore';
import { DeityCard } from '../../src/components/deity/DeityCard';
import { COLORS, SPACING, TYPE } from '../../src/theme';

export default function DeitiesScreen() {
  const { deities, fetchDeities, isLoading, selectDeity } = useDeityStore();
  const { user, logout } = useUserStore();

  useEffect(() => {
    fetchDeities();
  }, []);

  const handleSelectDeity = (deityId: string) => {
    selectDeity(deityId);
    router.push(`/(app)/chat/${deityId}`);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <LinearGradient colors={[COLORS.bgDeep, COLORS.bgMid, COLORS.bgDeep]} style={styles.gradient}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.om}>ॐ</Text>
          <Text style={styles.greeting}>
            Namaste, {user?.displayName ?? 'Devotee'}
          </Text>
          <Text style={styles.subheading}>
            Choose your divine guide
          </Text>
        </View>

        {/* Deities */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.gold} style={styles.loader} />
        ) : (
          deities.map((deity) => (
            <DeityCard
              key={deity.id}
              deity={deity}
              onPress={() => handleSelectDeity(deity.id)}
            />
          ))
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    padding: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  om: {
    fontSize: 48,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },
  greeting: {
    ...TYPE.heading2,
    textAlign: 'center',
  },
  subheading: {
    ...TYPE.body,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  loader: { marginTop: SPACING.xxl },
  logoutRow: { alignItems: 'center', marginTop: SPACING.xl },
  logoutText: { color: COLORS.textMuted, fontSize: 14 },
});
