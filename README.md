# FleetFlow - Fleet Management Optimization

FleetFlow is an AI-powered web application designed to streamline fleet management operations. It provides a centralized dashboard for real-time monitoring, a smart trip planner for cost and distance estimation, and an expense scanner to simplify financial tracking.

## Core Features

*   **Fleet Dashboard:** Get a real-time overview of your entire fleet, including vehicle status, ongoing trips, and key performance indicators like fuel consumption and total expenses.
*   **AI Trip Planner:** Enter a source and destination to receive instant AI-powered estimations for trip distance, duration, fuel costs, and potential toll charges.
*   **AI Expense Scanner:** Upload images of fuel receipts, toll bills, or maintenance invoices. The AI will automatically parse the details and add them to your trip expenses.
*   **Vehicle & Trip Management:** Track detailed information for each vehicle and log every trip with associated expenses and routes.
*   **Data-Driven Analytics:** Visualize historical data with interactive charts to identify inefficiencies, detect anomalies, and make informed decisions for future planning.
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

## UI/UX Focus

*   **Professional & Clean:** The UI is designed to be clutter-free and intuitive, using a corporate color palette (blues and grays) suitable for a business tool.
*   **Data-Centric:** Dashboards and components are designed to present data clearly and effectively, enabling quick insights.
*   **Responsive:** The layout is fully responsive, ensuring a seamless experience whether you're in the office on a desktop or on the go with a mobile device.
*   **Efficient Workflow:** The user journey is optimized for efficiency, from planning a trip to logging expenses, minimizing manual data entry.

## Future Enhancements

*   **Driver Performance Scoring:** Implement a driver scoring system (0-100) based on metrics like mileage efficiency (distance/fuel), on-time trip completion, and simulated harsh events (harsh braking, overspeeding). This will allow admins to rank drivers and identify coaching opportunities.
*   **Virtual Maintenance Schedules:** Automatically trigger maintenance alerts (e.g., "Oil Change Due," "Tire Replacement Needed") based on total distance traveled (km). This moves from reactive to proactive vehicle care.
*   **Advanced Route & Cost Analysis:** Integrate algorithms like the Haversine formula for accurate distance calculations and Dijkstra’s algorithm to find the most fuel-efficient or cost-effective routes by considering penalties for road types (city vs. highway) or high-wear areas.
*   **Data Simulation & Import:** Add a feature to generate synthetic trip data or allow bulk trip log uploads via CSV. This will enable more robust testing, demonstrations, and analysis of historical trends.
*   **Persistent Database:** Replace the current client-side state management with a full backend database (like Firebase Firestore or MongoDB) to ensure data persistence and scalability.
*   **Secure User Authentication:** Implement a production-ready authentication system using a service like Firebase Authentication or NextAuth.js.

---

### Credits

## Credits  

**Developed by:** JD  

- 📧 Email: deepakjd1226@gmail.com
- 🔗 LinkedIn: https://www.linkedin.com/in/deepak-j-1206hd/

