import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, CText, ms, vs } from '../../Reusable-Component';

const MapScreen = ({ onLogout }) => {
  return (
    <View style={styles.container}>
      {/* Basic header */}
      <View style={styles.header}>
        <CText variant="h2" weight="bold" color={Colors.textPrimary}>
          Homepage
        </CText>
      </View>

      <View style={styles.content}>
        <CText variant="body" color={Colors.textSecondary} align="center">
          Welcome to the Map / Homepage!
        </CText>
        
        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <CText variant="h3" color={Colors.textMuted}>
            Map View
          </CText>
        </View>

        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <CText color={Colors.white} weight="bold">Logout</CText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: vs(60),
    paddingBottom: vs(20),
    paddingHorizontal: ms(24),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: ms(24),
    alignItems: 'center',
  },
  mapPlaceholder: {
    width: '100%',
    height: vs(300),
    backgroundColor: Colors.gray100,
    borderRadius: ms(16),
    marginTop: vs(24),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  logoutBtn: {
    marginTop: vs(40),
    backgroundColor: Colors.primary,
    paddingVertical: vs(12),
    paddingHorizontal: ms(32),
    borderRadius: ms(24),
  },
});

export default MapScreen;
