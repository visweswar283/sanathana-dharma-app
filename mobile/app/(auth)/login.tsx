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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, isLoading, error } = useUserStore();

  const handleLogin = async () => {
    setValidationError('');

    if (!email.trim()) {
      setValidationError('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setValidationError('Please enter your password');
      return;
    }

    try {
      await login(email.trim(), password);
      router.replace('/(app)/deities');
    } catch {
      // error shown via store state
    }
  };

  const displayError = validationError || error;

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.om}>ॐ</Text>
            <Text style={styles.title}>Sanathana Dharma</Text>
            <Text style={styles.subtitle}>Seek the divine within</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => { setEmail(t); setValidationError(''); }}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(t) => { setPassword(t); setValidationError(''); }}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            {displayError ? (
              <Text style={styles.error}>{displayError}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.bgDeep} />
              ) : (
                <Text style={styles.buttonText}>Enter the Sacred Space</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register CTA — more prominent */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>Create New Account</Text>
            </TouchableOpacity>

            <Text style={styles.registerHint}>
              New devotee? Register to begin your journey
            </Text>
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
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  om: { fontSize: 72, color: COLORS.gold, marginBottom: SPACING.sm },
  title: { ...TYPE.heading1, textAlign: 'center' },
  subtitle: { ...TYPE.body, color: COLORS.textMuted, marginTop: SPACING.xs },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  label: {
    ...TYPE.bodySmall,
    color: COLORS.textCream,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    color: COLORS.textWhite,
    fontSize: 16,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.saffron,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: COLORS.bgDeep,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: { color: COLORS.textMuted, fontSize: 13 },
  registerButton: {
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
  },
  registerButtonText: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '600',
  },
  registerHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
