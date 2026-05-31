/**
 * LocationSelector.js — Redesigned location pill
 *
 * Now positioned in the center (used by MapHeader; kept as standalone for
 * screens that need it independently).  The MapHeader version is preferred.
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ms, vs, normFont } from '../../../Reusable-Component';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LocationSelector = ({ locationName = 'Current Location', onPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: Math.max(insets.top, vs(10)) + vs(10) }]}>
      <TouchableOpacity
        style={styles.pill}
        onPress={onPress}
        activeOpacity={0.97}
        accessibilityLabel={`Location: ${locationName}`}
      >
        {/* Blue "you are here" dot */}
        <View style={styles.locationDot} />
        <Text style={styles.locationText} numberOfLines={1}>
          {locationName}
        </Text>
        <Ionicons name="chevron-down" size={ms(14)} color="#888888" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    left: ms(70),   // leave space for hamburger
    right: ms(100), // leave space for bell + settings
    zIndex: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    borderRadius: ms(20),
    paddingVertical: vs(14),
    paddingLeft: ms(8),
    paddingRight: ms(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  locationDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: '#2563EB',
    flexShrink: 0,
  },
  locationText: {
    flex: 1,
    fontSize: normFont(14),
    fontWeight: '600',
    color: '#111111',
    letterSpacing: -0.2,
  },
});

export default LocationSelector;
