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
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import { PrimaryButton, OutlineButton, Card, SectionHeader } from '../components/UIComponents';
import { EXPENSE_TYPES } from '../utils/constants';
import { generateId } from '../utils/helpers';
import { aiApi } from '../services/api';

const TABS = ['AI Scanner', 'Manual Entry'];

export default function ScannerScreen() {
  const { packages, addExpense } = useAppState();
  const [activeTab, setActiveTab] = useState(0);
  // AI Scanner state
  const [imageUri, setImageUri] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [parsed, setParsed] = useState(null);
  // Manual form state
  const [type, setType] = useState(EXPENSE_TYPES[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [tour, setTour] = useState(packages[0]?.id || '');
  const [showTypeList, setShowTypeList] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      setParsed(null);
    }
  };

  const handleScan = async () => {
    if (!imageUri) { Alert.alert('No image', 'Please capture or select a receipt image.'); return; }
    setScanning(true);
    try {
      // Read image as base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        try {
          const res = await aiApi.parseExpense(base64);
          setParsed(res.data);
          if (res.data) {
            setType(res.data.category || EXPENSE_TYPES[0]);
            setAmount(res.data.amount?.toString() || '');
            setDescription(res.data.description || '');
          }
        } catch {
          Alert.alert('Scan Failed', 'Could not parse the receipt. Please fill manually.');
        } finally {
          setScanning(false);
        }
      };
    } catch {
      setScanning(false);
      Alert.alert('Error', 'Could not read the image.');
    }
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) { Alert.alert('Invalid amount', 'Enter a valid number.'); return; }
    if (!description.trim()) { Alert.alert('Missing description', 'Please describe the expense.'); return; }
    setSubmitting(true);
    try {
      addExpense({
        id: generateId(),
        type,
        amount: parseFloat(amount),
        description: description.trim(),
        tourId: tour,
        date: new Date().toISOString(),
        status: 'pending',
        imageUri,
      });
      Alert.alert('Expense Added', 'Your expense has been submitted for approval.');
      setAmount('');
      setDescription('');
      setImageUri(null);
      setParsed(null);
    } catch {
      Alert.alert('Error', 'Failed to submit expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* AI Scanner tab */}
          {activeTab === 0 && (
            <>
              <Card style={styles.card}>
                <SectionHeader title="📷 Scan Receipt" subtitle="Capture or upload a receipt to auto-fill details" />

                <View style={styles.imageBox}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.previewImg} resizeMode="contain" />
                  ) : (
                    <View style={styles.imgPlaceholder}>
                      <Ionicons name="receipt-outline" size={48} color={COLORS.textMuted} />
                      <Text style={styles.phText}>No receipt selected</Text>
                    </View>
                  )}
                </View>

                <View style={styles.imgActions}>
                  <OutlineButton title="📷 Camera" onPress={() => pickImage(true)} style={{ flex: 1 }} />
                  <OutlineButton title="🖼️ Gallery" onPress={() => pickImage(false)} style={{ flex: 1 }} />
                </View>

                {imageUri && (
                  <PrimaryButton
                    title="🤖 Scan with AI"
                    onPress={handleScan}
                    loading={scanning}
                    style={{ marginTop: SPACING.sm }}
                  />
                )}
              </Card>

              {parsed && (
                <Card style={styles.parsedCard}>
                  <Text style={styles.parsedTitle}>✅ Detected Details</Text>
                  <View style={styles.parsedRow}>
                    <Text style={styles.parsedLabel}>Amount</Text>
                    <Text style={styles.parsedVal}>₹{parsed.amount}</Text>
                  </View>
                  <View style={styles.parsedRow}>
                    <Text style={styles.parsedLabel}>Category</Text>
                    <Text style={styles.parsedVal}>{parsed.category}</Text>
                  </View>
                  <View style={styles.parsedRow}>
                    <Text style={styles.parsedLabel}>Description</Text>
                    <Text style={styles.parsedVal}>{parsed.description}</Text>
                  </View>
                  <Text style={styles.parsedNote}>Details have been filled in the Manual Entry tab. Switch to review and submit.</Text>
                </Card>
              )}
            </>
          )}

          {/* Manual Entry */}
          {activeTab === 1 && (
            <Card style={styles.card}>
              <SectionHeader title="📝 Manual Expense Entry" />

              {/* Type picker */}
              <Text style={styles.fieldLabel}>Expense Type</Text>
              <TouchableOpacity style={styles.picker} onPress={() => setShowTypeList(!showTypeList)}>
                <Text style={styles.pickerText}>{type}</Text>
                <Ionicons name={showTypeList ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
              {showTypeList && (
                <View style={styles.dropdown}>
                  {EXPENSE_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={styles.dropdownItem}
                      onPress={() => { setType(t); setShowTypeList(false); }}
                    >
                      <Text style={[styles.dropdownText, type === t && { color: COLORS.primary, fontWeight: '700' }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Amount */}
              <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>Amount (₹)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
              />

              {/* Tour selector */}
              <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>Tour</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.sm }}>
                {packages.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.tourChip, tour === p.id && styles.tourChipActive]}
                    onPress={() => setTour(p.id)}
                  >
                    <Text style={[styles.tourChipText, tour === p.id && { color: COLORS.white }]} numberOfLines={1}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Description */}
              <Text style={[styles.fieldLabel, { marginTop: SPACING.xs }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                placeholder="Describe the expense..."
                placeholderTextColor={COLORS.textMuted}
              />

              {imageUri && (
                <View style={styles.thumbRow}>
                  <Image source={{ uri: imageUri }} style={styles.thumb} />
                  <Text style={styles.thumbLabel}>Receipt attached</Text>
                </View>
              )}

              <PrimaryButton
                title="Submit Expense"
                onPress={handleSubmit}
                loading={submitting}
                style={{ marginTop: SPACING.md }}
              />
            </Card>
          )}
        </View>
        <View style={{ height: SPACING['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  tabRow: {
    flexDirection: 'row', margin: SPACING.base, marginBottom: 0,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: FONTS.sm },
  tabTextActive: { color: COLORS.white },
  content: { padding: SPACING.base },
  card: { marginBottom: SPACING.md },
  imageBox: {
    height: 200, borderRadius: RADIUS.lg, overflow: 'hidden',
    backgroundColor: COLORS.surfaceAlt, marginBottom: SPACING.sm,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  previewImg: { width: '100%', height: '100%' },
  imgPlaceholder: { alignItems: 'center', gap: SPACING.xs },
  phText: { color: COLORS.textMuted, fontSize: FONTS.sm },
  imgActions: { flexDirection: 'row', gap: SPACING.sm },
  parsedCard: { borderWidth: 1, borderColor: COLORS.success },
  parsedTitle: { color: COLORS.success, fontWeight: '700', marginBottom: SPACING.sm },
  parsedRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  parsedLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm },
  parsedVal: { color: COLORS.textPrimary, fontWeight: '600', fontSize: FONTS.sm },
  parsedNote: { color: COLORS.textMuted, fontSize: FONTS.xs, marginTop: SPACING.sm, fontStyle: 'italic' },
  fieldLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.sm,
    color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border,
    fontSize: FONTS.base, marginBottom: SPACING.xs,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  picker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xs,
  },
  pickerText: { color: COLORS.textPrimary, fontSize: FONTS.base },
  dropdown: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: SPACING.sm,
  },
  dropdownItem: { padding: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownText: { color: COLORS.textPrimary, fontSize: FONTS.sm },
  tourChip: {
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceAlt,
    marginRight: SPACING.xs, borderWidth: 1, borderColor: COLORS.border, maxWidth: 140,
  },
  tourChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tourChipText: { color: COLORS.textSecondary, fontSize: FONTS.xs },
  thumbRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  thumb: { width: 48, height: 48, borderRadius: RADIUS.sm },
  thumbLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm },
});
