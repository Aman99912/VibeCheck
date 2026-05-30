import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, CText, ms, vs } from '../../../Reusable-Component';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FilterButton = ({ onPress }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { top: Math.max(insets.top, vs(10)) + vs(10) }]}>
      <TouchableOpacity 
        style={styles.pill} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <MaterialIcons name="filter-list" size={ms(18)} color={Colors.primary} />
        <CText variant="body2" weight="medium" style={styles.text}>
          Filter
        </CText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: ms(16),
    zIndex: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: ms(12),
    paddingVertical: vs(14),
    borderRadius: ms(20),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    marginLeft: ms(4),
    color: Colors.text,
  },
});

export default FilterButton;
