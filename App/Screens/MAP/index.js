import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const MapScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Map Screen (App/Screens/MAP/index.js)</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, fontWeight: 'bold' }
});

export default MapScreen;
