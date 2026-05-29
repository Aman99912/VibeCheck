/**
 * App.js
 * VibeMatch App Entry Point.
 * Wraps the app in Navigation/SafeArea and controls authentication gating.
 */

import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AuthFlow from './App/Screens/AUTH';
import MapScreen from './App/Screens/MAP';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isLoggedIn ? (
          <MapScreen onLogout={() => setIsLoggedIn(false)} />
        ) : (
          <AuthFlow onLoginSuccess={() => setIsLoggedIn(true)} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
