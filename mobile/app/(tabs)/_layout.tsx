import { Tabs } from 'expo-router';
import { Home, Calendar, Map, BarChart3, User } from 'lucide-react-native';
import { colors } from '../../src/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.light.primary,
                tabBarInactiveTintColor: colors.light.textSecondary,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.light.background,
                    borderTopColor: colors.light.border,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: 'Calendar',
                    tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="guide"
                options={{
                    title: 'Routes',
                    tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="reports"
                options={{
                    title: 'Reports',
                    tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
