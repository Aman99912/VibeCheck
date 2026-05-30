import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { CText, Colors, ms, vs } from '../../../Reusable-Component';

const SectionHeader = ({ title, badgeCount, subtitle, subtitleColor, showDot, showViewAll, onViewAll }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <CText variant="h4" weight="bold" color={Colors.textPrimary}>
          {title}
        </CText>

        {showDot && (
          <View style={styles.dot} />
        )}

        {subtitle && (
          <CText variant="bodySmall" weight="semibold" color={subtitleColor || Colors.success} style={styles.subtitle}>
            {subtitle}
          </CText>
        )}

        {badgeCount != null && (
          <View style={styles.badge}>
            <CText variant="label" weight="bold" color={Colors.white}>
              {badgeCount}
            </CText>
          </View>
        )}
      </View>

      {showViewAll && (
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <CText variant="bodySmall" weight="semibold" color={Colors.primary}>
            View All
          </CText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    marginBottom: vs(12),
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  dot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: Colors.success,
  },
  subtitle: {
    marginLeft: ms(2),
  },
  badge: {
    minWidth: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(6),
  },
});

export default SectionHeader;
