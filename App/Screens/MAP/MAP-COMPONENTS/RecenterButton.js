/**
 * RecenterButton.js — Reskinned recenter / my-location FAB
 *
 * Circular (42px), white background, blue navigation icon, premium shadow.
 * Press-in spring scale feedback.
 */

import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ms, vs } from '../../../Reusable-Component';

const NAV_BAR_HEIGHT = vs(80);

const RecenterButton = ({ onPress }) => {
  const insets = useSafeAreaInsets();
  const scale  = useRef(new Animated.Value(1)).current;

  const bottomOffset = NAV_BAR_HEIGHT + Math.max(insets.bottom, vs(8)) + vs(16) + ms(42) + ms(12);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 200,
    }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, { bottom: bottomOffset, transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.btn}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityLabel="Re-center map to my location"
      >
        <Ionicons name="locate" size={ms(18)} color="#2563EB" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: ms(25),
     top: ms(775),
    zIndex: 20,
  },
  btn: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(21),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
});

export default RecenterButton;
