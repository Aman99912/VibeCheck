/**
 * App.js
 * VibeMatch App Entry Point.
 * Wraps the app in Navigation/SafeArea and controls authentication gating.
 */

import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthFlow from './App/Screens/AUTH';
import MainTabs from './App/Screens/MAIN';
import CreatePinScreen from './App/Screens/MAP/MAP-SCREENS/Create-Request';

const Stack = createNativeStackNavigator();

function MainStack({ onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs">
        {(props) => <MainTabs {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="CreatePin" component={CreatePinScreen} />
    </Stack.Navigator>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isLoggedIn ? (
          <MainStack onLogout={() => setIsLoggedIn(false)} />
        ) : (
          <AuthFlow onLoginSuccess={() => setIsLoggedIn(true)} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
