import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const HighlightsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Highlights Screen (App/Screens/HIGHLIGHTS/index.js)</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, fontWeight: 'bold' }
});

export default HighlightsScreen;
