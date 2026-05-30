import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { CText, AppIcon, Colors, ms, vs } from '../../../../../Reusable-Component';

const CounterInput = ({ label = 'People Limit', value, onValueChange, min = 2, max = 20 }) => {
  const handleDecrement = () => {
    if (value > min) onValueChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onValueChange(value + 1);
  };

  return (
    <View style={styles.container}>
      <CText variant="body3" weight="semibold" style={styles.label}>
        {label}
      </CText>
      
      <View style={styles.inputContainer}>
        <CText variant="body2" weight="medium" style={styles.valueText}>
          {value} People
        </CText>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.btn, value <= min && styles.btnDisabled]} 
            onPress={handleDecrement}
            disabled={value <= min}
          >
            <AppIcon family="Feather" name="minus" size={ms(18)} color={value <= min ? Colors.textMuted : Colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.btn, value >= max && styles.btnDisabled]} 
            onPress={handleIncrement}
            disabled={value >= max}
          >
            <AppIcon family="Feather" name="plus" size={ms(18)} color={value >= max ? Colors.textMuted : Colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: vs(10),
    paddingHorizontal: ms(16),
  },
  label: {
    color: Colors.text,
    marginBottom: vs(8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: ms(12),
    paddingHorizontal: ms(16),
    paddingVertical: vs(12),
  },
  valueText: {
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
  },
  btn: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: Colors.lightBackground || '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});

export default CounterInput;
