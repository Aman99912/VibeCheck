import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { CText, AppIcon, Colors, ms, vs } from '../../../../../Reusable-Component';

const VisibilitySelector = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <CText variant="body3" weight="semibold" style={styles.label}>
        Visibility
      </CText>
      
      <TouchableOpacity 
        style={styles.inputContainer} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.leftContent}>
          <View style={styles.iconWrapper}>
            <AppIcon family="Feather" name="globe" size={ms(20)} color={Colors.primary} />
          </View>
          <View>
            <CText variant="body2" weight="medium" style={styles.titleText}>
              Public
            </CText>
            <CText variant="caption" weight="regular" style={styles.subText}>
              Anyone on VibeCheck can join
            </CText>
          </View>
        </View>

        <AppIcon family="Feather" name="chevron-right" size={ms(20)} color={Colors.textMuted || '#888'} />
      </TouchableOpacity>
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
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
  },
  iconWrapper: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: Colors.primary + '15', // light primary tint
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: Colors.text,
  },
  subText: {
    color: Colors.textMuted || '#888',
    marginTop: vs(2),
  },
});

export default VisibilitySelector;
