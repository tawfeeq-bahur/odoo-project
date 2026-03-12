import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/colors';
import AppTextInput from '../components/AppTextInput';
import { PrimaryButton } from '../components/UIComponents';

export default function LoginScreen({ navigation }) {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }
    setError('');
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Brand */}
          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>✈️</Text>
            </View>
            <Text style={styles.appName}>TourJet</Text>
            <Text style={styles.tagline}>AI‑Powered Tourism Management</Text>
          </View>

          {/* Login Card */}
          <View style={[styles.card, SHADOW.md]}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to continue</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <AppTextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              style={styles.input}
            />
            <AppTextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPass}
              rightIcon={
                <Ionicons
                  name={showPass ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.textMuted}
                />
              }
              onRightIconPress={() => setShowPass(!showPass)}
              style={styles.input}
            />

            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginBtn}
            />

            <TouchableOpacity
              style={styles.signupLink}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.signupText}>
                Don't have an account?{' '}
                <Text style={styles.signupBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo accounts hint */}
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Accounts</Text>
            <Text style={styles.demoRow}>👤 Arun / 123  (Admin)</Text>
            <Text style={styles.demoRow}>👤 Priya / 123  (Employee)</Text>
            <Text style={styles.demoRow}>👤 Ravi / 123   (Employee)</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: SPACING.xl, justifyContent: 'center' },

  brand: { alignItems: 'center', marginBottom: SPACING['2xl'] },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoIcon: { fontSize: 34 },
  appName: { fontSize: FONTS['3xl'], fontWeight: '800', color: COLORS.textPrimary },
  tagline: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginTop: 4 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.base,
  },
  cardTitle: { fontSize: FONTS['2xl'], fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  cardSubtitle: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginBottom: SPACING.lg },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.dangerBg,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  errorText: { color: COLORS.danger, fontSize: FONTS.sm, flex: 1 },
  input: { marginBottom: SPACING.md },

  loginBtn: { marginTop: SPACING.sm },

  signupLink: { marginTop: SPACING.lg, alignItems: 'center' },
  signupText: { color: COLORS.textSecondary, fontSize: FONTS.sm },
  signupBold: { color: COLORS.primary, fontWeight: '700' },

  demoBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  demoTitle: { color: COLORS.textSecondary, fontSize: FONTS.xs, fontWeight: '700', marginBottom: SPACING.xs },
  demoRow: { color: COLORS.textMuted, fontSize: FONTS.xs, lineHeight: 20 },
});
