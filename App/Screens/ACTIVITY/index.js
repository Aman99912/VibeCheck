/**
 * index.js
 * Activity Dashboard Screen.
 * Displays simple logged-in dashboard and provides logout functionality.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, CText, AppButton, ms, vs } from '../../Reusable-Component';

const ActivityScreen = ({ onLogout }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CText variant="h1" weight="bold" color={Colors.textPrimary} align="center">
          Activity Dashboard
        </CText>
        <CText variant="body" color={Colors.textSecondary} align="center" style={styles.subtitle}>
          Welcome back to VibeCheck! You have successfully logged in.
        </CText>
        
        <AppButton
          text="Logout"
          onPress={onLogout}
          type="outline"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ms(24),
  },
  subtitle: {
    marginTop: vs(12),
    marginBottom: vs(32),
  },
  button: {
    width: '100%',
    maxWidth: ms(200),
  },
});

export default ActivityScreen;
