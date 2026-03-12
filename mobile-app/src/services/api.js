import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ENDPOINTS } from '../utils/constants';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor — attach auth token ──────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('tourjet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — normalize errors ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── Employees ────────────────────────────────────────────────────────────────
export const employeeApi = {
  getAll: () => api.get(ENDPOINTS.EMPLOYEES),
  getById: (employeeId) =>
    api.get(`${ENDPOINTS.EMPLOYEE_PROFILE}?employeeId=${employeeId}`),
  getDetails: (employeeId) =>
    api.get(`${ENDPOINTS.EMPLOYEE_PROFILE}?employeeId=${employeeId}`),
  create: (data) => api.post(ENDPOINTS.EMPLOYEES, data),
  update: (id, data) => api.put(ENDPOINTS.EMPLOYEES, { id, ...data }),
  delete: (id) => api.delete(`${ENDPOINTS.EMPLOYEES}?id=${id}`),
  getExpenses: (employeeId, status) => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (status) params.append('status', status);
    return api.get(`${ENDPOINTS.EMPLOYEE_EXPENSES}?${params}`);
  },
  createExpense: (data) => api.post(ENDPOINTS.EMPLOYEE_EXPENSES, data),
  updateExpenseStatus: (id, status) =>
    api.put(ENDPOINTS.EMPLOYEE_EXPENSES, { id, status }),
};

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export const vehicleApi = {
  getAll: () => api.get(ENDPOINTS.ADMIN_VEHICLES),
  create: (data) => api.post(ENDPOINTS.ADMIN_VEHICLES, data),
  update: (id, data) => api.put(ENDPOINTS.ADMIN_VEHICLES, { id, ...data }),
  delete: (id) => api.delete(`${ENDPOINTS.ADMIN_VEHICLES}?id=${id}`),
};

// ─── Trips ────────────────────────────────────────────────────────────────────
export const tripApi = {
  getAll: (params = {}) =>
    api.get(ENDPOINTS.ADMIN_TRIPS, { params }),
  create: (data) => api.post(ENDPOINTS.ADMIN_TRIPS, data),
  update: (id, data) => api.put(ENDPOINTS.ADMIN_TRIPS, { id, ...data }),
};

// ─── Routes ───────────────────────────────────────────────────────────────────
export const routeApi = {
  getAll: () => api.get(ENDPOINTS.ROUTES_LIST),
  list: () => api.get(ENDPOINTS.ROUTES_LIST),
  save: (data) => api.post(ENDPOINTS.ROUTES_SAVE, data),
  getLast: () => api.get(ENDPOINTS.ROUTES_LAST),
  deleteAll: () => api.delete(ENDPOINTS.ROUTES_DELETE_ALL),
};

// ─── Tours (PostgreSQL) ───────────────────────────────────────────────────────
export const tourApi = {
  getAll: () => api.get(ENDPOINTS.TOURS),
  getById: (tourId) => api.get(`${ENDPOINTS.TOURS}?tourId=${tourId}`),
  getByOrganizer: (organizerId) =>
    api.get(`${ENDPOINTS.TOURS}?organizerId=${organizerId}`),
  create: (data) => api.post(ENDPOINTS.TOURS, data),
  getParticipants: (tourId) =>
    api.get(`${ENDPOINTS.TOUR_PARTICIPANTS}?tourId=${tourId}`),
  addParticipant: (data) => api.post(ENDPOINTS.TOUR_PARTICIPANTS, data),
};

// ─── Odometer ─────────────────────────────────────────────────────────────────
export const odometerApi = {
  getAll: (params = {}) =>
    api.get(ENDPOINTS.ODOMETER_LIST, { params }),
  submit: async (formData) =>
    api.post(ENDPOINTS.ODOMETER_SUBMIT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStatus: (id, status, adminNotes) =>
    api.patch(ENDPOINTS.ODOMETER_UPDATE_STATUS, { id, status, adminNotes }),
};

// ─── Route Planner ────────────────────────────────────────────────────────────
export const routePlannerApi = {
  getAll: () => api.get(ENDPOINTS.ROUTE_PLANNER),
  getById: (planId) =>
    api.get(`${ENDPOINTS.ROUTE_PLANNER}?planId=${planId}`),
  create: (data) => api.post(ENDPOINTS.ROUTE_PLANNER, data),
  update: (planId, data) =>
    api.put(ENDPOINTS.ROUTE_PLANNER, { planId, ...data }),
};

// ─── Emergency Contacts ───────────────────────────────────────────────────────
export const emergencyApi = {
  getAll: (params = {}) =>
    api.get(ENDPOINTS.EMERGENCY_CONTACTS, { params }),
  create: (data) => api.post(ENDPOINTS.EMERGENCY_CONTACTS, data),
  update: (id, data) =>
    api.put(ENDPOINTS.EMERGENCY_CONTACTS, { id, ...data }),
  delete: (id) =>
    api.delete(`${ENDPOINTS.EMERGENCY_CONTACTS}?id=${id}`),
};

// ─── AI Endpoints ─────────────────────────────────────────────────────────────
export const aiApi = {
  tripPlan: (data) => api.post(ENDPOINTS.AI_TRIP_PLAN, data),
  attractions: (destination, country) =>
    api.post(ENDPOINTS.AI_ATTRACTIONS, { destination, country }),
  chat: (query, context) =>
    api.post(ENDPOINTS.CHAT, { query, context }),
  translate: (texts, targetLanguage) =>
    api.post(ENDPOINTS.TRANSLATE, { texts, targetLanguage }),
  parseExpense: (imageBase64) =>
    api.post('/api/ai/parse-expense', { imageBase64 }),
  vehicleInsights: (data) =>
    api.post('/api/ai/vehicle-insights', data),
};

// ─── Health Check ─────────────────────────────────────────────────────────────
export const healthApi = {
  testConnection: () => api.get(ENDPOINTS.TEST_CONNECTION),
  refreshData: (type) =>
    api.get(ENDPOINTS.REFRESH_DATA, { params: type ? { type } : {} }),
};

export default api;
