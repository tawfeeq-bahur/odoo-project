# Fleet Manager Setup Instructions

## Environment Variables Required

To fix the trip planner error, you need to create a `.env.local` file in the `fleet_manager` directory with the following environment variables:

```bash
# Google AI API Key for Genkit
# Get your API key from: https://aistudio.google.com/app/apikey
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# MongoDB Configuration
# Replace with your actual MongoDB connection strings
MONGODB_URI=mongodb://localhost:27017
MONGODB_URI_ADMIN=mongodb://localhost:27017
MONGODB_URI_EMPLOYEE=mongodb://localhost:27017
MONGODB_DB_ADMIN=admin_db
MONGODB_DB_EMPLOYEE=emp_db

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:9002
```

## Steps to Fix the Trip Planner Error:

1. **Get a Google AI API Key:**
   - Go to https://aistudio.google.com/app/apikey
   - Create a new API key
   - Copy the API key

2. **Create the environment file:**
   - In the `fleet_manager` directory, create a file named `.env.local`
   - Add the environment variables above, replacing `your_google_ai_api_key_here` with your actual API key

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

## Common Issues Fixed:

- ✅ Fixed syntax errors in the trip planner page
- ✅ Fixed incomplete form schema definition
- ✅ Fixed dynamic import for MapDisplay component
- ✅ Fixed InfoCard component definition
- ✅ Added proper error handling for missing API keys

The trip planner should now work correctly once you add the Google AI API key to your environment variables.
