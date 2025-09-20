import { NextRequest, NextResponse } from 'next/server';

// Mock responses for travel-related queries
const getTravelResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('goa') || lowerQuery.includes('3-day trip')) {
    return `Great choice! Here's a perfect 3-day Goa itinerary:

**Day 1: Beach Hopping & Old Goa**
• Morning: Visit Calangute Beach for water sports
• Afternoon: Explore Old Goa churches (Basilica of Bom Jesus, Se Cathedral)
• Evening: Sunset at Anjuna Beach and dinner at a beach shack

**Day 2: Adventure & Culture**
• Morning: Dudhsagar Falls or spice plantation tour
• Afternoon: Visit Fort Aguada and lighthouse
• Evening: Explore Panjim's Latin Quarter (Fontainhas)

**Day 3: Relaxation & Shopping**
• Morning: Relax at Palolem Beach
• Afternoon: Shopping at Mapusa Market
• Evening: Beach party or casino night

**Budget Estimate:** ₹8,000-15,000 per person
**Best Time:** October to March
**Must-try:** Fish curry, Bebinca dessert, Feni (local liquor)`;
  }
  
  if (lowerQuery.includes('kerala') || lowerQuery.includes('best time')) {
    return `Kerala is beautiful year-round, but here are the best times:

**Best Time to Visit:**
• **October to March:** Perfect weather, ideal for backwaters and beaches
• **June to September:** Monsoon season - great for Ayurveda treatments and lush greenery
• **April to May:** Hot but good for hill stations like Munnar

**Top Destinations:**
• **Munnar:** Tea plantations and cool climate
• **Alleppey:** Backwater houseboat experience
• **Kochi:** Historical port city with Chinese fishing nets
• **Wayanad:** Wildlife and trekking
• **Kovalam:** Beautiful beaches

**Unique Experiences:**
• Stay in a houseboat on the backwaters
• Try authentic Ayurvedic treatments
• Watch Kathakali dance performances
• Visit spice plantations`;
  }
  
  if (lowerQuery.includes('budget') || lowerQuery.includes('family vacation')) {
    return `Here's a comprehensive family vacation budgeting guide:

**Budget Categories:**
• **Accommodation:** 40-50% of total budget
• **Food:** 20-25% of total budget  
• **Transportation:** 15-20% of total budget
• **Activities:** 10-15% of total budget
• **Miscellaneous:** 5-10% of total budget

**Money-Saving Tips:**
• Book accommodation 2-3 months in advance
• Travel during off-peak seasons
• Use public transportation when possible
• Look for family packages and deals
• Cook some meals if staying in apartments
• Research free activities and attractions

**Sample Budget (Family of 4):**
• **Budget Trip:** ₹50,000-80,000
• **Mid-range:** ₹80,000-1,50,000
• **Luxury:** ₹1,50,000+`;
  }
  
  if (lowerQuery.includes('rajasthan') || lowerQuery.includes('places to visit')) {
    return `Rajasthan is a royal destination! Here are the must-visit places:

**Top Cities:**
• **Jaipur (Pink City):** Amber Fort, City Palace, Hawa Mahal
• **Jodhpur (Blue City):** Mehrangarh Fort, Umaid Bhawan Palace
• **Udaipur (City of Lakes):** Lake Pichola, City Palace, Jag Mandir
• **Jaisalmer (Golden City):** Golden Fort, Sam Sand Dunes
• **Pushkar:** Sacred lake, Brahma Temple, camel fair

**Unique Experiences:**
• Stay in heritage palaces and havelis
• Desert safari in Jaisalmer
• Hot air balloon ride in Jaipur
• Traditional Rajasthani folk dance shows
• Shopping for handicrafts and textiles

**Best Time:** October to March
**Duration:** 7-10 days for complete tour`;
  }
  
  if (lowerQuery.includes('mumbai') || lowerQuery.includes('attractions')) {
    return `Mumbai offers incredible attractions! Here are the must-sees:

**Historical & Cultural:**
• **Gateway of India:** Iconic monument overlooking the Arabian Sea
• **Chhatrapati Shivaji Terminus:** UNESCO World Heritage railway station
• **Elephanta Caves:** Ancient rock-cut caves (boat ride required)
• **Haji Ali Dargah:** Floating mosque in the sea

**Modern Mumbai:**
• **Marine Drive:** Queen's Necklace - beautiful promenade
• **Bandra-Worli Sea Link:** Architectural marvel
• **Juhu Beach:** Famous for street food and Bollywood
• **Powai Lake:** Serene lake in the city

**Shopping & Food:**
• **Colaba Causeway:** Shopping and street food
• **Crawford Market:** Spices and local goods
• **Chor Bazaar:** Antiques and vintage items
• **Bandra Hill Road:** Trendy cafes and boutiques

**Pro Tips:**
• Use local trains for authentic Mumbai experience
• Try vada pav, pav bhaji, and bhel puri
• Visit during Ganesh Chaturthi for cultural immersion`;
  }
  
  if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
    return `Hello! 👋 Welcome to TourJet AI! I'm your personal travel planning assistant. 

I can help you with:
• Planning amazing trips and itineraries
• Finding the best destinations and attractions
• Budget planning and cost estimates
• Travel tips and recommendations
• Route planning and navigation advice

What would you like to know about travel today? Feel free to ask me anything about destinations, activities, or travel planning!`;
  }
  
  // Default response for other queries - more conversational
  return `I'd be happy to help you with that! As your TourJet travel assistant, I can help with:

• **Trip Planning:** Creating detailed itineraries and travel plans
• **Destination Recommendations:** Suggesting places based on your interests  
• **Budget Planning:** Helping you plan costs and find deals
• **Travel Tips:** Sharing insider knowledge and best practices
• **Route Planning:** Optimizing your travel routes and transportation
• **General Travel Questions:** Any travel-related queries you might have

Feel free to ask me anything about travel - I'm here to help make your travel planning easier and more enjoyable! ✈️`;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context } = body;

    // Input validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Query is required and must be a non-empty string',
          response: 'Please provide a valid question or message.',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    if (query.length > 1000) {
      return NextResponse.json(
        { 
          error: 'Query too long',
          response: 'Your message is too long. Please keep it under 1000 characters.',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Get response based on query
    const response = getTravelResponse(query.trim());

    return NextResponse.json({
      response: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return a user-friendly error response
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        response: 'Sorry, I encountered an error processing your request. Please try again in a moment.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
