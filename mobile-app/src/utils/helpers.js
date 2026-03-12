import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';
import { STATUS_COLORS } from './constants';

// ─── Date Formatting ──────────────────────────────────────────────────────────
export const formatDate = (date, pattern = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    return format(d, pattern);
  } catch {
    return 'N/A';
  }
};

export const timeAgo = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
};

export const daysRemaining = (endDate) => {
  if (!endDate) return null;
  try {
    const d = typeof endDate === 'string' ? parseISO(endDate) : new Date(endDate);
    return differenceInDays(d, new Date());
  } catch {
    return null;
  }
};

// ─── String Utilities ─────────────────────────────────────────────────────────
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncate = (str, maxLen = 60) => {
  if (!str) return '';
  return str.length > maxLen ? `${str.substring(0, maxLen)}…` : str;
};

export const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
};

export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ─── Currency / Numbers ───────────────────────────────────────────────────────
export const formatCurrency = (amount, currency = '₹') => {
  if (amount == null) return `${currency}0`;
  return `${currency}${Number(amount).toLocaleString('en-IN')}`;
};

export const formatDistance = (km) => {
  if (km == null) return '—';
  return `${Number(km).toFixed(1)} km`;
};

// ─── Status Helpers ───────────────────────────────────────────────────────────
export const getStatusColor = (status) =>
  STATUS_COLORS[status?.toLowerCase()] ?? '#94a3b8';

export const getStatusLabel = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// ─── Validation ───────────────────────────────────────────────────────────────
export const isValidIndianMobile = (phone) =>
  /^[6-9]\d{9}$/.test(phone?.replace(/\s/g, ''));

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ─── Array Utilities ──────────────────────────────────────────────────────────
export const groupBy = (arr, key) =>
  arr.reduce((groups, item) => {
    const group = item[key] || 'Other';
    return { ...groups, [group]: [...(groups[group] || []), item] };
  }, {});

export const sumByKey = (arr, key) =>
  arr.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);

// ─── Image Utilities ──────────────────────────────────────────────────────────
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const fileToBase64 = async (uri) => {
  try {
    const FileSystem = require('expo-file-system');
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
};

// ─── Haversine Distance ───────────────────────────────────────────────────────
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Tour / Expense Aggregators ───────────────────────────────────────────────
export const getTourExpensesTotal = (expenses, tourId) =>
  expenses
    .filter((e) => e.tourId === tourId && e.status === 'approved')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

export const getExpensesByCategory = (expenses) =>
  Object.entries(groupBy(expenses, 'type')).map(([name, items]) => ({
    name,
    total: sumByKey(items, 'amount'),
    count: items.length,
  }));
