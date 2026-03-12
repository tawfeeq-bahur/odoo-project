import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/AppStateContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/colors';
import { SectionHeader, EmptyState, Card } from '../components/UIComponents';

export default function MembersScreen({ navigation }) {
  const { user } = useAuth();
  const { packages, updatePackage } = useAppState();
  const [selectedTourId, setSelectedTourId] = useState(null);

  const myTours = packages.filter((p) => p.organizerName === user?.username);
  const selectedTour = myTours.find((p) => p.id === selectedTourId) || myTours[0];

  if (myTours.length === 0) {
    return (
      <View style={styles.flex}>
        <EmptyState
          icon="📋"
          title="No tours organized"
          subtitle="Create a tour from the Home screen to manage members"
        />
      </View>
    );
  }

  const members = [selectedTour?.organizerName, ...(selectedTour?.members || [])];

  const toggleAttendance = (memberName) => {
    if (!selectedTour) return;
    const absent = selectedTour?.absentees || [];
    const updated = absent.includes(memberName)
      ? absent.filter((m) => m !== memberName)
      : [...absent, memberName];
    updatePackage(selectedTour.id, { absentees: updated });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tour selector */}
        <View style={styles.tourPicker}>
          <Text style={styles.pickerLabel}>Select Tour</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {myTours.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.tourChip, (selectedTour?.id === t.id) && styles.tourChipActive]}
                onPress={() => setSelectedTourId(t.id)}
              >
                <Text style={[styles.tourChipText, (selectedTour?.id === t.id) && styles.tourChipTextActive]}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedTour && (
          <View style={styles.content}>
            {/* Invite section */}
            <Card>
              <Text style={styles.cardTitle}>Invite via Code</Text>
              <View style={styles.inviteRow}>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={selectedTour.inviteCode}
                    size={110}
                    color={COLORS.primary}
                    backgroundColor={COLORS.surface}
                  />
                </View>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeLabel}>Invite Code</Text>
                  <Text style={styles.inviteCode}>{selectedTour.inviteCode}</Text>
                  <Text style={styles.codeHint}>Share this code or scan the QR</Text>
                </View>
              </View>
            </Card>

            {/* Members list */}
            <SectionHeader title={`Members (${members.length}/${selectedTour.maxMembers})`} />
            {members.map((m, i) => {
              const isAbsent = selectedTour?.absentees?.includes(m);
              const isOrganizer = i === 0;
              return (
                <View key={i} style={styles.memberRow}>
                  <View style={[styles.avatar, isOrganizer && styles.avatarOrganizer]}>
                    <Text style={styles.avatarText}>{m.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{m}</Text>
                    <Text style={styles.memberRole}>{isOrganizer ? 'Organizer' : 'Member'}</Text>
                  </View>
                  {selectedTour.tripType === 'school' && !isOrganizer && (
                    <TouchableOpacity
                      style={[styles.attendanceBtn, !isAbsent && styles.presentBtn]}
                      onPress={() => toggleAttendance(m)}
                    >
                      <Ionicons
                        name={isAbsent ? 'close-circle' : 'checkmark-circle'}
                        size={20}
                        color={isAbsent ? COLORS.danger : COLORS.success}
                      />
                      <Text style={[styles.attendanceText, { color: isAbsent ? COLORS.danger : COLORS.success }]}>
                        {isAbsent ? 'Absent' : 'Present'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            {members.length < (selectedTour.maxMembers || 999) && (
              <View style={styles.slotInfo}>
                <Ionicons name="add-circle-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.slotText}>
                  {(selectedTour.maxMembers || 0) - members.length} spots remaining
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1, backgroundColor: COLORS.background },
  tourPicker: { padding: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pickerLabel: { color: COLORS.textSecondary, fontSize: FONTS.xs, fontWeight: '700', marginBottom: SPACING.sm },
  tourChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, marginRight: SPACING.sm,
  },
  tourChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tourChipText: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600' },
  tourChipTextActive: { color: COLORS.white },
  content: { padding: SPACING.base },
  cardTitle: { fontSize: FONTS.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  inviteRow: { flexDirection: 'row', gap: SPACING.lg, alignItems: 'center' },
  qrContainer: { padding: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.md },
  codeBlock: { flex: 1 },
  codeLabel: { color: COLORS.textSecondary, fontSize: FONTS.xs },
  inviteCode: { fontSize: FONTS['2xl'], fontWeight: '900', color: COLORS.primary, letterSpacing: 6, marginVertical: SPACING.xs },
  codeHint: { color: COLORS.textMuted, fontSize: FONTS.xs },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  avatarOrganizer: { backgroundColor: COLORS.primary },
  avatarText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.base },
  memberInfo: { flex: 1 },
  memberName: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.sm },
  memberRole: { color: COLORS.textMuted, fontSize: FONTS.xs },
  attendanceBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  presentBtn: {},
  attendanceText: { fontSize: FONTS.xs, fontWeight: '700' },
  slotInfo: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    justifyContent: 'center', padding: SPACING.md,
  },
  slotText: { color: COLORS.textMuted, fontSize: FONTS.xs },
});
