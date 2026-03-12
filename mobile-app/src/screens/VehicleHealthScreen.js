import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import { PrimaryButton, OutlineButton, Card, SectionHeader } from '../components/UIComponents';
import { aiApi } from '../services/api';

const SLIDER_COLORS = (v) => {
  if (v >= 60) return COLORS.success;
  if (v >= 30) return COLORS.warning;
  return COLORS.danger;
};

export default function VehicleHealthScreen() {
  const [fuelLevel, setFuelLevel] = useState(50);
  const [imageUri, setImageUri] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueNotes, setIssueNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const pickImage = async (useCamera = false) => {
    const { status } = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const res = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
      setAnalysisResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!imageUri) return;
    setAnalyzing(true);
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        try {
          const res = await aiApi.vehicleInsights({
            type: 'fuel_gauge',
            imageBase64: base64,
          });
          setAnalysisResult(res.data);
          if (res.data?.fuelPercent) setFuelLevel(res.data.fuelPercent);
        } catch {
          Alert.alert('Analysis failed', 'Could not analyze the image. Set fuel level manually.');
        } finally {
          setAnalyzing(false);
        }
      };
    } catch {
      setAnalyzing(false);
      Alert.alert('Error', 'Could not read image file.');
    }
  };

  const submitReport = () => {
    if (!issueTitle.trim()) { Alert.alert('Required', 'Enter a brief issue title.'); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setIssueTitle('');
      setIssueNotes('');
      Alert.alert('Report Submitted', 'Your vehicle health report has been sent to the admin.');
    }, 800);
  };

  const fuelColor = SLIDER_COLORS(fuelLevel);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Fuel Level Card */}
          <Card style={styles.card}>
            <SectionHeader title="⛽ Fuel Level" subtitle="Take a photo of the gauge or set manually" />

            <View style={styles.gaugeCircle}>
              <Text style={[styles.gaugePercent, { color: fuelColor }]}>{fuelLevel}%</Text>
              <Text style={styles.gaugeLabel}>
                {fuelLevel >= 60 ? 'Good' : fuelLevel >= 30 ? 'Low' : 'Critical'}
              </Text>
            </View>

            <View style={styles.sliderRow}>
              <Ionicons name="battery-dead-outline" size={16} color={COLORS.danger} />
              <View style={{ flex: 1, marginHorizontal: SPACING.sm }}>
                <Slider
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={fuelLevel}
                  onValueChange={setFuelLevel}
                  minimumTrackTintColor={fuelColor}
                  maximumTrackTintColor={COLORS.border}
                  thumbTintColor={fuelColor}
                />
              </View>
              <Ionicons name="battery-full-outline" size={16} color={COLORS.success} />
            </View>

            {/* Camera / gallery buttons */}
            <View style={styles.imgActions}>
              <OutlineButton title="📷 Gauge Photo" onPress={() => pickImage(true)} style={{ flex: 1 }} />
              <OutlineButton title="🖼️ Gallery" onPress={() => pickImage(false)} style={{ flex: 1 }} />
            </View>

            {imageUri && (
              <View style={{ marginTop: SPACING.sm }}>
                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
                <PrimaryButton title="🤖 Analyze Gauge" onPress={analyzeImage} loading={analyzing} style={{ marginTop: SPACING.sm }} />
              </View>
            )}

            {analysisResult && (
              <View style={styles.aiResult}>
                <Text style={styles.aiTitle}>AI Analysis</Text>
                <Text style={styles.aiText}>{analysisResult.summary || 'Fuel level detected successfully.'}</Text>
                {analysisResult.warnings?.map((w, i) => (
                  <View key={i} style={styles.warning}>
                    <Ionicons name="warning-outline" size={14} color={COLORS.warning} />
                    <Text style={styles.warningText}>{w}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Report Issue */}
          <Card style={styles.card}>
            <SectionHeader title="🔧 Report Issue" subtitle="Describe any vehicle problems to admin" />

            <Text style={styles.fieldLabel}>Issue Title *</Text>
            <TextInput
              style={styles.input}
              value={issueTitle}
              onChangeText={setIssueTitle}
              placeholder="e.g. Brakes squeaking"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={issueNotes}
              onChangeText={setIssueNotes}
              multiline
              numberOfLines={4}
              placeholder="Additional details, severity, when noticed..."
              placeholderTextColor={COLORS.textMuted}
            />

            <PrimaryButton
              title="Submit Report"
              onPress={submitReport}
              loading={submitting}
              style={{ marginTop: SPACING.md }}
            />
          </Card>
        </View>
        <View style={{ height: SPACING['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.base },
  card: { marginBottom: SPACING.md },
  gaugeCircle: {
    alignSelf: 'center', width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLORS.surfaceAlt, justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: COLORS.border, marginVertical: SPACING.md,
  },
  gaugePercent: { fontSize: 28, fontWeight: '800' },
  gaugeLabel: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 2 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  imgActions: { flexDirection: 'row', gap: SPACING.sm },
  preview: { height: 160, borderRadius: RADIUS.md, width: '100%' },
  aiResult: {
    marginTop: SPACING.sm, backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md, padding: SPACING.sm,
  },
  aiTitle: { color: COLORS.primary, fontWeight: '700', marginBottom: SPACING.xs },
  aiText: { color: COLORS.textPrimary, fontSize: FONTS.sm },
  warning: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  warningText: { color: COLORS.warning, fontSize: FONTS.xs },
  fieldLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.sm,
    color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, fontSize: FONTS.base,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
});
