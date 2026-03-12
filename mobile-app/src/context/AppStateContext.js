import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateId, generateInviteCode } from '../utils/helpers';

const AppStateContext = createContext(null);

// ─── Seed data (mirrors web app SharedStateProvider) ─────────────────────────
const SEED_PACKAGES = [
  {
    id: 'pkg-1',
    name: 'Goa Beach Bliss',
    destination: 'Goa, India',
    status: 'active',
    pricePerPerson: 8500,
    durationDays: 5,
    organizerName: 'Arun',
    inviteCode: 'GOA001',
    members: ['Priya', 'Ravi'],
    tripType: 'friends',
    travelStyle: 'budget',
    maxMembers: 10,
    maxBudget: 85000,
    startDate: '2026-04-01',
    endDate: '2026-04-05',
  },
  {
    id: 'pkg-2',
    name: 'Kerala Backwaters',
    destination: 'Alleppey, Kerala',
    status: 'planning',
    pricePerPerson: 12000,
    durationDays: 7,
    organizerName: 'Arun',
    inviteCode: 'KER002',
    members: [],
    tripType: 'family',
    travelStyle: 'comfort',
    maxMembers: 8,
    maxBudget: 96000,
    startDate: '2026-05-10',
    endDate: '2026-05-17',
  },
  {
    id: 'pkg-3',
    name: 'Rajasthan Heritage Tour',
    destination: 'Jaipur, Rajasthan',
    status: 'completed',
    pricePerPerson: 15000,
    durationDays: 6,
    organizerName: 'Priya',
    inviteCode: 'RAJ003',
    members: ['Arun'],
    tripType: 'friends',
    travelStyle: 'luxury',
    maxMembers: 6,
    maxBudget: 90000,
    startDate: '2026-02-01',
    endDate: '2026-02-07',
  },
];

const SEED_EXPENSES = [
  { id: 'exp-1', type: 'Travel', amount: 3500, date: '2026-02-01', tourId: 'pkg-3', description: 'Train tickets', submittedBy: 'Arun', status: 'approved' },
  { id: 'exp-2', type: 'Hotel', amount: 6000, date: '2026-02-02', tourId: 'pkg-3', description: 'Hotel 2 nights', submittedBy: 'Priya', status: 'approved' },
  { id: 'exp-3', type: 'Food', amount: 1200, date: '2026-02-03', tourId: 'pkg-1', description: 'Team dinner', submittedBy: 'Ravi', status: 'pending' },
];

const SEED_TRIPS = [
  {
    id: 'trip-1',
    packageId: 'pkg-1',
    packageName: 'Goa Beach Bliss',
    organizerName: 'Arun',
    source: 'Chennai',
    destination: 'Goa',
    startDate: '2026-04-01',
    endDate: '2026-04-05',
    status: 'planned',
    expenses: [],
    members: ['Arun', 'Priya', 'Ravi'],
  },
  {
    id: 'trip-2',
    packageId: 'pkg-3',
    packageName: 'Rajasthan Heritage Tour',
    organizerName: 'Priya',
    source: 'Delhi',
    destination: 'Jaipur',
    startDate: '2026-02-01',
    endDate: '2026-02-07',
    status: 'completed',
    expenses: ['exp-1', 'exp-2'],
    members: ['Arun', 'Priya'],
  },
];

export function AppStateProvider({ children }) {
  const [packages, setPackages] = useState(SEED_PACKAGES);
  const [expenses, setExpenses] = useState(SEED_EXPENSES);
  const [trips, setTrips] = useState(SEED_TRIPS);

  // ── Tour packages ──────────────────────────────────────────────────────────
  const addPackage = useCallback((data) => {
    const pkg = {
      id: generateId(),
      inviteCode: generateInviteCode(),
      members: [],
      ...data,
    };
    setPackages((prev) => [pkg, ...prev]);
    return pkg;
  }, []);

  const updatePackage = useCallback((id, data) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  }, []);

  const deletePackage = useCallback((id) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const joinTour = useCallback((inviteCode, username) => {
    const pkg = packages.find(
      (p) => p.inviteCode.toUpperCase() === inviteCode.toUpperCase()
    );
    if (!pkg) throw new Error('Invalid invite code');
    if (pkg.members.includes(username)) throw new Error('Already a member');
    updatePackage(pkg.id, { members: [...pkg.members, username] });
    return pkg;
  }, [packages, updatePackage]);

  const addPhotoToTour = useCallback((tourId, photoUri) => {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === tourId
          ? { ...p, gallery: [...(p.gallery || []), photoUri] }
          : p
      )
    );
  }, []);

  // ── Expenses ───────────────────────────────────────────────────────────────
  const addExpense = useCallback((data) => {
    const expense = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      ...data,
    };
    setExpenses((prev) => [expense, ...prev]);
    return expense;
  }, []);

  const updateExpenseStatus = useCallback((id, status) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  }, []);

  // ── Trips ──────────────────────────────────────────────────────────────────
  const addTrip = useCallback((data) => {
    const trip = { id: generateId(), status: 'planned', expenses: [], members: [], ...data };
    setTrips((prev) => [trip, ...prev]);
    return trip;
  }, []);

  const updateTripStatus = useCallback((id, status) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        packages,
        expenses,
        trips,
        addPackage,
        updatePackage,
        deletePackage,
        joinTour,
        addPhotoToTour,
        addExpense,
        updateExpenseStatus,
        addTrip,
        updateTripStatus,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
};
