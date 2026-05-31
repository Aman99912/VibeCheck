import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { Colors, CText, normFont, ms, vs } from '../../../../../Reusable-Component';

const DurationSlider = ({ value, onValueChange, min = 1, max = 10 }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [localValue, setLocalValue] = useState(value);
  
  const trackWidthRef = useRef(0);
  const valueRef = useRef(value);
  
  trackWidthRef.current = containerWidth;

  // Keep local value synced if parent changes it
  useEffect(() => {
    setLocalValue(value);
    valueRef.current = value;
  }, [value]);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const trackWidth = trackWidthRef.current;
        if (trackWidth === 0) return;
        
        const moveX = evt.nativeEvent.locationX; 
        
        let percentage = moveX / trackWidth;
        if (percentage < 0) percentage = 0;
        if (percentage > 1) percentage = 1;
        
        const rawValue = min + percentage * (max - min);
        const snappedValue = Math.round(rawValue);
        
        if (snappedValue !== valueRef.current) {
          valueRef.current = snappedValue;
          setLocalValue(snappedValue); // Update locally instantly
        }
      },
      onPanResponderRelease: () => {
        // Only notify parent when user lifts finger to prevent lag
        onValueChange(valueRef.current);
      }
    })
  ).current;

  const percentage = (localValue - min) / (max - min);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CText style={styles.label}>Duration</CText>
        <CText style={styles.valueText}>{localValue} {localValue === 1 ? 'Hour' : 'Hours'}</CText>
      </View>
      
      <View 
        style={styles.trackContainer}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        {/* Background Track */}
        <View style={styles.trackBg} pointerEvents="none" />
        
        {/* Active Track */}
        <View style={[styles.trackActive, { width: `${percentage * 100}%` }]} pointerEvents="none" />
        
        {/* Thumb */}
        <View style={[styles.thumb, { left: `${percentage * 100}%` }]} pointerEvents="none" />
      </View>
      
      <View style={styles.labelsRow}>
        <CText style={styles.minMaxText}>{min} hr</CText>
        <CText style={styles.minMaxText}>{max} hrs</CText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: ms(20),
    marginTop: vs(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  label: {
    fontSize: normFont(12),
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  valueText: {
    fontSize: normFont(14),
    fontWeight: '700',
    color: Colors.primary,
  },
  trackContainer: {
    height: vs(30),
    justifyContent: 'center',
  },
  trackBg: {
    height: vs(6),
    backgroundColor: '#E5E7EB',
    borderRadius: ms(3),
    width: '100%',
    position: 'absolute',
  },
  trackActive: {
    height: vs(6),
    backgroundColor: Colors.primary,
    borderRadius: ms(3),
    position: 'absolute',
  },
  thumb: {
    width: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    backgroundColor: Colors.white,
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.primary,
    transform: [{ translateX: -ms(10) }], // Center thumb on its point
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(8),
  },
  minMaxText: {
    fontSize: normFont(11),
    color: Colors.textMuted,
  },
});

export default DurationSlider;
