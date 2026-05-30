import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, ms, vs } from '../../../Reusable-Component';

const RecenterButton = ({ onPress }) => {
  const insets = useSafeAreaInsets();
  // Position it dynamically above the floating absolute bottom tab bar (NavBar height: 88 + bottom margin: max(insets, 12) + gap: 16)
  const bottomOffset = vs(88) + Math.max(insets.bottom, vs(12)) + vs(16);

  return (
    <TouchableOpacity 
      style={[styles.recenterButton, { bottom: bottomOffset }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialIcons name="my-location" size={ms(22)} color={Colors.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  recenterButton: {
    position: 'absolute',
    right: ms(26),
    backgroundColor: Colors.white,
    width: ms(54),
    height: ms(54),
    borderRadius: ms(22),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
});

export default RecenterButton;
