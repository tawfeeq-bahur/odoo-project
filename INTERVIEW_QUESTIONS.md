# TourJet/FleetFlow - Interview Questions Guide

This document contains interview questions based on the TourJet project, covering the tech stack, features, and implementation details. All explanations are kept simple and easy to understand.

---

## 📋 Table of Contents
1. [Project Overview Questions](#project-overview-questions)
2. [Frontend Technology Questions](#frontend-technology-questions)
3. [Backend & AI Questions](#backend--ai-questions)
4. [Database Questions](#database-questions)
5. [Feature-Specific Questions](#feature-specific-questions)
6. [Advanced Concepts Questions](#advanced-concepts-questions)

---

## Project Overview Questions

### Q1: What is TourJet/FleetFlow? Explain the problem it solves.
**Answer:**
TourJet (also called FleetFlow) is an AI-powered web application for managing tours and fleet operations. 

**Problem it solves:**
- Manual tour planning is time-consuming
- Tracking expenses from receipts is tedious
- Managing multiple vehicles and drivers is complex
- No centralized dashboard for fleet monitoring

**Solution:**
- AI-powered trip planner that calculates routes, costs, and points of interest
- AI expense scanner that reads receipts automatically
- Real-time dashboard for monitoring all vehicles
- Role-based access for admins and drivers

### Q2: Who are the target users and what are their roles?
**Answer:**
1. **Tour Organizers/Admins:**
   - Manage vehicles and assign drivers
   - Plan trips with AI assistance
   - Approve/reject expenses
   - View analytics and reports

2. **Drivers/Members:**
   - View assigned trips
   - Submit expenses with receipt scanning
   - Track their vehicle status
   - Request support

---

## Frontend Technology Questions

### Q3: What is Next.js and why did you use it?
**Answer:**
**What is Next.js?**
Next.js is a React framework for building web applications with server-side features.

**Why we used it:**
- **App Router:** Modern routing system (Next.js 15)
- **Server-Side Rendering (SSR):** Faster initial page loads
- **Server Actions:** Backend API logic without separate API routes
- **Built-in Optimization:** Automatic code splitting, image optimization
- **TypeScript Support:** Better code quality and type safety

**Example in our project:**
```typescript
// src/app/guide/page.tsx - Next.js page component
export default function GuidePage() {
  return <RouteGuide />;
}
```

### Q4: Explain TypeScript and its benefits in this project.
**Answer:**
**What is TypeScript?**
TypeScript is JavaScript with type checking - it helps catch errors before runtime.

**Benefits in our project:**
1. **Type Safety:** Prevents bugs by checking data types
2. **Better IDE Support:** Auto-completion and error detection
3. **Code Documentation:** Types serve as inline documentation
4. **Refactoring:** Easier to change code safely

**Example:**
```typescript
// src/lib/types.ts
type Vehicle = {
  id: string;
  name: string;
  plateNumber: string;
  status: "On Trip" | "Idle" | "Maintenance";
  fuelLevel: number;
};

// TypeScript catches errors if you use wrong status
const vehicle: Vehicle = {
  status: "Flying" // ❌ Error: Invalid status
};
```

### Q5: What is React and how does it work in this project?
**Answer:**
**What is React?**
React is a JavaScript library for building user interfaces using components.

**How it works in our project:**
1. **Component-Based:** UI is split into reusable pieces
2. **State Management:** Uses `useState` and `useContext` hooks
3. **Functional Components:** Modern React with hooks
4. **Reactive Updates:** UI updates automatically when data changes

**Example:**
```typescript
// Component example
function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card onClick={() => setIsExpanded(!isExpanded)}>
      <h3>{vehicle.name}</h3>
      {isExpanded && <p>Fuel: {vehicle.fuelLevel}%</p>}
    </Card>
  );
}
```

### Q6: What is Tailwind CSS and why use it over regular CSS?
**Answer:**
**What is Tailwind CSS?**
Tailwind is a utility-first CSS framework - you style elements using pre-defined class names.

**Advantages:**
- **Faster Development:** No need to write custom CSS
- **Consistency:** Uses a design system (spacing, colors)
- **Responsive Design:** Built-in breakpoints (sm, md, lg)
- **Smaller Bundle:** Removes unused CSS in production

**Example:**
```tsx
// Traditional CSS
<div className="vehicle-card">...</div>
// Requires separate CSS file

// Tailwind CSS
<div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg">
  // p-4 = padding, bg-white = background, rounded-lg = border radius
</div>
```

### Q7: What is ShadCN UI? How is it different from other UI libraries?
**Answer:**
**What is ShadCN UI?**
ShadCN is a collection of copy-paste React components built with Radix UI and Tailwind CSS.

**Key Differences:**
| ShadCN UI | Other Libraries (MUI, Ant Design) |
|-----------|----------------------------------|
| Copy code to your project | Install as dependency |
| Full control over code | Limited customization |
| No vendor lock-in | Tied to library updates |
| Lightweight | Heavier bundle size |

**Components we used:**
- `Button`, `Card`, `Dialog`, `Dropdown`
- `Table`, `Select`, `Checkbox`
- `Toast` (notifications)

**Example:**
```tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

<Button variant="default" size="lg">
  Plan Trip
</Button>
```

---

## Backend & AI Questions

### Q8: What is Genkit and how does it work?
**Answer:**
**What is Genkit?**
Genkit is a framework by Google for building AI-powered applications. It simplifies working with AI models.

**How it works in our project:**
1. **Flows:** Define AI tasks as reusable functions
2. **Prompts:** Structure queries to AI models
3. **Integration:** Connects to Google's Gemini AI model

**Example Flow:**
```typescript
// src/ai/flows/tripPlannerFlow.ts
export const tripPlannerFlow = ai.defineFlow({
  name: 'tripPlannerFlow',
  inputSchema: z.object({
    source: z.string(),
    destination: z.string(),
  }),
  outputSchema: TripPlanSchema,
}, async ({ source, destination }) => {
  const { output } = await ai.generate({
    model: gemini25Flash,
    prompt: `Plan a trip from ${source} to ${destination}...`,
    output: { schema: TripPlanSchema }
  });
  return output;
});
```

### Q9: Explain the AI Trip Planner feature and its implementation.
**Answer:**
**What it does:**
User enters source, destination, and vehicle details → AI generates trip plan with:
- Distance and duration
- Fuel cost and toll estimates
- Route on map
- Points of interest (POIs)

**Implementation Steps:**
1. **User Input:** Form in React component
2. **Server Action:** Next.js calls AI flow
3. **Genkit Flow:** Sends structured prompt to Gemini AI
4. **AI Response:** Returns JSON with trip details
5. **Display:** Show results on map using Leaflet

**Code Flow:**
```typescript
// 1. Component (Frontend)
const handleSubmit = async (data) => {
  const result = await getTripPlan(data); // Server Action
  setTripPlan(result);
};

// 2. Server Action (Backend)
export async function getTripPlan(input) {
  return await runFlow('tripPlannerFlow', input);
}

// 3. Genkit Flow (AI)
// Processes with Gemini AI and returns structured data
```

### Q10: How does the AI Expense Scanner work?
**Answer:**
**What it does:**
User uploads receipt photo → AI extracts expense details (amount, date, type).

**Technical Implementation:**
1. **Image Upload:** User selects file from device
2. **Convert to Base64:** Image converted to data URI
3. **Send to AI:** Genkit flow with vision model
4. **Parse Receipt:** AI reads text and extracts structured data
5. **Display:** Show parsed data for user confirmation

**Key Code:**
```typescript
// Convert image to base64
const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64 = reader.result as string;
    parseExpense(base64);
  };
  reader.readAsDataURL(file);
};

// AI parsing
const expenseParserFlow = ai.defineFlow({
  inputSchema: z.object({ image: z.string() }),
  outputSchema: ExpenseSchema,
}, async ({ image }) => {
  const { output } = await ai.generate({
    model: gemini25Flash,
    prompt: [
      { text: 'Extract expense details from this receipt' },
      { media: { url: image } }
    ],
    output: { schema: ExpenseSchema }
  });
  return output;
});
```

### Q11: What AI model are you using and why?
**Answer:**
**Model:** Google Gemini 2.5 Flash

**Why this model:**
1. **Multimodal:** Handles both text and images
2. **Fast:** "Flash" variant is optimized for speed
3. **Structured Output:** Can return JSON schemas
4. **Cost-Effective:** Cheaper than larger models
5. **Google Integration:** Works seamlessly with Genkit

**Where we use it:**
- Trip planning (text input → structured route data)
- Expense scanning (image input → parsed receipt data)
- Dashboard insights (data analysis → recommendations)

---

## Database Questions

### Q12: What database are you using? Explain the current approach.
**Answer:**
**Current Status:**
The project currently uses **client-side state management** instead of a real database.

**How it works:**
```typescript
// Using React Context + useState
const [vehicles, setVehicles] = useState<Vehicle[]>([]);
const [expenses, setExpenses] = useState<Expense[]>([]);

// Add vehicle
const addVehicle = (vehicle: Vehicle) => {
  setVehicles([...vehicles, vehicle]);
};
```

**Limitations:**
- ❌ Data lost on page refresh
- ❌ No data persistence
- ❌ Can't share data between users

**Future Plan:**
Replace with **MongoDB** or **PostgreSQL** with real API endpoints.

### Q13: How would you implement a real database in this project?
**Answer:**
**Planned Architecture:**

**Option 1: MongoDB (NoSQL)**
```typescript
// 1. Install MongoDB client
npm install mongodb

// 2. Create API route
// src/app/api/vehicles/route.ts
export async function POST(request: Request) {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('tourjet');
  const vehicle = await request.json();
  await db.collection('vehicles').insertOne(vehicle);
  return Response.json({ success: true });
}

// 3. Update frontend
const addVehicle = async (vehicle: Vehicle) => {
  await fetch('/api/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicle)
  });
};
```

**Option 2: PostgreSQL (SQL)**
```typescript
// Using pg library
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function addVehicle(vehicle: Vehicle) {
  await pool.query(
    'INSERT INTO vehicles (name, plate_number, status) VALUES ($1, $2, $3)',
    [vehicle.name, vehicle.plateNumber, vehicle.status]
  );
}
```

---

## Feature-Specific Questions

### Q14: Explain the role-based access system in your application.
**Answer:**
**How it works:**
Different UI and features based on user role (Admin vs Driver).

**Implementation:**
```typescript
// 1. User login stores role
const [currentUser, setCurrentUser] = useState({
  username: 'admin',
  role: 'admin' // or 'employee'
});

// 2. Context provides role throughout app
<AppContext.Provider value={{ currentUser, vehicles, expenses }}>

// 3. Components check role and show different content
function Dashboard() {
  const { currentUser } = useAppContext();
  
  if (currentUser.role === 'admin') {
    return (
      <>
        <AdminStatistics />
        <AllVehiclesTable />
        <ExpenseApprovalQueue />
      </>
    );
  } else {
    return (
      <>
        <MyAssignedVehicle />
        <MyTrips />
        <SubmitExpense />
      </>
    );
  }
}
```

**Admin Features:**
- View all vehicles and drivers
- Approve/reject expenses
- Generate reports
- Manage employees

**Driver Features:**
- View assigned vehicle only
- Submit expenses
- Plan trips
- Request support

### Q15: How does the map display work? Explain Leaflet integration.
**Answer:**
**What is Leaflet?**
Leaflet is a JavaScript library for interactive maps.

**How we use it:**
```tsx
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';

function MapDisplay({ route, pois }) {
  return (
    <MapContainer center={[13.0827, 80.2707]} zoom={12}>
      {/* Base map tiles from OpenStreetMap */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Draw route line */}
      <Polyline positions={route} color="blue" />
      
      {/* Mark points of interest */}
      {pois.map(poi => (
        <Marker position={[poi.lat, poi.lon]}>
          <Popup>{poi.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

**Features:**
- Interactive pan and zoom
- Route visualization with polylines
- Markers for POIs (restaurants, gas stations)
- Popup tooltips with information

### Q16: Explain the expense management workflow.
**Answer:**
**Complete Flow:**

**Step 1: Driver submits expense**
```typescript
// Option A: Manual entry
const submitExpense = (expense: Expense) => {
  addExpense({
    ...expense,
    status: 'pending',
    submittedBy: currentUser.username
  });
};

// Option B: AI Scanner
const scanReceipt = async (image: string) => {
  const parsed = await parseExpense(image);
  // Shows parsed data for review before submit
};
```

**Step 2: Admin reviews**
```typescript
function ExpenseApprovalQueue() {
  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  
  const handleApprove = (expenseId: string) => {
    updateExpenseStatus(expenseId, 'approved');
  };
  
  const handleReject = (expenseId: string) => {
    updateExpenseStatus(expenseId, 'rejected');
  };
}
```

**Step 3: Analytics**
```typescript
// Dashboard shows expense breakdown
const expensesByType = {
  Fuel: expenses.filter(e => e.type === 'Fuel').reduce((sum, e) => sum + e.amount, 0),
  Toll: expenses.filter(e => e.type === 'Toll').reduce((sum, e) => sum + e.amount, 0),
  // ...
};
```

---

## Advanced Concepts Questions

### Q17: How do you handle state management in large React applications?
**Answer:**
**Our Approach: React Context API**

```typescript
// 1. Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// 2. Provider Component
export function AppProvider({ children }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  const addVehicle = (vehicle: Vehicle) => {
    setVehicles([...vehicles, vehicle]);
  };
  
  return (
    <AppContext.Provider value={{ vehicles, addVehicle, expenses }}>
      {children}
    </AppContext.Provider>
  );
}

// 3. Use in components
function VehicleList() {
  const { vehicles } = useAppContext();
  return <div>{vehicles.map(v => <VehicleCard {...v} />)}</div>;
}
```

**When to use what:**
- **useState:** Local component state (form inputs, toggles)
- **Context:** Global state (user data, app-wide settings)
- **Redux/Zustand:** Very complex state with many actions (not needed for our project)

### Q18: What is Server-Side Rendering (SSR) and how does Next.js use it?
**Answer:**
**Traditional React (Client-Side Rendering):**
1. Server sends empty HTML
2. Browser downloads JavaScript
3. React renders content
4. User sees page (slower initial load)

**Next.js SSR:**
1. Server renders full HTML with content
2. Browser shows page immediately (fast)
3. JavaScript loads and "hydrates" page
4. Page becomes interactive

**In our project:**
```tsx
// This page is server-rendered by default
export default async function DashboardPage() {
  // Can fetch data on server
  const vehicleCount = await getVehicleCount();
  
  return <Dashboard initialCount={vehicleCount} />;
}
```

**Benefits:**
- ✅ Faster first page load
- ✅ Better SEO (search engines see content)
- ✅ Social media previews work

### Q19: Explain responsive design in your application.
**Answer:**
**What is Responsive Design?**
UI adapts to different screen sizes (mobile, tablet, desktop).

**How we implement:**
```tsx
// Tailwind responsive classes
<div className="
  grid 
  grid-cols-1        // 1 column on mobile
  md:grid-cols-2     // 2 columns on medium screens (md: prefix)
  lg:grid-cols-3     // 3 columns on large screens (lg: prefix)
">
  <VehicleCard />
  <VehicleCard />
  <VehicleCard />
</div>

// Hide/show based on screen size
<div className="hidden md:block">
  // This sidebar only shows on medium+ screens
  <Sidebar />
</div>

// Flexible text sizes
<h1 className="text-2xl md:text-4xl lg:text-5xl">
  Dashboard
</h1>
```

**Breakpoints we use:**
- `sm:` 640px (phone landscape)
- `md:` 768px (tablet)
- `lg:` 1024px (desktop)
- `xl:` 1280px (large desktop)

### Q20: How do you handle forms and validation?
**Answer:**
**We use React Hook Form + Zod**

**React Hook Form:** Manages form state efficiently
**Zod:** Schema validation library

**Example:**
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Define validation schema
const vehicleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  plateNumber: z.string().regex(/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/, "Invalid plate"),
  fuelLevel: z.number().min(0).max(100)
});

// 2. Use in component
function AddVehicleForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(vehicleSchema)
  });
  
  const onSubmit = (data) => {
    addVehicle(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register("plateNumber")} />
      {errors.plateNumber && <span>{errors.plateNumber.message}</span>}
      
      <button type="submit">Add Vehicle</button>
    </form>
  );
}
```

**Benefits:**
- ✅ Less re-renders (better performance)
- ✅ Type-safe validation with TypeScript
- ✅ Clear error messages

### Q21: What is the difference between `.tsx` and `.ts` files?
**Answer:**
**`.ts` (TypeScript):**
- Regular TypeScript code
- No JSX/HTML syntax
- Used for: utilities, types, API functions

```typescript
// src/lib/utils.ts
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}
```

**`.tsx` (TypeScript + JSX):**
- TypeScript + React components
- Can use HTML-like syntax (JSX)
- Used for: React components, pages

```tsx
// src/components/VehicleCard.tsx
export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="card">
      <h3>{vehicle.name}</h3>
    </div>
  );
}
```

### Q22: Explain the build and deployment process.
**Answer:**
**Development:**
```bash
npm run dev
# Starts development server on http://localhost:3000
# Hot reload: changes reflect immediately
```

**Production Build:**
```bash
npm run build
# 1. TypeScript compilation check
# 2. Optimizes code (minification, tree-shaking)
# 3. Generates static pages where possible
# 4. Creates optimized JavaScript bundles

npm start
# Runs production build locally
```

**Deployment Options:**

**Option 1: Vercel (Recommended for Next.js)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Automatic:
# - Builds on every git push
# - Environment variables from dashboard
# - Automatic HTTPS
# - CDN distribution
```

**Option 2: Firebase Hosting**
```yaml
# apphosting.yaml
runConfig:
  runtime: nodejs20
  
# Deploy
firebase deploy
```

**What happens during deployment:**
1. Code pushed to GitHub
2. Platform detects Next.js project
3. Runs `npm install` and `npm run build`
4. Deploys to global CDN
5. Provides HTTPS URL

---

## Behavioral & Problem-Solving Questions

### Q23: What challenges did you face and how did you solve them?
**Answer:**

**Challenge 1: AI responses were inconsistent**
- **Problem:** Sometimes AI returned invalid JSON
- **Solution:** Used Zod schemas with Genkit's structured output
```typescript
const TripPlanSchema = z.object({
  distance: z.number(),
  duration: z.string(),
  estimatedCost: z.number(),
  route: z.array(z.object({ lat: z.number(), lon: z.number() }))
});

// This forces AI to return valid JSON matching schema
```

**Challenge 2: Leaflet not rendering on first load**
- **Problem:** Map component needs window object (SSR issue)
- **Solution:** Dynamic import with no SSR
```tsx
import dynamic from 'next/dynamic';

const MapDisplay = dynamic(
  () => import('./MapDisplay'),
  { ssr: false } // Don't render on server
);
```

**Challenge 3: State lost on page refresh**
- **Problem:** Client-side state disappears
- **Solution (temporary):** Using localStorage
```typescript
useEffect(() => {
  localStorage.setItem('vehicles', JSON.stringify(vehicles));
}, [vehicles]);

// On load
useEffect(() => {
  const saved = localStorage.getItem('vehicles');
  if (saved) setVehicles(JSON.parse(saved));
}, []);
```

### Q24: How would you scale this application for 10,000 users?
**Answer:**

**1. Database Layer:**
```
Current: Client-side state
→ Implement: PostgreSQL/MongoDB with connection pooling
→ Consider: Read replicas for heavy read operations
```

**2. Caching:**
```typescript
// Cache frequent queries (Redis)
import { RedisCache } from 'redis';

async function getVehicles() {
  const cached = await cache.get('vehicles');
  if (cached) return JSON.parse(cached);
  
  const vehicles = await db.query('SELECT * FROM vehicles');
  await cache.set('vehicles', JSON.stringify(vehicles), 'EX', 300); // 5 min
  return vehicles;
}
```

**3. API Rate Limiting:**
```typescript
// Prevent abuse
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

**4. AI Request Optimization:**
```typescript
// Batch AI requests
// Queue system for non-urgent requests
// Cache common trip routes
```

**5. CDN for Static Assets:**
```
Images, CSS, JavaScript → CloudFlare/Vercel Edge Network
```

### Q25: What would you add next to this project?
**Answer:**

**Short-term (1-2 weeks):**
1. **User Authentication:** Firebase Auth or NextAuth.js
2. **Database Integration:** MongoDB Atlas
3. **Real-time Updates:** WebSockets for live vehicle tracking

**Medium-term (1 month):**
1. **Mobile App:** React Native version
2. **Notifications:** Email/SMS for expense approvals
3. **Analytics Dashboard:** More detailed charts with Recharts
4. **Export Features:** PDF reports, Excel exports

**Long-term (3+ months):**
1. **Live GPS Tracking:** Real-time vehicle locations
2. **Route Optimization:** Dijkstra's algorithm for best routes
3. **Driver Scoring:** Performance metrics
4. **Multi-language:** i18n support (Tamil, Hindi, English)
5. **Offline Mode:** PWA with service workers

**Code Example - PWA:**
```typescript
// next.config.ts
import withPWA from 'next-pwa';

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true
});
```

---

## Common Technical Terms Explained Simply

### API (Application Programming Interface)
Think of it as a waiter in a restaurant:
- You (frontend) tell the waiter (API) what you want
- Waiter goes to kitchen (backend/database)
- Brings back your food (data)

### JSON (JavaScript Object Notation)
Way to structure data for easy exchange:
```json
{
  "name": "TN-01-AB-1234",
  "status": "On Trip",
  "fuelLevel": 75
}
```

### State Management
Keeping track of data in your app:
- **Local State:** Data for one component (useState)
- **Global State:** Data shared across components (Context)

### TypeScript Type vs Interface
```typescript
// Type (flexible, can be anything)
type Status = "Idle" | "On Trip" | "Maintenance";

// Interface (for object shapes)
interface Vehicle {
  id: string;
  status: Status;
}
```

### Async/Await
Handling operations that take time (like AI calls):
```typescript
// Without async/await (callback hell ❌)
getTripPlan(data, (result) => {
  parseExpense(result, (parsed) => {
    saveToDatabase(parsed, () => {
      console.log("Done!");
    });
  });
});

// With async/await (clean ✅)
async function processTrip(data) {
  const result = await getTripPlan(data);
  const parsed = await parseExpense(result);
  await saveToDatabase(parsed);
  console.log("Done!");
}
```

---

## Quick Reference: Project Tech Stack

```
Frontend:
├── Next.js 15 (Framework)
├── React 18 (UI Library)
├── TypeScript (Type Safety)
├── Tailwind CSS (Styling)
└── ShadCN UI (Components)

Backend:
├── Next.js Server Actions (API)
├── Node.js (Runtime)
└── Genkit (AI Orchestration)

AI & External:
├── Google Gemini 2.5 Flash (AI Model)
├── Leaflet (Maps)
└── OpenStreetMap (Map Tiles)

Tools & Libraries:
├── React Hook Form (Forms)
├── Zod (Validation)
├── Recharts (Charts)
├── Lucide React (Icons)
└── date-fns (Date formatting)

Database (Planned):
└── MongoDB / PostgreSQL
```

---

## Interview Tips

1. **Always explain in simple terms first**, then technical
2. **Use examples from this project** to answer questions
3. **Mention trade-offs:** "We chose X because Y, but Z could work too"
4. **Be honest about limitations:** Current state vs. future plans
5. **Show problem-solving:** Talk about challenges you faced
6. **Connect to real-world:** How features help actual users

**Good luck with your interview! 🚀**
