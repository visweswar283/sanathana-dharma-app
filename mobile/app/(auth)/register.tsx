import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { COLORS, SPACING, RADIUS, TYPE } from '../../src/theme';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error } = useUserStore();

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !displayName.trim()) return;
    try {
      await register(email.trim(), displayName.trim(), password);
      router.replace('/(app)/deities');
    } catch {
      // error shown via store state
    }
  };

  return (
    <LinearGradient colors={[COLORS.bgDeep, COLORS.bgMid]} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.om}>ॐ</Text>
            <Text style={styles.title}>Begin Your Journey</Text>
            <Text style={styles.subtitle}>Create your sacred account</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Devotee's name"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.bgDeep} />
              ) : (
                <Text style={styles.buttonText}>Jai Shri Ram — Begin</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => router.back()}
            >
              <Text style={styles.link}>Already a devotee? Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  header: { alignItems: 'center', marginBottom: SPACING.xxl },
  om: { fontSize: 64, color: COLORS.gold, marginBottom: SPACING.sm },
  title: { ...TYPE.heading1, textAlign: 'center' },
  subtitle: { ...TYPE.body, color: COLORS.textMuted, marginTop: SPACING.xs },
  form: { width: '100%', maxWidth: 380, alignSelf: 'center' },
  label: { ...TYPE.bodySmall, color: COLORS.textCream, marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    color: COLORS.textWhite,
    fontSize: 16,
  },
  error: { color: COLORS.error, fontSize: 13, marginTop: SPACING.sm },
  button: {
    backgroundColor: COLORS.saffron,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.bgDeep, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  linkRow: { alignItems: 'center', marginTop: SPACING.md },
  link: { color: COLORS.gold, fontSize: 14 },
});
