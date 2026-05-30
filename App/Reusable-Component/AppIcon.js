/**
 * AppIcon.js  ─  Icon Wrapper Component
 *
 * A thin, consistent wrapper around react-native-vector-icons MaterialIcons.
 * Handles allowFontScaling, sizing via Scale, and optional badge/dot.
 *
 * Usage:
 *   <AppIcon name="home" />
 *   <AppIcon name="notifications" size={28} color={Colors.primary} badge={3} />
 *   <AppIcon name="check-circle" color={Colors.success} dot />
 *   <AppIcon name="settings" onPress={handleSettings} />
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import Foundation from 'react-native-vector-icons/Foundation';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import CText from './CText';
import Colors from './Colors';
import { ms, vs, normFont } from './Scale';

const getIconComponent = (family) => {
  switch (family) {
    case 'Ionicons':
      return Ionicons;
    case 'Feather':
      return Feather;
    case 'FontAwesome':
      return FontAwesome;
    case 'Entypo':
      return Entypo;
    case 'MaterialCommunityIcons':
      return MaterialCommunityIcons;
    case 'AntDesign':
      return AntDesign;
    case 'SimpleLineIcons':
      return SimpleLineIcons;
    case 'Octicons':
      return Octicons;
    case 'Foundation':
      return Foundation;
    case 'EvilIcons':
      return EvilIcons;
    case 'MaterialIcons':
    default:
      return MaterialIcons;
  }
};

const AppIcon = ({
  family = 'MaterialIcons',
  name = 'star',
  size,
  color = Colors.textPrimary,
  badge,         // number — shows a red badge with count
  dot = false,   // boolean — shows a small dot indicator
  dotColor = Colors.error,
  onPress,
  hitSlop = { top: 10, bottom: 10, left: 10, right: 10 },
  containerStyle,
  accessibilityLabel,
}) => {
  const iconSize = size ?? ms(24);
  const IconComponent = getIconComponent(family);

  const inner = (
    <View style={[styles.container, containerStyle]}>
      <IconComponent name={name} size={iconSize} color={color} />

      {/* Numeric badge */}
      {badge != null && badge > 0 && (
        <View style={styles.badge}>
          <CText variant="label" weight="bold" color={Colors.white} style={styles.badgeText}>
            {badge > 99 ? '99+' : String(badge)}
          </CText>
        </View>
      )}

      {/* Dot indicator */}
      {dot && !badge && (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        hitSlop={hitSlop}
        activeOpacity={0.7}
        accessibilityLabel={accessibilityLabel ?? name}
        accessibilityRole="button"
      >
        {inner}
      </TouchableOpacity>
    );
  }

  return inner;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -vs(5),
    right: -ms(5),
    minWidth: ms(17),
    height: ms(17),
    borderRadius: ms(9),
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(3),
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    fontSize: normFont(9),
    lineHeight: normFont(12),
  },
  dot: {
    position: 'absolute',
    top: -vs(2),
    right: -ms(2),
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
});

export default AppIcon;
