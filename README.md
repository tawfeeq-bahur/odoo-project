
# TourJet - AI-Powered Tour Management

TourJet is a smart, AI-driven web application designed to simplify tour and travel management. It provides a centralized dashboard for organizers to plan trips, manage members, and track expenses, and a user-friendly panel for members to view trip details and collaborate.

## Core Features

*   **Organizer Dashboard:** A comprehensive overview for trip leaders to manage tour packages, active trips, members, and expenses.
*   **AI Route Planner:** Enter a source and destination to get AI-powered estimations for travel distance, duration, and costs, with points of interest visualized on a map.
*   **AI Expense Scanner:** Upload receipts for food, travel, or tickets. The AI automatically parses the details for easy expense logging.
*   **Trip & Itinerary Management:** Create detailed day-wise itineraries, manage trip members via invite links, and track all trip-related information in one place.
*   **Budgeting & Analytics:** Monitor expenses with category-wise splits and get AI-powered insights to optimize your budget and identify popular trends.
*   **Member Collaboration:** Members can view all trip info, see shared expenses, and (in future versions) interact via a group chat or polls.
*   **Responsive & Themed UI:** A clean, professional interface that works seamlessly on both desktop and mobile devices, with light and dark theme support.

## Technology Stack

*   **Frontend:**
    *   **Framework:** Next.js 15 (with App Router)
    *   **Language:** TypeScript
    *   **UI Library:** React 18
    *   **Styling:** Tailwind CSS
    *   **Component Library:** ShadCN UI
*   **Backend (integrated within Next.js):**
    *   **Runtime:** Node.js
    *   **AI Orchestration:** Genkit
*   **Other Tools:**
    *   **AI Provider:** Google AI
    *   **Icons:** Lucide React
    *   **Charts:** Recharts
    *   **Mapping:** Leaflet & React-Leaflet

## UI/UX Focus

*   **Role-Based Design:** The UI adapts to provide a tailored experience for both Tour Organizers and Trip Members.
*   **Data-Centric:** Dashboards and components are designed to present data clearly and effectively, enabling quick insights and easy management.
*   **Responsive:** The layout is fully responsive, ensuring a seamless experience whether you're planning on a desktop or checking details on the go with a mobile device.
*   **Efficient Workflow:** The user journey is optimized for efficiency, from planning a new tour to logging an expense, minimizing manual work.

## Future Enhancements

*   **Real-time Group Chat:** Implement a chat section for members of a trip to communicate and coordinate.
*   **QR Code / Invite Link Generation:** Allow organizers to generate unique links or QR codes for members to join a trip.
*   **Photo Sharing & Memories:** A dedicated section for members to upload and share photos from a trip, creating a shared album.
*   **Persistent Database:** Replace the current client-side state management with a full backend database (like Firebase Firestore or MongoDB) to ensure data persistence.
*   **Secure User Authentication:** Implement a production-ready authentication system using a service like Firebase Authentication or NextAuth.js.
