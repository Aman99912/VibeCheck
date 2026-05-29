import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, CText, ms, vs } from '../../../Reusable-Component';

const CreatePinButton = ({ onCreatePress, onRecenterPress }) => {
  return (
    <View style={styles.container}>
      {/* Recenter Button */}
      <TouchableOpacity 
        style={styles.recenterButton} 
        onPress={onRecenterPress}
        activeOpacity={0.8}
      >
        <MaterialIcons name="my-location" size={ms(22)} color={Colors.text} />
      </TouchableOpacity>

      {/* Create Pin FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={onCreatePress}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={ms(20)} color={Colors.primary} />
        <CText variant="button" weight="semibold" style={styles.fabText}>
          Create Pin
        </CText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: vs(20),
    right: ms(16),
    alignItems: 'flex-end',
    zIndex: 10,
  },
  recenterButton: {
    backgroundColor: Colors.white,
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(12),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: ms(16),
    paddingVertical: vs(12),
    borderRadius: ms(30),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  fabText: {
    marginLeft: ms(6),
    color: Colors.text,
  },
});

export default CreatePinButton;
