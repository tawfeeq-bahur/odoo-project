import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';
import type { TourPackage, Expense, Trip, User, PlaceSearchResult } from '../types';

type AppContextType = {
    user: User | null;
    packages: TourPackage[];
    expenses: Expense[];
    trips: Trip[];
    places: PlaceSearchResult[];
    login: (username: string, password: string) => boolean;
    logout: () => void;
    signup: (username: string, password: string) => boolean;
    addPackage: (pkg: Omit<TourPackage, 'id' | 'lastUpdated' | 'organizerName' | 'inviteCode' | 'gallery' | 'driveLink'>) => void;
    updatePackage: (pkgId: string, updates: Partial<TourPackage>) => void;
    deletePackage: (pkgId: string) => void;
    addExpense: (expense: Omit<Expense, 'id' | 'status' | 'submittedBy'>) => void;
    updateExpenseStatus: (expenseId: string, status: Expense['status']) => void;
    addTrip: (trip: Omit<Trip, 'id' | 'status' | 'expenses' | 'members'>) => void;
    updateTripStatus: (tripId: string, status: Trip['status']) => void;
    joinTour: (inviteCode: string) => boolean;
    addPhotoToTour: (tourId: string, photoUrl: string) => void;
    addPlace: (place: Omit<PlaceSearchResult, 'id' | 'timestamp'>) => void;
    clearPlaces: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};

const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Initial demo data
const initialPackages: TourPackage[] = [
    {
        id: '1',
        name: 'Ooty Hill Station Tour',
        destination: 'Ooty, Tamil Nadu',
        status: 'Ongoing',
        pricePerPerson: 15000,
        durationDays: 3,
        lastUpdated: new Date().toISOString(),
        organizerName: 'Arun',
        inviteCode: generateInviteCode(),
        members: ['Arun', 'Priya', 'Ravi'],
        gallery: [],
        tripType: 'friends',
        travelStyle: 'whole-day',
        maxMembers: 10,
        maxBudget: 150000,
        startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    },
    {
        id: '2',
        name: 'Chennai Heritage Walk',
        destination: 'Chennai, Tamil Nadu',
        status: 'Up-Coming',
        pricePerPerson: 8000,
        durationDays: 2,
        lastUpdated: new Date().toISOString(),
        organizerName: 'Priya',
        inviteCode: generateInviteCode(),
        members: ['Priya', 'Arun'],
        gallery: [],
        tripType: 'family',
        travelStyle: 'day',
        maxMembers: 8,
        maxBudget: 64000,
        startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 12).toISOString(),
    },
];

const initialExpenses: Expense[] = [
    {
        id: 'exp1',
        type: 'Food',
        amount: 5000,
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        tourId: '1',
        description: 'Group Dinner',
        status: 'approved',
        submittedBy: 'Arun',
    },
    {
        id: 'exp2',
        type: 'Travel',
        amount: 12000,
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        tourId: '1',
        description: 'Bus Tickets',
        status: 'approved',
        submittedBy: 'Ravi',
    },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [packages, setPackages] = useState<TourPackage[]>(initialPackages);
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [places, setPlaces] = useState<PlaceSearchResult[]>([]);

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    // Save data when it changes
    useEffect(() => {
        if (user) storage.setUser(user);
    }, [user]);

    useEffect(() => {
        storage.setPackages(packages);
    }, [packages]);

    useEffect(() => {
        storage.setExpenses(expenses);
    }, [expenses]);

    useEffect(() => {
        storage.setTrips(trips);
    }, [trips]);

    useEffect(() => {
        storage.setPlaces(places);
    }, [places]);

    const loadData = async () => {
        const savedUser = await storage.getUser();
        const savedPackages = await storage.getPackages();
        const savedExpenses = await storage.getExpenses();
        const savedTrips = await storage.getTrips();
        const savedPlaces = await storage.getPlaces();

        if (savedUser) setUser(savedUser);
        if (savedPackages.length > 0) setPackages(savedPackages);
        if (savedExpenses.length > 0) setExpenses(savedExpenses);
        if (savedTrips.length > 0) setTrips(savedTrips);
        if (savedPlaces.length > 0) setPlaces(savedPlaces);
    };

    const login = (username: string, password: string): boolean => {
        // Simple demo auth
        if (password === 'password') {
            setUser({ username });
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        storage.removeUser();
    };

    const signup = (username: string, password: string): boolean => {
        if (username && password) {
            setUser({ username });
            return true;
        }
        return false;
    };

    const addPackage = (pkg: Omit<TourPackage, 'id' | 'lastUpdated' | 'organizerName' | 'inviteCode' | 'gallery' | 'driveLink'>) => {
        const newPackage: TourPackage = {
            ...pkg,
            id: Date.now().toString(),
            lastUpdated: new Date().toISOString(),
            organizerName: user?.username || 'Unknown',
            inviteCode: generateInviteCode(),
            gallery: [],
        };
        setPackages([...packages, newPackage]);
    };

    const updatePackage = (pkgId: string, updates: Partial<TourPackage>) => {
        setPackages(packages.map(pkg =>
            pkg.id === pkgId ? { ...pkg, ...updates, lastUpdated: new Date().toISOString() } : pkg
        ));
    };

    const deletePackage = (pkgId: string) => {
        setPackages(packages.filter(pkg => pkg.id !== pkgId));
    };

    const addExpense = (expense: Omit<Expense, 'id' | 'status' | 'submittedBy'>) => {
        const newExpense: Expense = {
            ...expense,
            id: Date.now().toString(),
            status: 'pending',
            submittedBy: user?.username || 'Unknown',
        };
        setExpenses([...expenses, newExpense]);
    };

    const updateExpenseStatus = (expenseId: string, status: Expense['status']) => {
        setExpenses(expenses.map(exp =>
            exp.id === expenseId ? { ...exp, status } : exp
        ));
    };

    const addTrip = (trip: Omit<Trip, 'id' | 'status' | 'expenses' | 'members'>) => {
        const newTrip: Trip = {
            ...trip,
            id: Date.now().toString(),
            status: 'Planned',
            expenses: [],
            members: user ? [user.username] : [],
        };
        setTrips([...trips, newTrip]);
    };

    const updateTripStatus = (tripId: string, status: Trip['status']) => {
        setTrips(trips.map(trip =>
            trip.id === tripId ? { ...trip, status } : trip
        ));
    };

    const joinTour = (inviteCode: string): boolean => {
        const tour = packages.find(pkg => pkg.inviteCode === inviteCode);
        if (tour && user) {
            const members = Array.isArray(tour.members) ? tour.members : tour.members.map(m => m.name);
            if (!members.includes(user.username)) {
                updatePackage(tour.id, {
                    members: [...members, user.username],
                });
                return true;
            }
        }
        return false;
    };

    const addPhotoToTour = (tourId: string, photoUrl: string) => {
        const tour = packages.find(pkg => pkg.id === tourId);
        if (tour) {
            updatePackage(tourId, {
                gallery: [...tour.gallery, photoUrl],
            });
        }
    };

    const addPlace = (place: Omit<PlaceSearchResult, 'id' | 'timestamp'>) => {
        const newPlace: PlaceSearchResult = {
            ...place,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
        };
        setPlaces([...places, newPlace]);
    };

    const clearPlaces = () => {
        setPlaces([]);
    };

    return (
        <AppContext.Provider
            value={{
                user,
                packages,
                expenses,
                trips,
                places,
                login,
                logout,
                signup,
                addPackage,
                updatePackage,
                deletePackage,
                addExpense,
                updateExpenseStatus,
                addTrip,
                updateTripStatus,
                joinTour,
                addPhotoToTour,
                addPlace,
                clearPlaces,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
