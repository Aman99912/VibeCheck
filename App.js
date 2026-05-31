/**
 * App.js
 * VibeMatch App Entry Point.
 * Wraps the app in Navigation/SafeArea and controls authentication gating.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthFlow from './App/Screens/AUTH';
import MainTabs from './App/Screens/MAIN';
import CreatePinScreen from './App/Screens/MAP/MAP-SCREENS/Create-Request';
import NotificationScreen from './App/Screens/MAIN/component-main/notification';

const Stack = createNativeStackNavigator();

function MainStack({ onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs">
        {(props) => <MainTabs {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="CreatePin" component={CreatePinScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>
  );
}

function App() {
  // Prank Maintenance Mode Screen
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.maintenanceContainer}>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Closed Testing</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>Maintenance Mode</Text>
          <Text style={styles.subtitle}>Coming soon</Text>
          <Text style={styles.description}>
            We are currently rolling out a massive new update. Please update the app to continue using VibeMatch.
          </Text>
        </View>
        
        <TouchableOpacity style={styles.updateButton} activeOpacity={0.8}>
          <Text style={styles.updateButtonText}>Update App</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  maintenanceContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  banner: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 20,
  },
  bannerText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default App;
