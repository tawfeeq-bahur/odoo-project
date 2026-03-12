import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { employeeApi } from '../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import { Card, SectionHeader, LoadingSpinner, EmptyState } from '../components/UIComponents';
import { getInitials, formatDate, formatCurrency } from '../utils/helpers';

export default function EmployeeDetailScreen({ route, navigation }) {
  const employee = route.params?.employee || {};
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!employee.id) return;
      setLoading(true);
      try {
        const res = await employeeApi.getDetails(employee.id);
        const data = res.data;
        if (data?.expenses) setExpenses(data.expenses);
        if (data?.vehicle) setVehicle(data.vehicle);
      } catch {
        // Use demo data — employee already has the main info
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [employee.id]);

  const info = [
    { label: 'Email', value: employee.email, icon: 'mail-outline' },
    { label: 'Phone', value: employee.phone, icon: 'call-outline' },
    { label: 'Role', value: employee.role, icon: 'briefcase-outline' },
    { label: 'City', value: employee.city, icon: 'location-outline' },
    { label: 'Joined', value: formatDate(employee.createdAt || employee.joinDate), icon: 'calendar-outline' },
  ].filter((i) => i.value);

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{getInitials(employee.name)}</Text>
          </View>
          <Text style={styles.name}>{employee.name}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{employee.role || 'Employee'}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Contact info */}
          <Card style={styles.card}>
            <SectionHeader title="📇 Contact Information" />
            {info.map((item) => (
              <View key={item.label} style={styles.infoRow}>
                <Ionicons name={item.icon} size={16} color={COLORS.textMuted} />
                <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoVal}>{item.value}</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Assigned vehicle */}
          {(vehicle || employee.vehicle) && (
            <Card style={styles.card}>
              <SectionHeader title="🚌 Assigned Vehicle" />
              <TouchableOpacity
                style={styles.vehicleCard}
                onPress={() => navigation.navigate('VehicleDetail', { vehicle: vehicle || employee.vehicle })}
              >
                <View style={styles.vehicleIcon}>
                  <Ionicons name="bus" size={24} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleName}>
                    {(vehicle || employee.vehicle).regNumber || (vehicle || employee.vehicle).reg}
                  </Text>
                  <Text style={styles.vehicleModel}>{(vehicle || employee.vehicle).model}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </Card>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{expenses.length}</Text>
              <Text style={styles.statLabel}>Expenses</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: COLORS.warning }]}>
                {formatCurrency(totalExpenses)}
              </Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                {expenses.filter((e) => e.status === 'approved').length}
              </Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
          </View>

          {/* Recent expenses */}
          <Card style={styles.card}>
            <SectionHeader title="💰 Recent Expenses" />
            {loading ? (
              <LoadingSpinner size="small" message="Loading..." />
            ) : expenses.length === 0 ? (
              <EmptyState icon="receipt-outline" title="No expenses" subtitle="No expense records found" compact />
            ) : (
              expenses.slice(0, 5).map((exp, i) => (
                <View key={i} style={styles.expRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.expDesc}>{exp.description || exp.type}</Text>
                    <Text style={styles.expDate}>{formatDate(exp.date)}</Text>
                  </View>
                  <Text style={styles.expAmount}>₹{(exp.amount || 0).toLocaleString()}</Text>
                  <View style={[styles.expStatus, { backgroundColor: exp.status === 'approved' ? COLORS.successDim : COLORS.warningDim }]}>
                    <Text style={[styles.expStatusText, { color: exp.status === 'approved' ? COLORS.success : COLORS.warning }]}>
                      {exp.status || 'pending'}
                    </Text>
                  </View>
                </View>
              ))
            )}
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
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: { color: COLORS.white, fontWeight: '800', fontSize: FONTS['2xl'] },
  name: { color: COLORS.textPrimary, fontWeight: '800', fontSize: FONTS.xl },
  rolePill: {
    marginTop: SPACING.xs, backgroundColor: COLORS.primaryDim,
    paddingHorizontal: SPACING.md, paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  roleText: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sm },
  content: { padding: SPACING.base },
  card: { marginBottom: SPACING.md },
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { color: COLORS.textMuted, fontSize: FONTS.xs },
  infoVal: { color: COLORS.textPrimary, fontWeight: '600', fontSize: FONTS.sm, marginTop: 1 },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  vehicleIcon: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDim, justifyContent: 'center', alignItems: 'center',
  },
  vehicleName: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.base },
  vehicleModel: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 2 },
  statsRow: {
    flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md,
  },
  statBox: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { color: COLORS.textPrimary, fontWeight: '800', fontSize: FONTS.xl },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.xs, marginTop: 2 },
  expRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  expDesc: { color: COLORS.textPrimary, fontSize: FONTS.sm, fontWeight: '600' },
  expDate: { color: COLORS.textMuted, fontSize: FONTS.xs, marginTop: 2 },
  expAmount: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.sm },
  expStatus: { paddingHorizontal: SPACING.xs, paddingVertical: 2, borderRadius: RADIUS.full },
  expStatusText: { fontSize: FONTS.xs, fontWeight: '700' },
});
