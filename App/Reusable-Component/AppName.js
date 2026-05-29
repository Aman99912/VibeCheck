/**
 * AppName.js  ─  Styled App Name / Title Design
 *
 * Renders "VibeMatch" (or any app name) with:
 *  • Two-tone coloring (first word vs rest)
 *  • Optional tagline below
 *  • Decorative dot / underline accent
 *  • Responsive font sizing via normFont
 *  • allowFontScaling={false} always
 *
 * Sizes: xs | sm | md | lg | xl
 *
 * Usage:
 *   <AppName />
 *   <AppName size="xl" showTagline />
 *   <AppName light />         ← for dark backgrounds
 *   <AppName showDot={false} /> ← hide accent dot
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import CText from './CText';
import Colors from './Colors';
import { ms, vs, normFont } from './Scale';

const FONT_SIZES = {
  xs: normFont(16),
  sm: normFont(20),
  md: normFont(28),
  lg: normFont(36),
  xl: normFont(48),
};

const TAGLINE_SIZES = {
  xs: normFont(10),
  sm: normFont(11),
  md: normFont(13),
  lg: normFont(15),
  xl: normFont(17),
};

const AppName = ({
  firstName = 'Vibe',
  lastName  = 'Match',
  tagline   = 'Find your vibe. Find your match.',
  size      = 'md',
  light     = false,
  showTagline = false,
  showDot     = true,
  align       = 'left',
  style,
}) => {
  const fontSize    = FONT_SIZES[size]    ?? FONT_SIZES.md;
  const taglineSize = TAGLINE_SIZES[size] ?? TAGLINE_SIZES.md;
  const dotSize     = ms(8);

  const primaryColor  = light ? Colors.white      : Colors.primary;
  const secondaryColor = light ? Colors.offWhite  : Colors.textPrimary;
  const taglineColor  = light ? Colors.primaryLight : Colors.textMuted;

  return (
    <View style={[styles.container, { alignItems: align === 'center' ? 'center' : 'flex-start' }, style]}>
      {/* Main name row */}
      <View style={styles.nameRow}>
        <CText
          variant="display"
          weight="black"
          color={primaryColor}
          style={{ fontSize, letterSpacing: -0.5 }}
        >
          {firstName}
        </CText>

        {/* Separator dot between words */}
        {showDot && (
          <View
            style={[
              styles.dot,
              {
                width:           dotSize,
                height:          dotSize,
                borderRadius:    dotSize / 2,
                backgroundColor: Colors.secondary,
                marginHorizontal: ms(3),
                // vertically centre dot relative to text
                marginBottom: vs(4),
              },
            ]}
          />
        )}

        <CText
          variant="display"
          weight="black"
          color={secondaryColor}
          style={{ fontSize, letterSpacing: -0.5 }}
        >
          {lastName}
        </CText>
      </View>

      {/* Tagline */}
      {showTagline && (
        <CText
          variant="caption"
          weight="regular"
          color={taglineColor}
          style={{ fontSize: taglineSize, marginTop: vs(4) }}
          align={align}
        >
          {tagline}
        </CText>
      )}

      {/* Accent underline beneath the primary word */}
      <View
        style={[
          styles.underline,
          { backgroundColor: Colors.secondary, alignSelf: align === 'center' ? 'center' : 'flex-start' },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dot: {
    alignSelf: 'flex-end',
  },
  underline: {
    height: ms(3),
    width:  ms(40),
    borderRadius: ms(2),
    marginTop: vs(4),
  },
});

export default AppName;
