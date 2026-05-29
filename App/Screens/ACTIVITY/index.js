import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const ActivityScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Activity Screen (App/Screens/ACTIVITY/index.js)</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, fontWeight: 'bold' }
});

export default ActivityScreen;
