import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, ms, vs } from '../../../Reusable-Component';

const RecenterButton = ({ onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.recenterButton} 
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
    bottom: vs(20),
    right: ms(16),
    backgroundColor: Colors.white,
    width: ms(44),
    height: ms(44),
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
