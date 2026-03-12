import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_USERS } from '../utils/constants';
import { generateId } from '../utils/helpers';

const AuthContext = createContext(null);

// ─── Initial demo users (mirror web app mock accounts) ────────────────────────
const INITIAL_USERS = [
  {
    id: '1',
    username: 'Arun',
    firstName: 'Arun',
    lastName: 'Kumar',
    email: 'arun@tourjet.com',
    phone: '9876543210',
    city: 'Chennai',
    country: 'India',
    role: 'admin',
    password: '123',
  },
  {
    id: '2',
    username: 'Priya',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya@tourjet.com',
    phone: '9876543211',
    city: 'Mumbai',
    country: 'India',
    role: 'employee',
    password: '123',
  },
  {
    id: '3',
    username: 'Ravi',
    firstName: 'Ravi',
    lastName: 'Patel',
    email: 'ravi@tourjet.com',
    phone: '9876543212',
    city: 'Delhi',
    country: 'India',
    role: 'employee',
    password: '123',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState(null);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // simulate network
    const found = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );
    setIsLoading(false);
    if (!found) {
      throw new Error('Invalid username or password');
    }
    const { password: _pw, ...safeUser } = found;
    setUser(safeUser);
    await AsyncStorage.setItem('tourjet_user', JSON.stringify(safeUser));
    return safeUser;
  }, [users]);

  // ── signup ─────────────────────────────────────────────────────────────────
  const signup = useCallback(async (data) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    if (users.find((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
      setIsLoading(false);
      throw new Error('Username already taken');
    }
    const newUser = {
      id: generateId(),
      ...data,
      role: 'employee',
    };
    setUsers((prev) => [...prev, newUser]);
    const { password: _pw, ...safeUser } = newUser;
    setUser(safeUser);
    await AsyncStorage.setItem('tourjet_user', JSON.stringify(safeUser));
    setIsLoading(false);
    return safeUser;
  }, [users]);

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.multiRemove(['tourjet_user', 'tourjet_token']);
  }, []);

  // ── savePreferences ─────────────────────────────────────────────────────────
  const savePreferences = useCallback(async (prefs) => {
    setPreferences(prefs);
    await AsyncStorage.setItem('tourjet_preferences', JSON.stringify(prefs));
  }, []);

  // ── restore session on app start ────────────────────────────────────────────
  const restoreSession = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('tourjet_user');
      if (stored) setUser(JSON.parse(stored));
      const storedPrefs = await AsyncStorage.getItem('tourjet_preferences');
      if (storedPrefs) setPreferences(JSON.parse(storedPrefs));
    } catch { /* ignore */ }
  }, []);

  React.useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, isLoading, preferences, login, signup, logout, savePreferences }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
