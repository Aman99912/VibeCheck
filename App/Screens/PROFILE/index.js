import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const ProfileScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Profile Screen (App/Screens/PROFILE/index.js)</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, fontWeight: 'bold' }
});

export default ProfileScreen;