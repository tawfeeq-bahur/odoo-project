import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { colors, spacing, typography } from '../../src/theme';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useApp();
    const router = useRouter();

    const handleLogin = () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter username and password');
            return;
        }

        const success = login(username, password);
        if (success) {
            router.replace('/(tabs)');
        } else {
            Alert.alert('Login Failed', 'Invalid credentials. Try password: "password"');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>🌏 TourJet</Text>
                <Text style={styles.subtitle}>Your AI Travel Companion</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter username"
                        autoCapitalize="none"
                        placeholderTextColor={colors.light.textSecondary}
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter password"
                        secureTextEntry
                        placeholderTextColor={colors.light.textSecondary}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>

                    <Text style={styles.hint}>
                        💡 Demo: username = "Arun", password = "password"
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    title: {
        fontSize: typography.sizes.xxxl,
        fontWeight: typography.weights.bold,
        color: colors.light.primary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.sizes.lg,
        color: colors.light.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xxl,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.light.text,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.light.card,
        borderWidth: 1,
        borderColor: colors.light.border,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.sizes.md,
        marginBottom: spacing.md,
        color: colors.light.text,
    },
    button: {
        backgroundColor: colors.light.primary,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
    },
    hint: {
        marginTop: spacing.lg,
        fontSize: typography.sizes.sm,
        color: colors.light.textSecondary,
        textAlign: 'center',
    },
});
