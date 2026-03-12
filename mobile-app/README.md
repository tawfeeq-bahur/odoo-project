# TourJet Mobile App

React Native Expo mobile app — full feature parity conversion of the TourJet Next.js web application.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Expo CLI | `npm install -g expo-cli` |
| Expo Go App | Install on your Android/iOS device |
| Android Studio | Required for Android Emulator |

---

## Installation

```bash
cd mobile-app
npm install
```

---

## Running the App

### 1. Expo Go (Physical Device — quickest way)

```bash
npx expo start
```

1. Open the **Expo Go** app on your Android or iOS device.
2. Scan the QR code shown in the terminal.
3. The app loads over your local Wi-Fi connection.

> **Important:** Your phone and development machine must be on the **same Wi-Fi network**.
> Then open `src/utils/constants.js` and change `API_BASE_URL` to your machine's local IP:
> ```js
> // Find your IP: run `ipconfig` on Windows → look for IPv4 Address
> export const API_BASE_URL = 'http://192.168.x.x:3000';
> ```

---

### 2. Android Emulator

```bash
npx expo start
# Then press 'a' in the terminal
```

Or start the emulator via Android Studio → AVD Manager, then:
```bash
npx expo run:android
```

> The default `API_BASE_URL` is `http://10.0.2.2:3000` which routes to your host machine's localhost from the Android Emulator. No change needed for emulator testing.

---

### 3. Physical Android Device (USB)

```bash
# Enable Developer Options + USB Debugging on your phone
npx expo run:android
```

> For physical device, update `API_BASE_URL` in `src/utils/constants.js` to your machine's LAN IP.

---

## Backend Setup

The mobile app connects to the **same Next.js API server** used by the web app.

```bash
# In the root project folder (not mobile-app/)
npm run dev
```

The backend starts on `http://localhost:3000`. Mobile app connects via the `API_BASE_URL` constant.

---

## Demo Accounts

| Username | Password | Role |
|----------|----------|------|
| `arun` | `123` | Admin |
| `priya` | `123` | Employee |
| `ravi` | `123` | Employee |

---

## Project Structure

```
mobile-app/
├── App.js                      # Entry point — wraps providers + navigator
├── app.json                    # Expo config (permissions, splash, icons)
├── babel.config.js             # Babel config (reanimated plugin)
├── package.json                # All dependencies
│
└── src/
    ├── screens/                # 25 full-feature screens
    │   ├── LoginScreen.js
    │   ├── SignupScreen.js
    │   ├── OnboardingScreen.js
    │   ├── HomeScreen.js           ← Dashboard
    │   ├── TourDetailScreen.js
    │   ├── JoinTourScreen.js
    │   ├── MembersScreen.js        ← QR Code attendance
    │   ├── ReportsScreen.js        ← Charts & analytics
    │   ├── CalendarScreen.js
    │   ├── PlanRouteScreen.js      ← AI route planner
    │   ├── AIDemoScreen.js         ← AI chatbot
    │   ├── TransliterationScreen.js
    │   ├── TripsScreen.js
    │   ├── ScannerScreen.js        ← AI receipt scanner
    │   ├── VehicleHealthScreen.js
    │   ├── SupportScreen.js
    │   ├── VehiclesScreen.js       ← Fleet management
    │   ├── VehicleDetailScreen.js
    │   ├── EmployeesScreen.js
    │   ├── EmployeeDetailScreen.js
    │   ├── RoutesScreen.js
    │   ├── TripSummaryScreen.js    ← Admin trip overview
    │   ├── OdometerScreen.js       ← Admin approve/reject
    │   ├── ProfileScreen.js
    │   └── SOSScreen.js            ← Emergency contacts + dial
    │
    ├── navigation/
    │   ├── AppNavigator.js         # Auth ↔ Main switch
    │   ├── AuthNavigator.js        # Login/Signup/Onboarding
    │   └── MainNavigator.js        # Bottom tabs + stacks
    │
    ├── context/
    │   ├── AuthContext.js          # Login state + user session
    │   └── AppStateContext.js      # Packages/expenses/trips state
    │
    ├── services/
    │   └── api.js                  # All Axios API calls
    │
    ├── hooks/
    │   ├── useApiCall.js           # Generic async call hook
    │   └── useChat.js              # Chat state hook
    │
    ├── components/
    │   ├── UIComponents.js         # Shared UI primitives
    │   ├── AppTextInput.js
    │   ├── TourCard.js
    │   └── ExpenseCard.js
    │
    └── utils/
        ├── colors.js               # Theme tokens
        ├── constants.js            # API_BASE_URL, endpoints, etc.
        └── helpers.js              # Date/string/currency helpers
```

---

## Navigation Structure

```
AppNavigator
├── AuthStack (when not logged in)
│   ├── Login
│   ├── Signup
│   └── Onboarding
│
└── MainTabs (when logged in)
    ├── 🏠 Home Tab
    │   ├── Dashboard
    │   ├── TourDetail
    │   ├── JoinTour
    │   ├── Members
    │   └── Reports
    │
    ├── 🔭 Explore Tab
    │   ├── PlanRoute (AI)
    │   ├── Calendar
    │   ├── AI Demo
    │   └── Transliteration
    │
    ├── 🗺️ Trips Tab
    │   ├── Trips
    │   ├── Scanner (Expenses)
    │   ├── VehicleHealth
    │   └── Support
    │
    ├── 🚌 Fleet Tab (Admin)
    │   ├── Vehicles
    │   ├── VehicleDetail
    │   ├── Employees
    │   ├── EmployeeDetail
    │   ├── Routes
    │   ├── TripSummary
    │   └── Odometer
    │
    └── 👤 Profile Tab
        ├── Profile
        └── SOS (Emergency Contacts)
```

---

## Key Features

| Feature | Screen | Details |
|---------|--------|---------|
| AI Chatbot | AIDemoScreen | Talks to `/api/chat` endpoint |
| AI Route Planner | PlanRouteScreen | Calls `/api/route-planner` + OSM WebView map |
| Receipt Scanner | ScannerScreen | Camera → base64 → AI parse |
| Transliteration | TransliterationScreen | Image OCR → 22-language output |
| QR Code Invites | MembersScreen | `react-native-qrcode-svg` |
| Charts | ReportsScreen | `react-native-chart-kit` Bar + Pie |
| Emergency Contacts | SOSScreen | AsyncStorage + `Linking.openURL('tel:...')` |
| Odometer Approval | OdometerScreen | Admin approve/reject with notes |
| Fleet Management | VehiclesScreen | CRUD for vehicles (admin only) |
| Vehicle Health | VehicleHealthScreen | Fuel slider + AI gauge analysis |

---

## Environment / Config

Edit `src/utils/constants.js`:

```js
// For Android Emulator (default)
export const API_BASE_URL = 'http://10.0.2.2:3000';

// For physical device (replace with your machine's LAN IP)
export const API_BASE_URL = 'http://192.168.1.100:3000';

// For production
export const API_BASE_URL = 'https://your-deployed-api.com';
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Network request failed" | Check `API_BASE_URL` in constants.js. For physical device, use LAN IP — not localhost |
| Metro bundler not starting | Run `npx expo start --clear` to reset cache |
| Android emulator not connecting | Ensure emulator is running before `npx expo start`, press `a` |
| QR code not scanning | Ensure same Wi-Fi network, or use tunnel mode: `npx expo start --tunnel` |
| Reanimated error | Ensure `babel.config.js` has `react-native-reanimated/plugin` as last plugin |
| Camera/permissions denied | Re-install app or reset permissions in device settings |
