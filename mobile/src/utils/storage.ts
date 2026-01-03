import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    USER: '@tourjet_user',
    PACKAGES: '@tourjet_packages',
    EXPENSES: '@tourjet_expenses',
    TRIPS: '@tourjet_trips',
    PLACES: '@tourjet_places',
};

export const storage = {
    // User
    async getUser() {
        const data = await AsyncStorage.getItem(KEYS.USER);
        return data ? JSON.parse(data) : null;
    },
    async setUser(user: any) {
        await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    },
    async removeUser() {
        await AsyncStorage.removeItem(KEYS.USER);
    },

    // Packages
    async getPackages() {
        const data = await AsyncStorage.getItem(KEYS.PACKAGES);
        return data ? JSON.parse(data) : [];
    },
    async setPackages(packages: any[]) {
        await AsyncStorage.setItem(KEYS.PACKAGES, JSON.stringify(packages));
    },

    // Expenses
    async getExpenses() {
        const data = await AsyncStorage.getItem(KEYS.EXPENSES);
        return data ? JSON.parse(data) : [];
    },
    async setExpenses(expenses: any[]) {
        await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
    },

    // Trips
    async getTrips() {
        const data = await AsyncStorage.getItem(KEYS.TRIPS);
        return data ? JSON.parse(data) : [];
    },
    async setTrips(trips: any[]) {
        await AsyncStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
    },

    // Places
    async getPlaces() {
        const data = await AsyncStorage.getItem(KEYS.PLACES);
        return data ? JSON.parse(data) : [];
    },
    async setPlaces(places: any[]) {
        await AsyncStorage.setItem(KEYS.PLACES, JSON.stringify(places));
    },

    // Clear all
    async clearAll() {
        await AsyncStorage.multiRemove(Object.values(KEYS));
    },
};
