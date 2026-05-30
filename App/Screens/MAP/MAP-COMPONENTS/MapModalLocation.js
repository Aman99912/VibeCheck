import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, CText, ms, vs } from '../../../Reusable-Component';

const MapModalLocation = ({ onRequestPermission, isSettingsFallback }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon / Graphic */}
        <View style={styles.iconCircle}>
          <MaterialIcons name="location-on" size={ms(40)} color={Colors.primary} />
        </View>

        <CText variant="h4" weight="bold" style={styles.title}>
          Location Required
        </CText>

        <CText variant="body2" weight="regular" style={styles.subtitle}>
          {isSettingsFallback
            ? "We need your location to show activities around you. It seems you've denied the permission. Please enable it from your device settings."
            : "We need your location to show activities around you and connect you with people nearby."}
        </CText>

        <TouchableOpacity 
          style={styles.button} 
          onPress={onRequestPermission}
          activeOpacity={0.8}
        >
          <CText variant="button" weight="semibold" style={styles.buttonText}>
            {isSettingsFallback ? "Open Settings" : "Allow Location Access"}
          </CText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 243, 240, 0.95)', // Match Voyager land bg with slight opacity
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensure it covers everything
    padding: ms(24),
  },
  content: {
    backgroundColor: Colors.white,
    borderRadius: ms(24),
    padding: ms(24),
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(40),
    backgroundColor: Colors.primary + '15', // light primary
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(20),
  },
  title: {
    textAlign: 'center',
    color: Colors.text,
    marginBottom: vs(12),
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.textMuted,
    marginBottom: vs(32),
    lineHeight: vs(22),
  },
  button: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: vs(14),
    borderRadius: ms(16),
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: ms(14),
  },
});

export default MapModalLocation;
