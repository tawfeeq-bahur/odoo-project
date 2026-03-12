// ─── API Configuration ───────────────────────────────────────────────────────
// Change this to your local machine IP when testing on a physical device.
// For Android Emulator use: http://10.0.2.2:3000
// For iOS Simulator use: http://localhost:3000
// For physical device: http://<YOUR_LOCAL_IP>:3000  (e.g. http://192.168.1.5:3000)
// TODO: Replace with your laptop's IPv4 address (run 'ipconfig' in PowerShell to find it)
export const API_BASE_URL = 'http://10.109.71.42:3000'; // <-- change this IP!

// ─── API Endpoints ───────────────────────────────────────────────────────────
export const ENDPOINTS = {
  // Auth (mock)
  LOGIN: '/api/auth/login',

  // Employees
  EMPLOYEES: '/api/employees',
  EMPLOYEE_PROFILE: '/api/employee/profile',
  EMPLOYEE_EXPENSES: '/api/employee/expenses',

  // Odometer
  ODOMETER_LIST: '/api/odometer/list',
  ODOMETER_SUBMIT: '/api/odometer/submit',
  ODOMETER_UPDATE_STATUS: '/api/odometer/update-status',

  // Routes
  ROUTES_LIST: '/api/routes/list',
  ROUTES_SAVE: '/api/routes/save',
  ROUTES_LAST: '/api/routes/last',
  ROUTES_DELETE_ALL: '/api/routes/delete-all',

  // Admin — vehicles & trips
  ADMIN_VEHICLES: '/api/admin/vehicles',
  ADMIN_TRIPS: '/api/admin/trips',

  // Tours (PostgreSQL)
  TOURS: '/api/tours',
  TOUR_PARTICIPANTS: '/api/tours/participants',

  // Route planner (PostgreSQL)
  ROUTE_PLANNER: '/api/route-planner',

  // Emergency contacts
  EMERGENCY_CONTACTS: '/api/emergency-contacts',

  // AI Wrappers
  AI_TRIP_PLAN: '/api/ai/trip-plan',
  AI_ATTRACTIONS: '/api/ai/attractions',

  // Chat
  CHAT: '/api/chat',

  // Translate
  TRANSLATE: '/api/translate',

  // Data utilities
  TEST_CONNECTION: '/api/test-connection',
  REFRESH_DATA: '/api/refresh-data',
};

// ─── Demo Accounts ───────────────────────────────────────────────────────────
export const DEMO_USERS = [
  { username: 'Arun', password: '123', role: 'admin' },
  { username: 'Priya', password: '123', role: 'employee' },
  { username: 'Ravi', password: '123', role: 'employee' },
];

// ─── App Constants ───────────────────────────────────────────────────────────
export const APP_NAME = 'TourJet';
export const APP_TAGLINE = 'AI-Powered Tourism Management';

export const TOUR_STATUSES = ['planning', 'active', 'completed', 'cancelled'];

export const EXPENSE_TYPES = ['Travel', 'Food', 'Hotel', 'Tickets', 'Misc'];

export const VEHICLE_TYPES = [
  'Car',
  'Bus',
  'Van',
  'Minibus',
  'SUV',
  'Motorcycle',
];

export const TRANSPORT_MODES = [
  { label: 'Car', value: 'car', icon: 'car' },
  { label: 'Bus', value: 'bus', icon: 'bus' },
  { label: 'Walk', value: 'walk', icon: 'walk' },
  { label: 'Cycle', value: 'bicycle', icon: 'bicycle' },
  { label: 'Flight', value: 'flight', icon: 'airplane' },
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'অসমীয়া' },
  { code: 'ur', label: 'اردو' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
];

export const ROUTE_TYPES = ['shortest', 'fastest', 'scenic', 'eco-friendly'];
export const TRAFFIC_LEVELS = ['low', 'moderate', 'heavy'];

export const ONBOARDING_SCENE_TYPES = [
  { id: 'beach', label: '🏖️ Beach', icon: 'sunny' },
  { id: 'mountains', label: '🏔️ Mountains', icon: 'snow' },
  { id: 'city', label: '🌆 City', icon: 'business' },
  { id: 'forest', label: '🌲 Forest', icon: 'leaf' },
  { id: 'desert', label: '🏜️ Desert', icon: 'partly-sunny' },
  { id: 'historical', label: '🏛️ Historical', icon: 'library' },
];

export const ONBOARDING_INTERESTS = [
  'Hiking',
  'Photography',
  'Food Tours',
  'Shopping',
  'Wildlife',
  'Adventure Sports',
  'Art & Culture',
  'Nightlife',
  'Wellness & Spa',
  'Road Trips',
];

export const MAX_EMERGENCY_CONTACTS = 3;
export const POLICE_NUMBER = '100';

export const STATUS_COLORS = {
  planning: '#6366f1',
  active: '#22c55e',
  ongoing: '#06b6d4',
  completed: '#94a3b8',
  cancelled: '#ef4444',
  pending: '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444',
};
