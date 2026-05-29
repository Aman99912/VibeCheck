/**
 * CText.js  ─  Custom Text Component
 *
 * Features:
 *  • allowFontScaling is always false → font stays exactly as designed,
 *    regardless of the user's OS accessibility font-size setting.
 *  • Uses moderate scaling (normFont) so size adapts to screen width,
 *    not the OS font-scale slider.
 *  • Predefined variants: display | h1 | h2 | h3 | h4 | body | bodySmall |
 *    caption | label | overline | link
 *  • weight shortcuts: thin | light | regular | medium | semibold | bold | black
 *  • color prop accepts any color string.
 *
 * Usage:
 *   <CText variant="h2" weight="semibold" color={Colors.primary}>Hello</CText>
 *   <CText variant="body">Normal text that never scales</CText>
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { normFont } from './Scale';
import Colors from './Colors';

const SIZES = {
  display:   normFont(36),
  h1:        normFont(28),
  h2:        normFont(24),
  h3:        normFont(20),
  h4:        normFont(18),
  body:      normFont(15),
  bodySmall: normFont(13),
  caption:   normFont(12),
  label:     normFont(11),
  overline:  normFont(10),
  link:      normFont(15),
};

const FONT_FAMILIES = {
  thin:     'Poppins-Light',
  light:    'Poppins-Light',
  regular:  'Poppins-Regular',
  medium:   'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold:     'Poppins-Bold',
  black:    'Poppins-Black',
};

const LINE_HEIGHTS = {
  display:   normFont(44),
  h1:        normFont(36),
  h2:        normFont(32),
  h3:        normFont(28),
  h4:        normFont(26),
  body:      normFont(22),
  bodySmall: normFont(20),
  caption:   normFont(18),
  label:     normFont(16),
  overline:  normFont(14),
  link:      normFont(22),
};

const CText = ({
  children,
  variant = 'body',
  weight = 'regular',
  color,
  align = 'left',
  style,
  numberOfLines,
  ellipsizeMode = 'tail',
  onPress,
  ...rest
}) => {
  const fontFamily = FONT_FAMILIES[weight] ?? FONT_FAMILIES.regular;

  const textStyle = [
    styles.base,
    {
      fontSize:   SIZES[variant]   ?? SIZES.body,
      lineHeight: LINE_HEIGHTS[variant] ?? LINE_HEIGHTS.body,
      fontFamily,
      color:      color ?? (variant === 'link' ? Colors.textLink : Colors.textPrimary),
      textAlign:  align,
    },
    variant === 'overline' && styles.overline,
    style,
  ];

  return (
    <Text
      allowFontScaling={false}   // ← KEY: device font-size slider ignored
      style={textStyle}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      onPress={onPress}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'Poppins-Regular',
    includeFontPadding: false, // Android: removes extra top/bottom padding
    textAlignVertical: 'center',
  },
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});

export default CText;
