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
  const [validationError, setValidationError] = useState('');
  const { register, isLoading, error } = useUserStore();

  const handleRegister = async () => {
    setValidationError('');

    if (!displayName.trim()) {
      setValidationError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setValidationError('Please enter your email');
      return;
    }
    if (!email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    try {
      await register(email.trim(), displayName.trim(), password);
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
              onChangeText={(t) => { setDisplayName(t); setValidationError(''); }}
              placeholder="e.g. Rama Dasa"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
              returnKeyType="next"
            />

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
              placeholder="At least 8 characters"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            {displayError ? (
              <Text style={styles.error}>{displayError}</Text>
            ) : null}

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
              style={styles.backRow}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>← Already have an account? Sign in</Text>
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
  backRow: { alignItems: 'center', marginTop: SPACING.lg },
  backText: { color: COLORS.gold, fontSize: 14 },
});
