import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import { PrimaryButton, Card, SectionHeader } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['General Inquiry', 'Technical Issue', 'Billing', 'Trip Problem', 'Feature Request', 'Other'];
const PRIORITY = ['Low', 'Medium', 'High', 'Critical'];

export default function SupportScreen() {
  const { user } = useAuth();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState('Medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [showCatList, setShowCatList] = useState(false);
  const [showPriList, setShowPriList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!subject.trim()) { Alert.alert('Required', 'Please enter a subject.'); return; }
    if (!description.trim()) { Alert.alert('Required', 'Please describe your issue.'); return; }
    if (!email.trim()) { Alert.alert('Required', 'Please enter your email address.'); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubject('');
    setDescription('');
    setCategory(CATEGORIES[0]);
    setPriority('Medium');
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Ticket Submitted!</Text>
          <Text style={styles.successSub}>
            Our support team will respond within 24 hours at{'\n'}{email}
          </Text>
          <Text style={styles.ticketId}>
            Ticket #{Math.floor(100000 + Math.random() * 900000)}
          </Text>
          <PrimaryButton title="New Ticket" onPress={handleReset} style={styles.newTicketBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card>
            <SectionHeader
              title="🎫 Contact Support"
              subtitle="Describe your issue and we'll get back to you shortly"
            />

            {/* Email */}
            <Text style={styles.fieldLabel}>Your Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
              placeholderTextColor={COLORS.textMuted}
            />

            {/* Category */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>Category</Text>
            <TouchableOpacity style={styles.picker} onPress={() => { setShowCatList(!showCatList); setShowPriList(false); }}>
              <Text style={styles.pickerText}>{category}</Text>
              <Ionicons name={showCatList ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
            {showCatList && (
              <View style={styles.dropdown}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity key={c} style={styles.dItem} onPress={() => { setCategory(c); setShowCatList(false); }}>
                    <Text style={[styles.dText, category === c && styles.dTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Priority */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITY.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priChip, priority === p && styles.priChipActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.priText, priority === p && styles.priTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Subject */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>Subject *</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Brief summary of your issue"
              placeholderTextColor={COLORS.textMuted}
            />

            {/* Description */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              placeholder="Please provide as much detail as possible including steps to reproduce, screenshots, or error messages..."
              placeholderTextColor={COLORS.textMuted}
            />

            <PrimaryButton
              title="Submit Support Ticket"
              onPress={handleSubmit}
              loading={submitting}
              style={{ marginTop: SPACING.md }}
            />
          </Card>

          {/* FAQ Quick Links */}
          <Card style={{ marginTop: SPACING.md }}>
            <SectionHeader title="❓ Quick Help" />
            {[
              { q: 'How to join a tour?', a: 'Go to Home → Join Tour and enter the 6-digit code.' },
              { q: 'How to log an expense?', a: 'Go to Trips tab → Scanner and scan your receipt.' },
              { q: 'How to add emergency contacts?', a: 'Go to Profile tab → SOS Contacts.' },
              { q: 'Where to find my odometer logs?', a: 'Fleet tab → Odometer (admin visible).' },
            ].map((item, i) => (
              <View key={i} style={styles.faqItem}>
                <Text style={styles.faqQ}>{item.q}</Text>
                <Text style={styles.faqA}>{item.a}</Text>
              </View>
            ))}
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
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  successIcon: { marginBottom: SPACING.md },
  successTitle: { color: COLORS.textPrimary, fontSize: FONTS['2xl'], fontWeight: '800', marginBottom: SPACING.sm },
  successSub: { color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.md, lineHeight: 22 },
  ticketId: {
    color: COLORS.primary, fontWeight: '700', fontSize: FONTS.lg,
    backgroundColor: COLORS.surface, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, marginBottom: SPACING.xl, overflow: 'hidden',
  },
  newTicketBtn: { width: 200 },
  fieldLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.sm,
    color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border,
    fontSize: FONTS.base,
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  picker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  pickerText: { color: COLORS.textPrimary, fontSize: FONTS.base },
  dropdown: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, overflow: 'hidden', marginTop: 2, marginBottom: SPACING.xs,
  },
  dItem: { padding: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dText: { color: COLORS.textPrimary, fontSize: FONTS.sm },
  dTextActive: { color: COLORS.primary, fontWeight: '700' },
  priorityRow: { flexDirection: 'row', gap: SPACING.xs },
  priChip: {
    flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
  },
  priChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  priText: { color: COLORS.textSecondary, fontSize: FONTS.xs, fontWeight: '600' },
  priTextActive: { color: COLORS.white },
  faqItem: { paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  faqQ: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.sm, marginBottom: 2 },
  faqA: { color: COLORS.textSecondary, fontSize: FONTS.xs },
});
