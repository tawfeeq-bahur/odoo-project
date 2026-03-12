import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { aiApi } from '../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import {
  PrimaryButton,
  OutlineButton,
  Card,
  LoadingSpinner,
  ErrorMessage,
} from '../components/UIComponents';
import { SUPPORTED_LANGUAGES } from '../utils/constants';
import { fileToBase64 } from '../utils/helpers';

export default function TransliterationScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [showLangPicker, setShowLangPicker] = useState(false);

  const pickImage = async (useCamera = false) => {
    const { status } = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', `Please allow ${useCamera ? 'camera' : 'photo library'} access.`);
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleExtract = async () => {
    if (!imageUri) {
      Alert.alert('No image', 'Please select an image first.');
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    try {
      const base64 = await fileToBase64(imageUri);
      if (!base64) throw new Error('Could not read image');
      const res = await aiApi.translate([base64], targetLanguage);
      // Using the transliteration approach — fallback to translate result
      setResult(res.data?.translations?.[0] || 'Could not extract text from image');
    } catch (err) {
      setError(err.message || 'Failed to extract text');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) {
      Clipboard.setString(result);
      Alert.alert('Copied', 'Text copied to clipboard');
    }
  };

  const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Image area */}
          <View style={styles.imageBox}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.placeholderText}>No image selected</Text>
              </View>
            )}
          </View>

          {/* Image actions */}
          <View style={styles.imageActions}>
            <OutlineButton
              title="📷 Camera"
              onPress={() => pickImage(true)}
              style={styles.imgBtn}
            />
            <OutlineButton
              title="🖼️ Gallery"
              onPress={() => pickImage(false)}
              style={styles.imgBtn}
            />
            {imageUri && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => { setImageUri(null); setResult(''); }}>
                <Ionicons name="close-circle" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            )}
          </View>

          {/* Language picker */}
          <TouchableOpacity
            style={styles.langSelector}
            onPress={() => setShowLangPicker(!showLangPicker)}
          >
            <Text style={styles.langLabel}>Target Language</Text>
            <View style={styles.langValue}>
              <Text style={styles.langText}>{selectedLang?.label || 'Select'}</Text>
              <Ionicons name={showLangPicker ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textSecondary} />
            </View>
          </TouchableOpacity>

          {showLangPicker && (
            <View style={styles.langGrid}>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langChip, targetLanguage === lang.code && styles.langChipActive]}
                  onPress={() => { setTargetLanguage(lang.code); setShowLangPicker(false); }}
                >
                  <Text style={[styles.langChipText, targetLanguage === lang.code && styles.langChipTextActive]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <PrimaryButton
            title="🔍 Extract & Transliterate"
            onPress={handleExtract}
            loading={loading}
            disabled={!imageUri}
            style={styles.extractBtn}
          />

          {error ? <ErrorMessage message={error} style={styles.error} /> : null}

          {/* Result */}
          {result && (
            <Card style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Transliterated Text</Text>
                <TouchableOpacity onPress={copyResult}>
                  <Ionicons name="copy-outline" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.resultText}>{result}</Text>
            </Card>
          )}
        </View>

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.base },
  imageBox: {
    height: 220, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl, overflow: 'hidden',
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', gap: SPACING.sm },
  placeholderText: { color: COLORS.textMuted, fontSize: FONTS.sm },
  imageActions: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md, alignItems: 'center' },
  imgBtn: { flex: 1 },
  clearBtn: { padding: SPACING.xs },
  langSelector: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  langLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600' },
  langValue: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  langText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.base },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  langChip: {
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1, borderColor: COLORS.border,
  },
  langChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langChipText: { color: COLORS.textSecondary, fontSize: FONTS.xs },
  langChipTextActive: { color: COLORS.white },
  extractBtn: { marginBottom: SPACING.md },
  error: { marginBottom: SPACING.md },
  resultCard: { borderWidth: 1, borderColor: COLORS.primary },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  resultTitle: { color: COLORS.textPrimary, fontWeight: '700' },
  resultText: { color: COLORS.textPrimary, fontSize: FONTS.base, lineHeight: 26 },
});
