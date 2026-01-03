import { Redirect } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const { user } = useApp();

    if (user === undefined) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return <Redirect href={user ? "/(tabs)" : "/(auth)/login"} />;
}
