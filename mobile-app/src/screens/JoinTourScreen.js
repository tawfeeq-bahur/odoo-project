import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/AppStateContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/colors';
import { PrimaryButton } from '../components/UIComponents';

export default function JoinTourScreen({ navigation }) {
  const { user } = useAuth();
  const { joinTour } = useAppState();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleJoin = () => {
    if (code.trim().length !== 6) {
      setError('Invite code must be 6 characters');
      return;
    }
    setError('');
    try {
      const tour = joinTour(code.trim(), user?.username);
      setSuccess(true);
      Alert.alert('Joined! 🎉', `You joined "${tour.name}"`, [
        { text: 'View Tour', onPress: () => navigation.replace('TourDetail', { tourId: tour.id }) },
        { text: 'Go Home', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.container}>
          <View style={styles.iconBox}>
            <Text style={styles.iconEmoji}>🔗</Text>
          </View>
          <Text style={styles.title}>Join a Tour</Text>
          <Text style={styles.subtitle}>
            Enter the 6-character invite code shared by the tour organizer
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.codeInputWrapper}>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={(t) => {
                setCode(t.toUpperCase().slice(0, 6));
                setError('');
              }}
              placeholder="XXXXXX"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              keyboardType="default"
              textAlign="center"
            />
          </View>

          <Text style={styles.hint}>
            {code.length}/6 characters
          </Text>

          <PrimaryButton
            title="Join Tour"
            onPress={handleJoin}
            disabled={code.length !== 6}
            style={styles.btn}
          />

          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING['2xl'] },
  iconBox: {
    width: 80, height: 80, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl,
  },
  iconEmoji: { fontSize: 38 },
  title: { fontSize: FONTS['3xl'], fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.sm, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 20 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.dangerBg, padding: SPACING.md,
    borderRadius: RADIUS.md, marginBottom: SPACING.md, alignSelf: 'stretch',
  },
  errorText: { color: COLORS.danger, fontSize: FONTS.sm, flex: 1 },

  codeInputWrapper: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOW.md,
    marginBottom: SPACING.sm,
  },
  codeInput: {
    fontSize: FONTS['4xl'],
    fontWeight: '900',
    color: COLORS.primary,
    paddingVertical: SPACING.xl,
    letterSpacing: 14,
    textAlign: 'center',
  },

  hint: { color: COLORS.textMuted, fontSize: FONTS.xs, marginBottom: SPACING.xl },

  btn: { alignSelf: 'stretch', marginBottom: SPACING.lg },
  backLink: { padding: SPACING.sm },
  backText: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600' },
});
