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
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import { Card, SectionHeader, PrimaryButton, OutlineButton } from '../components/UIComponents';
import { getInitials } from '../utils/helpers';

export default function ProfileScreen({ navigation }) {
  const { user, logout, savePreferences } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || 'India',
  });
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState(user?.photoUri || null);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.6, aspect: [1, 1], allowsEditing: true });
    if (!res.canceled) setAvatarUri(res.assets[0].uri);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Name cannot be empty.'); return; }
    setSaving(true);
    try {
      await savePreferences({ ...form, photoUri: avatarUri });
      setEditMode(false);
    } catch {
      Alert.alert('Error', 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const INFO_ROWS = [
    { key: 'email', label: 'Email', icon: 'mail-outline' },
    { key: 'phone', label: 'Phone', icon: 'call-outline' },
    { key: 'city', label: 'City', icon: 'location-outline' },
    { key: 'country', label: 'Country', icon: 'globe-outline' },
    { key: 'role', label: 'Role', icon: 'briefcase-outline', value: user?.isAdmin ? 'Admin' : 'Employee' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <TouchableOpacity onPress={editMode ? pickAvatar : undefined} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials(user?.name || user?.username || 'U')}</Text>
              </View>
            )}
            {editMode && (
              <View style={styles.avatarEdit}>
                <Ionicons name="camera" size={16} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.name}>{user?.name || user?.username}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <View style={[styles.rolePill, user?.isAdmin ? { backgroundColor: COLORS.primaryDim } : { backgroundColor: COLORS.successDim }]}>
            <Text style={[styles.roleText, user?.isAdmin ? { color: COLORS.primary } : { color: COLORS.success }]}>
              {user?.isAdmin ? '👑 Admin' : '👤 Employee'}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Actions row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setEditMode(!editMode)}>
              <Ionicons name={editMode ? 'close-circle-outline' : 'pencil-outline'} size={20} color={COLORS.primary} />
              <Text style={styles.actionLabel}>{editMode ? 'Cancel' : 'Edit Profile'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('SOS')}>
              <Ionicons name="alert-circle-outline" size={20} color={COLORS.danger} />
              <Text style={[styles.actionLabel, { color: COLORS.danger }]}>SOS Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.textMuted} />
              <Text style={[styles.actionLabel, { color: COLORS.textMuted }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Info / Edit Form */}
          <Card style={styles.card}>
            <SectionHeader title="👤 Profile Information" />
            {editMode ? (
              <>
                {[
                  { key: 'name', label: 'Full Name', type: 'default' },
                  { key: 'email', label: 'Email', type: 'email-address' },
                  { key: 'phone', label: 'Phone', type: 'phone-pad' },
                  { key: 'city', label: 'City', type: 'default' },
                  { key: 'country', label: 'Country', type: 'default' },
                ].map((field) => (
                  <View key={field.key} style={{ marginBottom: SPACING.sm }}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <TextInput
                      style={styles.input}
                      value={form[field.key]}
                      onChangeText={(v) => setForm((p) => ({ ...p, [field.key]: v }))}
                      keyboardType={field.type}
                      autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                ))}
                <PrimaryButton title="Save Changes" onPress={handleSave} loading={saving} />
              </>
            ) : (
              INFO_ROWS.map((row) => {
                const val = row.value || user?.[row.key];
                if (!val) return null;
                return (
                  <View key={row.key} style={styles.infoRow}>
                    <Ionicons name={row.icon} size={16} color={COLORS.textMuted} />
                    <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                      <Text style={styles.infoLabel}>{row.label}</Text>
                      <Text style={styles.infoVal}>{val}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </Card>

          {/* Driver / Travel preferences card */}
          {user?.preferences && (
            <Card style={styles.card}>
              <SectionHeader title="✈️ Travel Preferences" />
              {user.preferences.travelFrequency && (
                <View style={styles.infoRow}>
                  <Ionicons name="airplane-outline" size={16} color={COLORS.textMuted} />
                  <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Text style={styles.infoLabel}>Travel Frequency</Text>
                    <Text style={styles.infoVal}>{user.preferences.travelFrequency}</Text>
                  </View>
                </View>
              )}
              {user.preferences.budget && (
                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={16} color={COLORS.textMuted} />
                  <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Text style={styles.infoLabel}>Budget</Text>
                    <Text style={styles.infoVal}>{user.preferences.budget}</Text>
                  </View>
                </View>
              )}
              {user.preferences.interests?.length > 0 && (
                <View style={{ marginTop: SPACING.sm }}>
                  <Text style={styles.infoLabel}>Interests</Text>
                  <View style={styles.interestRow}>
                    {user.preferences.interests.map((i) => (
                      <View key={i} style={styles.interestChip}>
                        <Text style={styles.interestText}>{i}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          )}

          {/* Document Upload (placeholder) */}
          <Card style={styles.card}>
            <SectionHeader title="📄 Documents" subtitle="Upload your license and ID documents" />
            <OutlineButton
              title="📎 Upload Document"
              onPress={() => Alert.alert('Feature', 'Document upload will be available in v2')}
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
  hero: {
    backgroundColor: COLORS.surface, padding: SPACING.xl,
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatarWrap: { position: 'relative', marginBottom: SPACING.md },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { color: COLORS.white, fontWeight: '800', fontSize: 28 },
  avatarEdit: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.surface,
  },
  name: { color: COLORS.textPrimary, fontWeight: '800', fontSize: FONTS.xl, marginBottom: 2 },
  username: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginBottom: SPACING.sm },
  rolePill: {
    paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  roleText: { fontWeight: '700', fontSize: FONTS.sm },
  content: { padding: SPACING.base },
  actionsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  actionBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm,
    alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  actionLabel: { color: COLORS.primary, fontSize: FONTS.xs, fontWeight: '700', textAlign: 'center' },
  card: { marginBottom: SPACING.md },
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { color: COLORS.textMuted, fontSize: FONTS.xs },
  infoVal: { color: COLORS.textPrimary, fontWeight: '600', fontSize: FONTS.sm, marginTop: 1 },
  fieldLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.sm,
    color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, fontSize: FONTS.base,
  },
  interestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.xs },
  interestChip: {
    backgroundColor: COLORS.primaryDim, paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  interestText: { color: COLORS.primary, fontSize: FONTS.xs, fontWeight: '600' },
});
