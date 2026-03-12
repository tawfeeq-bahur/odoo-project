import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../utils/colors';

// ─── Screens ──────────────────────────────────────────────────────────────────
import HomeScreen from '../screens/HomeScreen';
import TourDetailScreen from '../screens/TourDetailScreen';
import JoinTourScreen from '../screens/JoinTourScreen';
import MembersScreen from '../screens/MembersScreen';
import ReportsScreen from '../screens/ReportsScreen';

import CalendarScreen from '../screens/CalendarScreen';
import PlanRouteScreen from '../screens/PlanRouteScreen';
import AIDemoScreen from '../screens/AIDemoScreen';
import TransliterationScreen from '../screens/TransliterationScreen';

import TripsScreen from '../screens/TripsScreen';
import ScannerScreen from '../screens/ScannerScreen';
import SupportScreen from '../screens/SupportScreen';

import EmployeesScreen from '../screens/EmployeesScreen';
import EmployeeDetailScreen from '../screens/EmployeeDetailScreen';
import RoutesScreen from '../screens/RoutesScreen';
import TripSummaryScreen from '../screens/TripSummaryScreen';

import ProfileScreen from '../screens/ProfileScreen';
import SOSScreen from '../screens/SOSScreen';

// ─── Stack navigators for each tab ───────────────────────────────────────────
const HomeStack = createStackNavigator();
const ExploreStack = createStackNavigator();
const TripsStack = createStackNavigator();
const ManageStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HEADER_OPTIONS = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.textPrimary,
  headerTitleStyle: { fontWeight: '700', fontSize: 17 },
};

// ── Home Tab Stack ─────────────────────────────────────────────────────────
function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={HEADER_OPTIONS}>
      <HomeStack.Screen name="Dashboard" component={HomeScreen} options={{ title: 'TourJet' }} />
      <HomeStack.Screen name="TourDetail" component={TourDetailScreen} options={{ title: 'Tour Details' }} />
      <HomeStack.Screen name="JoinTour" component={JoinTourScreen} options={{ title: 'Join a Tour' }} />
      <HomeStack.Screen name="Members" component={MembersScreen} options={{ title: 'Manage Members' }} />
      <HomeStack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Analytics' }} />
    </HomeStack.Navigator>
  );
}

// ── Explore Tab Stack ───────────────────────────────────────────────────────
function ExploreStackNav() {
  return (
    <ExploreStack.Navigator screenOptions={HEADER_OPTIONS}>
      <ExploreStack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Travel Calendar' }} />
      <ExploreStack.Screen name="PlanRoute" component={PlanRouteScreen} options={{ title: 'Plan a Route' }} />
      <ExploreStack.Screen name="AIDemo" component={AIDemoScreen} options={{ title: 'AI Assistant' }} />
      <ExploreStack.Screen name="Transliteration" component={TransliterationScreen} options={{ title: 'Transliteration' }} />
    </ExploreStack.Navigator>
  );
}

// ── Trips Tab Stack ──────────────────────────────────────────────────────────
function TripsStackNav() {
  return (
    <TripsStack.Navigator screenOptions={HEADER_OPTIONS}>
      <TripsStack.Screen name="Trips" component={TripsScreen} options={{ title: 'My Trips' }} />
      <TripsStack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Log Expense' }} />
      <TripsStack.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
    </TripsStack.Navigator>
  );
}

// ── Manage Tab Stack ──────────────────────────────────────────────────────────
function ManageStackNav() {
  return (
    <ManageStack.Navigator screenOptions={HEADER_OPTIONS}>
      <ManageStack.Screen name="Employees" component={EmployeesScreen} options={{ title: 'Employees' }} />
      <ManageStack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} options={{ title: 'Employee Profile' }} />
      <ManageStack.Screen name="Routes" component={RoutesScreen} options={{ title: 'Routes' }} />
      <ManageStack.Screen name="TripSummary" component={TripSummaryScreen} options={{ title: 'Live Trip Summary' }} />
    </ManageStack.Navigator>
  );
}

// ── Profile Tab Stack ─────────────────────────────────────────────────────────
function ProfileStackNav() {
  return (
    <ProfileStack.Navigator screenOptions={HEADER_OPTIONS}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <ProfileStack.Screen name="SOS" component={SOSScreen} options={{ title: 'Emergency SOS' }} />
    </ProfileStack.Navigator>
  );
}

// ─── Tab Icon Helper ──────────────────────────────────────────────────────────
function TabIcon({ name, focused, color, size }) {
  return <Ionicons name={name} size={size} color={color} />;
}

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────────
export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNav}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStackNav}
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'compass' : 'compass-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="TripsTab"
        component={TripsStackNav}
        options={{
          title: 'Trips',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'airplane' : 'airplane-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ManageTab"
        component={ManageStackNav}
        options={{
          title: 'Manage',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'settings' : 'settings-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNav}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
