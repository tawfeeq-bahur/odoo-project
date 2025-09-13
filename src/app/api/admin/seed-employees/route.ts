import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeCollection } from '@/lib/mongodb';
import { EmployeeProfile } from '@/lib/types';

// Realistic fleet employee data
const fleetEmployees = [
  {
    name: "Michael Rodriguez",
    employeeId: "EMP001",
    email: "michael.rodriguez@fleetflow.com",
    phone: "+1-555-0101",
    department: "Operations",
    position: "Senior Driver",
    assignedVehicleId: "vehicle_001",
    emergencyContacts: [
      { name: "Maria Rodriguez", phone: "+1-555-0102", relationship: "Spouse" },
      { name: "Carlos Rodriguez", phone: "+1-555-0103", relationship: "Brother" }
    ]
  },
  {
    name: "Sarah Johnson",
    employeeId: "EMP002",
    email: "sarah.johnson@fleetflow.com",
    phone: "+1-555-0201",
    department: "Operations",
    position: "Driver",
    assignedVehicleId: "vehicle_002",
    emergencyContacts: [
      { name: "David Johnson", phone: "+1-555-0202", relationship: "Husband" },
      { name: "Lisa Johnson", phone: "+1-555-0203", relationship: "Sister" }
    ]
  },
  {
    name: "James Wilson",
    employeeId: "EMP003",
    email: "james.wilson@fleetflow.com",
    phone: "+1-555-0301",
    department: "Operations",
    position: "Driver",
    assignedVehicleId: "vehicle_003",
    emergencyContacts: [
      { name: "Emily Wilson", phone: "+1-555-0302", relationship: "Wife" },
      { name: "Robert Wilson", phone: "+1-555-0303", relationship: "Father" }
    ]
  },
  {
    name: "Lisa Chen",
    employeeId: "EMP004",
    email: "lisa.chen@fleetflow.com",
    phone: "+1-555-0401",
    department: "Operations",
    position: "Driver",
    assignedVehicleId: null,
    emergencyContacts: [
      { name: "Kevin Chen", phone: "+1-555-0402", relationship: "Husband" },
      { name: "Amy Chen", phone: "+1-555-0403", relationship: "Mother" }
    ]
  },
  {
    name: "Robert Martinez",
    employeeId: "EMP005",
    email: "robert.martinez@fleetflow.com",
    phone: "+1-555-0501",
    department: "Operations",
    position: "Driver",
    assignedVehicleId: null,
    emergencyContacts: [
      { name: "Carmen Martinez", phone: "+1-555-0502", relationship: "Wife" },
      { name: "Antonio Martinez", phone: "+1-555-0503", relationship: "Brother" }
    ]
  },
  {
    name: "Jennifer Davis",
    employeeId: "EMP006",
    email: "jennifer.davis@fleetflow.com",
    phone: "+1-555-0601",
    department: "Operations",
    position: "Driver",
    assignedVehicleId: null,
    emergencyContacts: [
      { name: "Mark Davis", phone: "+1-555-0602", relationship: "Husband" },
      { name: "Susan Davis", phone: "+1-555-0603", relationship: "Sister" }
    ]
  },
  {
    name: "Thomas Anderson",
    employeeId: "EMP007",
    email: "thomas.anderson@fleetflow.com",
    phone: "+1-555-0701",
    department: "Operations",
    position: "Driver",
    assignedVehicleId: null,
    emergencyContacts: [
      { name: "Patricia Anderson", phone: "+1-555-0702", relationship: "Wife" },
      { name: "Michael Anderson", phone: "+1-555-0703", relationship: "Son" }
    ]
  },
  {
    name: "Amanda Taylor",
    employeeId: "EMP008",
    email: "amanda.taylor@fleetflow.com",
    phone: "+1-555-0801",
    department: "Operations",
    position: "Driver",
    assignedVehicleId: null,
    emergencyContacts: [
      { name: "John Taylor", phone: "+1-555-0802", relationship: "Husband" },
      { name: "Rachel Taylor", phone: "+1-555-0803", relationship: "Sister" }
    ]
  },
  {
    name: "Christopher Brown",
    employeeId: "EMP009",
    email: "christopher.brown@fleetflow.com",
    phone: "+1-555-0901",
    department: "Operations",
    position: "Driver",
    assignedVehicleId: null,
    emergencyContacts: [
      { name: "Michelle Brown", phone: "+1-555-0902", relationship: "Wife" },
      { name: "Daniel Brown", phone: "+1-555-0903", relationship: "Brother" }
    ]
  },
  {
    name: "Jessica White",
    employeeId: "EMP010",
    email: "jessica.white@fleetflow.com",
    phone: "+1-555-1001",
    department: "Operations",
    position: "Driver",
    assignedVehicleId: null,
    emergencyContacts: [
      { name: "Steven White", phone: "+1-555-1002", relationship: "Husband" },
      { name: "Karen White", phone: "+1-555-1003", relationship: "Mother" }
    ]
  },
  {
    name: "Daniel Garcia",
    employeeId: "EMP011",
    email: "daniel.garcia@fleetflow.com",
    phone: "+1-555-1101",
    department: "Maintenance",
    position: "Fleet Mechanic",
    assignedVehicleId: null,
    emergencyContacts: [
      { name: "Isabella Garcia", phone: "+1-555-1102", relationship: "Wife" },
      { name: "Miguel Garcia", phone: "+1-555-1103", relationship: "Father" }
    ]
  },
  {
    name: "Ashley Miller",
    employeeId: "EMP012",
    email: "ashley.miller@fleetflow.com",
    phone: "+1-555-1201",
    department: "Maintenance",
    position: "Fleet Mechanic",
    assignedVehicleId: null,
    emergencyContacts: [
      { name: "Ryan Miller", phone: "+1-555-1202", relationship: "Husband" },
      { name: "Nicole Miller", phone: "+1-555-1203", relationship: "Sister" }
    ]
  },
  {
    name: "Kevin Thompson",
    employeeId: "EMP013",
    email: "kevin.thompson@fleetflow.com",
    phone: "+1-555-1301",
    department: "Operations",
    position: "Fleet Supervisor",
    assignedVehicleId: null,
    emergencyContacts: [
      { name: "Laura Thompson", phone: "+1-555-1302", relationship: "Wife" },
      { name: "Brian Thompson", phone: "+1-555-1303", relationship: "Brother" }
    ]
  },
  {
    name: "Nicole Lee",
    employeeId: "EMP014",
    email: "nicole.lee@fleetflow.com",
    phone: "+1-555-1401",
    department: "Operations",
    position: "Fleet Coordinator",
    assignedVehicleId: null,
    emergencyContacts: [
      { name: "Jason Lee", phone: "+1-555-1402", relationship: "Husband" },
      { name: "Michelle Lee", phone: "+1-555-1403", relationship: "Sister" }
    ]
  },
  {
    name: "Ryan Clark",
    employeeId: "EMP015",
    email: "ryan.clark@fleetflow.com",
    phone: "+1-555-1501",
    department: "Operations",
    position: "Driver",
    assignedVehicleId: null,
    emergencyContacts: [
      { name: "Stephanie Clark", phone: "+1-555-1502", relationship: "Wife" },
      { name: "Matthew Clark", phone: "+1-555-1503", relationship: "Brother" }
    ]
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clearExisting = false } = body;
    
    const employees = await getEmployeeCollection<EmployeeProfile>('employees');
    
    let clearedCount = 0;
    if (clearExisting) {
      // Clear existing employees
      const deleteResult = await employees.deleteMany({});
      clearedCount = deleteResult.deletedCount || 0;
    }
    
    // Insert new employees
    const employeesToInsert = fleetEmployees.map(emp => ({
      id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...emp,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    const result = await employees.insertMany(employeesToInsert);
    const insertedCount = result.insertedCount || 0;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Employees seeded successfully',
      clearedCount,
      insertedCount,
      totalEmployees: insertedCount
    });
  } catch (error) {
    console.error('Error seeding employees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
