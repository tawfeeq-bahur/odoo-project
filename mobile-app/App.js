import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import AppNavigator from './src/navigation/AppNavigator';
import { AppStateProvider } from './src/context/AppStateContext';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppStateProvider>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor="#0f172a" />
              <AppNavigator />
            </NavigationContainer>
          </AppStateProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
