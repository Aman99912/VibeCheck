/**
 * Buttons.js  ─  10 Button Variants
 *
 * Variants:
 *  1.  primary       – filled brand colour (vibrant blue)
 *  2.  secondary     – filled secondary colour (dark navy)
 *  3.  ghost         – transparent bg, brand-coloured border + text
 *  4.  outline       – gray border, dark text
 *  5.  danger        – filled error/red
 *  6.  dangerOutline – transparent bg, red border + text
 *  7.  success       – filled green
 *  8.  successOutline – transparent bg, green border + text
 *  9.  warning       – filled orange/warning
 *  10. text          – no border/bg, just coloured text (link-style)
 *  11. icon          – round icon-only button (fab-style)
 *  12. soft          – light tinted background (soft primary)
 *
 * Features:
 *  • Loading spinner replaces children while loading=true
 *  • Disabled state (visual + touch disabled)
 *  • leftIcon / rightIcon (MaterialIcons name)
 *  • size prop: sm | md | lg
 *  • Full-width via fullWidth prop
 *  • All text has allowFontScaling={false}
 *
 * Usage:
 *   <AppButton variant="primary"   title="Save" onPress={...} />
 *   <AppButton variant="ghost"     title="Cancel" />
 *   <AppButton variant="danger"    title="Delete" loading />
 *   <AppButton variant="icon"      iconName="camera" onPress={...} />
 *   <AppButton variant="text"      title="Forgot password?" />
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CText from './CText';
import Colors from './Colors';
import { ms, vs, normFont } from './Scale';

// ─── Size presets ──────────────────────────────────────────────────────────────
const SIZES = {
  sm: { height: vs(38), paddingH: ms(16), fontSize: normFont(13), iconSize: ms(16), radius: ms(8)  },
  md: { height: vs(50), paddingH: ms(22), fontSize: normFont(15), iconSize: ms(20), radius: ms(12) },
  lg: { height: vs(58), paddingH: ms(28), fontSize: normFont(17), iconSize: ms(22), radius: ms(14) },
};

// ─── Variant style map ──────────────────────────────────────────────────────────
const VARIANTS = {
  primary: {
    bg:         Colors.primary,
    border:     Colors.primary,
    textColor:  Colors.white,
    iconColor:  Colors.white,
    pressedBg:  Colors.primaryDark,
  },
  secondary: {
    bg:         Colors.secondary,
    border:     Colors.secondary,
    textColor:  Colors.white,
    iconColor:  Colors.white,
    pressedBg:  Colors.secondaryDark,
  },
  ghost: {
    bg:         Colors.transparent,
    border:     Colors.primary,
    textColor:  Colors.primary,
    iconColor:  Colors.primary,
    pressedBg:  Colors.primaryGhost,
  },
  outline: {
    bg:         Colors.transparent,
    border:     Colors.border,
    textColor:  Colors.textPrimary,
    iconColor:  Colors.textPrimary,
    pressedBg:  Colors.gray100,
  },
  danger: {
    bg:         Colors.error,
    border:     Colors.error,
    textColor:  Colors.white,
    iconColor:  Colors.white,
    pressedBg:  '#D32F2F',
  },
  dangerOutline: {
    bg:         Colors.transparent,
    border:     Colors.error,
    textColor:  Colors.error,
    iconColor:  Colors.error,
    pressedBg:  Colors.errorLight,
  },
  success: {
    bg:         Colors.success,
    border:     Colors.success,
    textColor:  Colors.white,
    iconColor:  Colors.white,
    pressedBg:  Colors.accentDark,
  },
  successOutline: {
    bg:         Colors.transparent,
    border:     Colors.success,
    textColor:  Colors.success,
    iconColor:  Colors.success,
    pressedBg:  Colors.successLight,
  },
  warning: {
    bg:         Colors.warning,
    border:     Colors.warning,
    textColor:  Colors.white,
    iconColor:  Colors.white,
    pressedBg:  '#E68A00',
  },
  text: {
    bg:         Colors.transparent,
    border:     Colors.transparent,
    textColor:  Colors.primary,
    iconColor:  Colors.primary,
    pressedBg:  Colors.transparent,
  },
  icon: {
    bg:         Colors.primary,
    border:     Colors.primary,
    textColor:  Colors.white,
    iconColor:  Colors.white,
    pressedBg:  Colors.primaryDark,
  },
  soft: {
    bg:         Colors.primaryLight,
    border:     Colors.transparent,
    textColor:  Colors.primary,
    iconColor:  Colors.primary,
    pressedBg:  'rgba(36, 107, 253, 0.16)',
  },
};

const AppButton = ({
  variant = 'primary',
  title,
  onPress,
  disabled = false,
  loading = false,
  size = 'md',
  fullWidth = false,
  leftIcon,    // MaterialIcons name
  rightIcon,   // MaterialIcons name
  iconName,    // for icon-only variant
  style,
  textStyle,
  hitSlop,
  accessibilityLabel,
}) => {
  const v  = VARIANTS[variant] || VARIANTS.primary;
  const sz = SIZES[size]       || SIZES.md;

  const isDisabled = disabled || loading;
  const isIconOnly = variant === 'icon';

  const btnStyle = [
    styles.base,
    {
      height:           isIconOnly ? sz.height : sz.height,
      width:            isIconOnly ? sz.height : undefined, // square for icon
      paddingHorizontal: isIconOnly ? 0 : sz.paddingH,
      borderRadius:     isIconOnly ? sz.height / 2 : sz.radius,
      backgroundColor:  isDisabled ? Colors.disabled : v.bg,
      borderColor:      isDisabled ? Colors.disabled : v.border,
    },
    fullWidth && !isIconOnly && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const spinnerColor = v.textColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={btnStyle}
      hitSlop={hitSlop}
      accessibilityLabel={accessibilityLabel ?? title ?? iconName}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.inner}>
          {leftIcon && !isIconOnly && (
            <MaterialIcons
              name={leftIcon}
              size={sz.iconSize}
              color={isDisabled ? Colors.gray500 : v.iconColor}
              style={styles.iconLeft}
            />
          )}

          {isIconOnly ? (
            <MaterialIcons
              name={iconName ?? 'star'}
              size={sz.iconSize}
              color={isDisabled ? Colors.gray500 : v.iconColor}
            />
          ) : (
            <CText
              variant="body"
              weight="semibold"
              color={isDisabled ? Colors.gray500 : v.textColor}
              style={[{ fontSize: sz.fontSize }, textStyle]}
            >
              {title}
            </CText>
          )}

          {rightIcon && !isIconOnly && (
            <MaterialIcons
              name={rightIcon}
              size={sz.iconSize}
              color={isDisabled ? Colors.gray500 : v.iconColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.55,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: ms(8),
  },
  iconRight: {
    marginLeft: ms(8),
  },
});

export default AppButton;
