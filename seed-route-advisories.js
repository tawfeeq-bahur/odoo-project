// Seed script: Populate route_advisories collection with sample data
// Run with: node seed-route-advisories.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI_ADMIN || process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_ADMIN || 'admin_db';

const sampleAdvisories = [
  // ─── Political Rallies ──────────────────────────────────
  {
    type: 'political_rally',
    severity: 'critical',
    title: 'DMK Party Rally – Madurai',
    description: 'Major political rally organized near Periyar Bus Stand area. Heavy police barricades and road diversions expected. Anna Nagar Main Road and Bypass Road will be blocked from 8 AM to 6 PM.',
    affectedAreas: ['madurai'],
    affectedStreets: ['Anna Nagar Main Road', 'Periyar Bus Stand Road', 'Bypass Road', 'Goripalayam Junction'],
    startDate: '2026-03-15',
    endDate: '2026-03-15',
    timeSlot: '08:00 - 18:00',
    recommendation: 'Avoid Periyar Bus Stand area completely. Use Madurai-Melur Road or take the outer ring road via Kappalur to reach your destination.',
    source: 'District Administration',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    type: 'political_rally',
    severity: 'warning',
    title: 'AIADMK Protest March – Chennai',
    description: 'Protest march from Marina Beach to Valluvarkottam. Kamarajar Salai and Cathedral Road may face traffic blocks during the procession.',
    affectedAreas: ['chennai'],
    affectedStreets: ['Kamarajar Salai', 'Cathedral Road', 'Anna Salai (partial)', 'RK Salai'],
    startDate: '2026-03-18',
    endDate: '2026-03-18',
    timeSlot: '10:00 - 15:00',
    recommendation: 'Use Inner Ring Road or OMR to bypass the affected zone. ECR is clear for south-bound travel.',
    source: 'Chennai Traffic Police',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    type: 'political_rally',
    severity: 'warning',
    title: 'Political Campaign – Coimbatore',
    description: 'Election campaign rally near Town Hall area. Avinashi Road section near Gandhipuram will have traffic restrictions.',
    affectedAreas: ['coimbatore'],
    affectedStreets: ['Avinashi Road (Gandhipuram section)', 'Town Hall Road', 'Big Bazaar Street'],
    startDate: '2026-03-20',
    endDate: '2026-03-20',
    timeSlot: '14:00 - 19:00',
    recommendation: 'Use Trichy Road or Mettupalayam Road to bypass Gandhipuram. Sathyamangalam Road is also clear.',
    source: 'Coimbatore City Police',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // ─── Festivals ──────────────────────────────────────────
  {
    type: 'festival',
    severity: 'warning',
    title: 'Chithirai Thiruvizha – Madurai',
    description: 'Annual Chithirai Festival at Meenakshi Amman Temple. Massive crowd gathering expected around East Masi Street, South Masi Street and temple surroundings. Streets will be extremely crowded.',
    affectedAreas: ['madurai'],
    affectedStreets: ['East Masi Street', 'South Masi Street', 'West Masi Street', 'North Masi Street', 'Meenakshi Temple surroundings'],
    startDate: '2026-04-14',
    endDate: '2026-04-28',
    timeSlot: '06:00 - 22:00',
    recommendation: 'Park vehicles at Mattuthavani or Periyar Bus Stand parking and walk to temple area. Auto-rickshaws are available. Do NOT try to drive through Masi Streets during festival time.',
    source: 'Madurai Tourism',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    type: 'festival',
    severity: 'warning',
    title: 'Pongal Festival Week – All Tamil Nadu',
    description: 'Pongal festival celebrations across Tamil Nadu. Jallikattu events in Madurai, Sivaganga, Pudukkottai districts will cause major road diversions near event venues.',
    affectedAreas: ['madurai', 'sivaganga', 'pudukkottai', 'trichy', 'salem', 'chennai', 'coimbatore'],
    affectedStreets: ['Alanganallur Road (Madurai)', 'Palamedu Road', 'Various village roads'],
    startDate: '2026-01-14',
    endDate: '2026-01-17',
    timeSlot: '07:00 - 18:00',
    recommendation: 'Plan travel early morning or late evening. Highways remain open but village roads near Jallikattu venues will be blocked. Check local announcements.',
    source: 'TN Tourism Department',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    type: 'festival',
    severity: 'info',
    title: 'Mylapore Festival – Chennai',
    description: 'Cultural festival around Kapaleeshwarar Temple, Mylapore. Streets around the temple will have stalls and processions causing slow traffic.',
    affectedAreas: ['chennai'],
    affectedStreets: ['Kutchery Road', 'Mylapore Tank area', 'South Mada Street', 'North Mada Street'],
    startDate: '2026-03-10',
    endDate: '2026-03-16',
    timeSlot: '16:00 - 22:00',
    recommendation: 'Use Dr. Radhakrishnan Salai or TTK Road to bypass Mylapore area during evening hours. Morning travel through the area is fine.',
    source: 'Chennai Corporation',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    type: 'festival',
    severity: 'warning',
    title: 'Thaipusam Festival – Palani',
    description: 'Thaipusam celebrations at Palani Murugan Temple. Lakhs of devotees expected. Palani town roads will be extremely congested.',
    affectedAreas: ['palani', 'dindigul', 'madurai', 'coimbatore'],
    affectedStreets: ['Palani Main Road', 'Dindigul-Palani Highway', 'Temple surroundings'],
    startDate: '2026-02-11',
    endDate: '2026-02-12',
    timeSlot: '00:00 - 23:59',
    recommendation: 'If passing through Dindigul-Palani route, leave very early (before 4 AM) or travel next day. Use Oddanchatram bypass if possible.',
    source: 'Dindigul District Admin',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // ─── Road Blocks / Construction ─────────────────────────
  {
    type: 'construction',
    severity: 'warning',
    title: 'NH-44 Road Widening – Krishnagiri to Dharmapuri',
    description: 'National Highway 44 widening work in progress between Krishnagiri and Dharmapuri. Single-lane traffic on multiple stretches causing 30-45 min delays.',
    affectedAreas: ['krishnagiri', 'dharmapuri', 'hosur', 'bangalore'],
    affectedStreets: ['NH-44 (Krishnagiri-Dharmapuri stretch)', 'Toppur bypass'],
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    timeSlot: '08:00 - 20:00',
    recommendation: 'Travel early morning (before 6 AM) or late night to avoid construction delays. Alternatively, use Vaniyambadi-Tirupattur route.',
    source: 'NHAI',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    type: 'road_block',
    severity: 'critical',
    title: 'Bridge Repair – Vaigai Bridge, Madurai',
    description: 'Emergency repair work on Vaigai River Bridge near Tamukkam Grounds. One side of the bridge is completely closed. Heavy congestion during peak hours.',
    affectedAreas: ['madurai'],
    affectedStreets: ['Vaigai Bridge', 'Tamukkam Road', 'Alagarkoil Road approach'],
    startDate: '2026-03-01',
    endDate: '2026-04-15',
    timeSlot: '07:00 - 21:00',
    recommendation: 'Use Sellur Bridge or the new ring road bridge to cross Vaigai River. Avoid Tamukkam area during 8-10 AM and 5-7 PM.',
    source: 'Madurai Corporation',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    type: 'construction',
    severity: 'info',
    title: 'Metro Construction – Chennai OMR',
    description: 'Chennai Metro Phase 2 construction on OMR (Sholinganallur to Siruseri). Road dividers shifted, speed limit reduced to 40 kmph.',
    affectedAreas: ['chennai'],
    affectedStreets: ['OMR (Sholinganallur to Siruseri)', 'Thoraipakkam Junction', 'Perungudi signal'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    timeSlot: '00:00 - 23:59',
    recommendation: 'Allow extra 20-30 minutes if travelling via OMR. ECR is a good alternative for reaching south Chennai. Use Velachery-Tambaram route for IT corridor.',
    source: 'CMRL',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // ─── Traffic Peak Hours ─────────────────────────────────
  {
    type: 'traffic_peak',
    severity: 'info',
    title: 'Peak Traffic Hours – Chennai',
    description: 'Daily peak traffic on major corridors. Anna Salai, Mount Road, GST Road, and OMR experience heavy congestion during office hours.',
    affectedAreas: ['chennai'],
    affectedStreets: ['Anna Salai', 'GST Road', 'OMR', 'Mount Road', 'Poonamallee High Road'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    timeSlot: '08:30 - 10:30, 17:00 - 20:00',
    recommendation: 'Start before 7 AM or after 10:30 AM for smooth travel. Evening return journeys should start before 5 PM or after 8 PM.',
    source: 'Chennai Traffic Police',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    type: 'traffic_peak',
    severity: 'info',
    title: 'Weekend Temple Rush – Rameswaram',
    description: 'Friday-Sunday heavy pilgrim traffic on Pamban Bridge and Rameswaram town roads. Queue at Ramanathaswamy Temple can extend to main road.',
    affectedAreas: ['rameswaram', 'rameshwaram', 'ramanathapuram'],
    affectedStreets: ['Pamban Bridge', 'Rameswaram Main Road', 'Temple surroundings'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    timeSlot: '06:00 - 12:00 (Weekends)',
    recommendation: 'Visit on weekdays if possible. If weekend, reach before 5 AM. Travel from Madurai — start by 3 AM to reach before crowd.',
    source: 'Rameswaram Temple Authority',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // ─── Weather Alerts ─────────────────────────────────────
  {
    type: 'weather',
    severity: 'warning',
    title: 'Heavy Rainfall – Nilgiris / Ooty',
    description: 'Heavy rainfall expected in Nilgiris district. Landslide-prone zones on Ooty-Coonoor ghat road. Fog reduces visibility below 50 meters in early morning.',
    affectedAreas: ['ooty', 'coonoor', 'nilgiris', 'kotagiri', 'coimbatore'],
    affectedStreets: ['Ooty-Coonoor Ghat Road', 'Mettupalayam-Ooty road', 'Kotagiri hairpin bends'],
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    timeSlot: '04:00 - 09:00 (Fog), Anytime (Rain)',
    recommendation: 'Avoid ghat road travel before 9 AM due to fog. Drive slowly on hairpin bends. Check weather report before starting. Carry chains for tyres if heavy rain.',
    source: 'IMD Chennai',
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // ─── Best Time to Travel ────────────────────────────────
  {
    type: 'best_time',
    severity: 'info',
    title: 'Best Time: Chennai to Madurai (NH-44)',
    description: 'The best time to travel Chennai to Madurai via NH-44 is early morning. You will avoid city traffic in Chennai, construction zones in Krishnagiri, and reach Madurai before evening rush.',
    affectedAreas: ['chennai', 'madurai', 'krishnagiri', 'dindigul', 'trichy'],
    affectedStreets: ['NH-44', 'GST Road', 'Madurai Bypass'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    timeSlot: '04:00 - 05:30 AM departure',
    recommendation: 'Leave Chennai by 4-5 AM. You will cross Krishnagiri construction zone before 8 AM (low traffic). Stop at Dindigul for breakfast. Reach Madurai by 12-1 PM comfortably.',
    source: 'Travel Advisory',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    type: 'best_time',
    severity: 'info',
    title: 'Best Time: Chennai to Pondicherry (ECR)',
    description: 'The scenic East Coast Road (ECR) route is best enjoyed in early morning. Cool breeze, less traffic, and beautiful sunrise views along the coast.',
    affectedAreas: ['chennai', 'pondicherry', 'puducherry', 'mahabalipuram'],
    affectedStreets: ['ECR (East Coast Road)', 'Mahabalipuram stretch'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    timeSlot: '05:00 - 06:00 AM departure',
    recommendation: 'Leave by 5-6 AM from Chennai. Stop at Mahabalipuram for sunrise. Reach Pondicherry by 9-10 AM. Avoid Friday evening and Sunday evening — heavy return traffic.',
    source: 'Travel Advisory',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    type: 'best_time',
    severity: 'info',
    title: 'Best Time: Coimbatore to Ooty',
    description: 'The Mettupalayam-Ooty ghat road has 36 hairpin bends. Best to travel after fog clears. Night travel is risky due to wild animals crossing.',
    affectedAreas: ['coimbatore', 'ooty', 'coonoor', 'mettupalayam', 'nilgiris'],
    affectedStreets: ['Mettupalayam-Ooty Ghat Road', 'Coonoor hairpin bends'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    timeSlot: '09:00 - 10:00 AM departure from Coimbatore',
    recommendation: 'Leave Coimbatore by 9-10 AM. Fog clears by then on the ghat road. Reach Ooty by 12-1 PM. Avoid travel after 5 PM — fog returns and visibility drops sharply.',
    source: 'Nilgiris District Travel Guide',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    type: 'best_time',
    severity: 'info',
    title: 'Best Time: Madurai to Rameswaram',
    description: 'Pamban Bridge traffic is lightest in early morning. Temple darshan queue is shortest before 7 AM. Afternoon heat makes the journey uncomfortable.',
    affectedAreas: ['madurai', 'rameswaram', 'rameshwaram', 'ramanathapuram'],
    affectedStreets: ['NH-87', 'Pamban Bridge', 'Rameswaram Temple Road'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    timeSlot: '03:00 - 04:00 AM departure from Madurai',
    recommendation: 'Leave Madurai by 3-4 AM. Cross Pamban Bridge before sunrise (stunning view!). Reach temple by 6 AM for quick darshan. Return by noon to avoid afternoon heat.',
    source: 'Travel Advisory',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    type: 'best_time',
    severity: 'info',
    title: 'Best Time: Chennai to Bangalore (NH-48)',
    description: 'The Chennai-Bangalore highway is one of the busiest corridors. Toll plazas near Vellore and Kanchipuram cause delays during peak hours.',
    affectedAreas: ['chennai', 'bangalore', 'bengaluru', 'vellore', 'kanchipuram'],
    affectedStreets: ['NH-48', 'Chennai-Bangalore Highway', 'Vellore bypass'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    timeSlot: '05:00 - 06:00 AM or 22:00 - 23:00 PM departure',
    recommendation: 'Early morning or late night travel is best. Avoid Friday evening (Chennai→Bangalore) and Sunday evening (Bangalore→Chennai) — extreme traffic. FASTag mandatory at all toll plazas.',
    source: 'Travel Advisory',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

async function seedAdvisories() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const collection = db.collection('route_advisories');

    // Clear existing advisories (optional)
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`🗑️  Clearing ${existingCount} existing advisories...`);
      await collection.deleteMany({});
    }

    // Insert sample data
    const result = await collection.insertMany(sampleAdvisories);
    console.log(`✅ Inserted ${result.insertedCount} route advisories!`);

    // Create indexes for efficient querying
    await collection.createIndex({ affectedAreas: 1 });
    await collection.createIndex({ type: 1 });
    await collection.createIndex({ isActive: 1 });
    await collection.createIndex({ startDate: 1, endDate: 1 });
    console.log('✅ Indexes created');

    // Print summary
    console.log('\n📋 Advisory Summary:');
    const types = await collection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    types.forEach(t => console.log(`   ${t._id}: ${t.count}`));

    const areas = await collection.aggregate([
      { $unwind: '$affectedAreas' },
      { $group: { _id: '$affectedAreas', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    console.log('\n📍 Covered Areas:');
    areas.forEach(a => console.log(`   ${a._id}: ${a.count} advisories`));

  } catch (error) {
    console.error('❌ Error seeding advisories:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

seedAdvisories();
