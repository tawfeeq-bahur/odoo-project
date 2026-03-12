import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import { Card, SectionHeader, PrimaryButton, OutlineButton } from '../components/UIComponents';

const STORAGE_KEY = '@sos_contacts';
const MAX_CONTACTS = 3;

const HARDCODED = [
  { id: 'police', name: 'Police', number: '100', icon: 'shield-outline', color: COLORS.primary, fixed: true },
  { id: 'ambulance', name: 'Ambulance', number: '108', icon: 'medkit-outline', color: COLORS.danger, fixed: true },
  { id: 'fire', name: 'Fire Brigade', number: '101', icon: 'flame-outline', color: COLORS.warning, fixed: true },
];

const isValidMobile = (n) => /^[6-9]\d{9}$/.test(n.replace(/\s/g, ''));

export default function SOSScreen() {
  const [contacts, setContacts] = useState([]);
  const [addVisible, setAddVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', number: '', relation: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setContacts(JSON.parse(data));
    });
  }, []);

  const persistContacts = async (list) => {
    setContacts(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const handleCall = (number, name) => {
    Alert.alert(`Call ${name}`, `Dial ${number}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: `📞 Call`,
        onPress: () => Linking.openURL(`tel:${number}`),
      },
    ]);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: '', number: '', relation: '' });
    setAddVisible(true);
  };

  const openEdit = (contact) => {
    setEditTarget(contact);
    setForm({ name: contact.name, number: contact.number, relation: contact.relation || '' });
    setAddVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Enter contact name.'); return; }
    if (!isValidMobile(form.number)) {
      Alert.alert('Invalid Number', 'Enter a valid 10-digit Indian mobile number starting with 6-9.');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        const updated = contacts.map((c) =>
          c.id === editTarget.id ? { ...c, ...form } : c
        );
        await persistContacts(updated);
      } else {
        if (contacts.length >= MAX_CONTACTS) {
          Alert.alert('Limit reached', `You can only add up to ${MAX_CONTACTS} emergency contacts.`);
          return;
        }
        const newContact = { id: Date.now().toString(), ...form };
        await persistContacts([...contacts, newContact]);
      }
      setAddVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Remove Contact', 'Delete this emergency contact?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => persistContacts(contacts.filter((c) => c.id !== id)),
      },
    ]);
  };

  const renderFixed = ({ item }) => (
    <TouchableOpacity onPress={() => handleCall(item.number, item.name)} activeOpacity={0.8}>
      <Card style={[styles.contactCard, styles.fixedCard]}>
        <View style={[styles.contactIcon, { backgroundColor: `${item.color}22` }]}>
          <Ionicons name={item.icon} size={26} color={item.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={[styles.contactNumber, { color: item.color }]}>{item.number}</Text>
        </View>
        <View style={[styles.callBtn, { backgroundColor: item.color }]}>
          <Ionicons name="call" size={20} color={COLORS.white} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderPersonal = ({ item }) => (
    <Card style={styles.contactCard}>
      <View style={styles.contactIcon}>
        <Ionicons name="person-circle-outline" size={26} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactNumber}>{item.number}</Text>
        {item.relation && <Text style={styles.relation}>{item.relation}</Text>}
      </View>
      <View style={styles.personalActions}>
        <TouchableOpacity style={[styles.callBtn]} onPress={() => handleCall(item.number, item.name)}>
          <Ionicons name="call" size={18} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Ionicons name="pencil-outline" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* SOS banner */}
      <View style={styles.sosBanner}>
        <Ionicons name="warning" size={28} color={COLORS.danger} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sosBannerTitle}>Emergency SOS</Text>
          <Text style={styles.sosBannerSub}>Tap any contact to call immediately</Text>
        </View>
      </View>

      <FlatList
        data={[]}
        // Use ListHeaderComponent for all sections to leverage FlatList scroll
        ListHeaderComponent={
          <View style={styles.content}>
            {/* Emergency services */}
            <SectionHeader title="🚨 Emergency Services" style={{ marginBottom: SPACING.sm }} />
            {HARDCODED.map((item) => (
              <View key={item.id}>{renderFixed({ item })}</View>
            ))}

            {/* Personal contacts */}
            <View style={styles.personalHeader}>
              <SectionHeader title={`📞 My Emergency Contacts (${contacts.length}/${MAX_CONTACTS})`} />
              {contacts.length < MAX_CONTACTS && (
                <TouchableOpacity style={styles.addContactBtn} onPress={openAdd}>
                  <Ionicons name="add" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>

            {contacts.length === 0 ? (
              <View style={styles.emptyPersonal}>
                <Ionicons name="person-add-outline" size={36} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No personal emergency contacts added yet.</Text>
                <TouchableOpacity onPress={openAdd} style={styles.addFirstBtn}>
                  <Text style={styles.addFirstText}>+ Add Contact</Text>
                </TouchableOpacity>
              </View>
            ) : (
              contacts.map((item) => (
                <View key={item.id}>{renderPersonal({ item })}</View>
              ))
            )}
          </View>
        }
        keyExtractor={() => 'header'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SPACING['3xl'] }}
      />

      {/* Add/Edit Modal */}
      <Modal visible={addVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editTarget ? 'Edit Contact' : 'Add Emergency Contact'}</Text>
              <TouchableOpacity onPress={() => setAddVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            {[
              { key: 'name', label: 'Full Name', type: 'default', placeholder: 'Contact name' },
              { key: 'number', label: 'Mobile Number', type: 'phone-pad', placeholder: '10-digit mobile number' },
              { key: 'relation', label: 'Relation (optional)', type: 'default', placeholder: 'e.g. Parent, Spouse' },
            ].map((f) => (
              <View key={f.key} style={{ marginBottom: SPACING.sm }}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[f.key]}
                  onChangeText={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                  keyboardType={f.type}
                  placeholder={f.placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize={f.key === 'number' ? 'none' : 'words'}
                />
              </View>
            ))}
            <View style={styles.modalActions}>
              <OutlineButton title="Cancel" onPress={() => setAddVisible(false)} style={{ flex: 1 }} />
              <PrimaryButton title="Save" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  sosBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: `${COLORS.danger}22`, borderBottomWidth: 1, borderBottomColor: `${COLORS.danger}44`,
    padding: SPACING.md,
  },
  sosBannerTitle: { color: COLORS.danger, fontWeight: '800', fontSize: FONTS.base },
  sosBannerSub: { color: COLORS.textSecondary, fontSize: FONTS.xs },
  content: { padding: SPACING.base },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  fixedCard: { borderWidth: 1, borderColor: COLORS.border },
  contactIcon: {
    width: 50, height: 50, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDim, justifyContent: 'center', alignItems: 'center',
  },
  contactName: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.base },
  contactNumber: { color: COLORS.primary, fontWeight: '600', fontSize: FONTS.sm, marginTop: 2 },
  relation: { color: COLORS.textMuted, fontSize: FONTS.xs, marginTop: 2 },
  callBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center',
  },
  personalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addContactBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center',
  },
  personalActions: { flexDirection: 'row', gap: SPACING.xs, alignItems: 'center' },
  editBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center', alignItems: 'center',
  },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: `${COLORS.danger}22`,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyPersonal: {
    alignItems: 'center', paddingVertical: SPACING.xl,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, marginTop: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm,
  },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sm, textAlign: 'center' },
  addFirstBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm, borderRadius: RADIUS.full,
  },
  addFirstText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'], padding: SPACING.lg, paddingBottom: SPACING['2xl'],
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: FONTS.lg },
  fieldLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.sm,
    color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, fontSize: FONTS.base,
  },
  modalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
});
