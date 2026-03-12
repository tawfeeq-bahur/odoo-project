import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/colors';
import AppTextInput from '../components/AppTextInput';
import { PrimaryButton, OutlineButton } from '../components/UIComponents';
import { isValidEmail, isValidIndianMobile } from '../utils/helpers';

export default function SignupScreen({ navigation }) {
  const { signup, isLoading } = useAuth();
  const [form, setForm] = useState({
    username: '', password: '', firstName: '', lastName: '',
    email: '', phone: '', city: '', country: 'India', additionalInfo: '',
  });
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Required';
    if (form.password.length < 3) e.password = 'Min 3 characters';
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (form.email && !isValidEmail(form.email)) e.email = 'Invalid email';
    if (form.phone && !isValidIndianMobile(form.phone)) e.phone = 'Invalid phone';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setServerError('');
    try {
      await signup({ ...form, photo });
      navigation.replace('Onboarding');
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
          </View>

          {/* Photo picker */}
          <TouchableOpacity style={styles.photoPicker} onPress={pickPhoto}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={30} color={COLORS.textMuted} />
                <Text style={styles.photoHint}>Upload Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {serverError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{serverError}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.section}>Account Credentials</Text>
            <AppTextInput label="Username *" value={form.username} onChangeText={set('username')} placeholder="Choose a username" error={errors.username} />
            <AppTextInput label="Password *" value={form.password} onChangeText={set('password')} placeholder="Choose a password" secureTextEntry error={errors.password} />

            <Text style={styles.section}>Personal Info</Text>
            <View style={styles.row}>
              <AppTextInput label="First Name *" value={form.firstName} onChangeText={set('firstName')} placeholder="First name" error={errors.firstName} style={styles.halfInput} />
              <AppTextInput label="Last Name" value={form.lastName} onChangeText={set('lastName')} placeholder="Last name" style={styles.halfInput} />
            </View>
            <AppTextInput label="Email" value={form.email} onChangeText={set('email')} placeholder="your@email.com" keyboardType="email-address" error={errors.email} />
            <AppTextInput label="Phone" value={form.phone} onChangeText={set('phone')} placeholder="10-digit mobile" keyboardType="phone-pad" error={errors.phone} />
            <View style={styles.row}>
              <AppTextInput label="City" value={form.city} onChangeText={set('city')} placeholder="City" style={styles.halfInput} autoCapitalize="words" />
              <AppTextInput label="Country" value={form.country} onChangeText={set('country')} placeholder="Country" style={styles.halfInput} autoCapitalize="words" />
            </View>
            <AppTextInput label="Additional Info" value={form.additionalInfo} onChangeText={set('additionalInfo')} placeholder="Anything else we should know?" multiline numberOfLines={3} />
          </View>

          <PrimaryButton title="Create Account" onPress={handleSignup} loading={isLoading} style={styles.submitBtn} />
          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.goBack()}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>Sign In</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { padding: SPACING.xl, paddingBottom: SPACING['3xl'] },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  backBtn: { marginRight: SPACING.md, padding: SPACING.xs },
  title: { fontSize: FONTS['2xl'], fontWeight: '800', color: COLORS.textPrimary },
  photoPicker: { alignSelf: 'center', marginBottom: SPACING.xl },
  photoPreview: { width: 90, height: 90, borderRadius: 45 },
  photoPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.surface, borderWidth: 2,
    borderColor: COLORS.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  photoHint: { color: COLORS.textMuted, fontSize: FONTS.xs, marginTop: 4 },
  errorBox: { backgroundColor: COLORS.dangerBg, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  errorText: { color: COLORS.danger, fontSize: FONTS.sm },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.base, marginBottom: SPACING.base },
  section: { fontSize: FONTS.sm, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.md, marginTop: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: SPACING.sm },
  halfInput: { flex: 1 },
  submitBtn: { marginBottom: SPACING.md },
  loginLink: { alignItems: 'center' },
  loginText: { color: COLORS.textSecondary, fontSize: FONTS.sm },
  loginBold: { color: COLORS.primary, fontWeight: '700' },
});
