/**
 * Header.js  ─  Screen Header with SafeArea
 *
 * Features:
 *  • SafeAreaView (top inset) built-in — no need to wrap externally
 *  • Left slot: optional BackButton (auto-wired with loop-guard)
 *  • Center slot: title text OR custom children
 *  • Right slot: optional icon button(s) or custom component
 *  • Variants: solid | transparent | blur
 *  • Shadow / border-bottom configurable
 *  • BACK LOOP PREVENTION: BackButton only renders when navigation.canGoBack() is true
 *
 * Usage:
 *   // Simple title
 *   <Header title="Profile" />
 *
 *   // With back button
 *   <Header title="Settings" showBack />
 *
 *   // With right action icon
 *   <Header title="Home" rightIcon="notifications" onRightPress={...} rightBadge={3} />
 *
 *   // Custom right element
 *   <Header title="Chat" rightElement={<Avatar uri={...} />} />
 *
 *   // Override back behavior
 *   <Header title="Confirm" showBack onBackPress={handleCustomBack} />
 *
 *   // Transparent (overlay on content)
 *   <Header title="" variant="transparent" showBack />
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BackButton from './BackButton';
import CText from './CText';
import AppIcon from './AppIcon';
import Colors from './Colors';
import { ms, vs, normFont } from './Scale';

const HEADER_HEIGHT = vs(56);

const Header = ({
  // Content
  title,
  titleElement,         // fully custom JSX replaces title text
  showBack = false,     // whether to render BackButton on the left
  onBackPress,          // custom back handler (forwarded to BackButton)

  // Right side
  rightIcon,            // single right icon (MaterialIcons name)
  onRightPress,
  rightBadge,           // badge count on rightIcon
  rightElement,         // fully custom right JSX (overrides rightIcon)

  // Left side (extra — besides back button)
  leftElement,          // custom left JSX (rendered after back button)

  // Appearance
  variant = 'solid',    // 'solid' | 'transparent'
  backgroundColor,      // override bg
  titleColor,
  borderBottom = true,
  shadow = false,
  style,
  titleStyle,
}) => {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation();

  // ── Loop guard: only show back if there is a screen to go back to ──────────
  const canGoBack = navigation.canGoBack();
  const renderBack = showBack && canGoBack;

  const bg = backgroundColor
    ?? (variant === 'transparent' ? Colors.transparent : Colors.white);

  return (
    <View
      style={[
        styles.outerContainer,
        {
          paddingTop:      insets.top,
          backgroundColor: bg,
        },
        borderBottom && variant !== 'transparent' && styles.borderBottom,
        shadow && styles.shadow,
        style,
      ]}
    >
      <View style={styles.inner}>

        {/* ── Left ── */}
        <View style={styles.side}>
          {renderBack && (
            <BackButton
              onPress={onBackPress}
              color={titleColor ?? Colors.textPrimary}
              containerStyle={styles.backBtn}
            />
          )}
          {leftElement ?? null}
        </View>

        {/* ── Center ── */}
        <View style={styles.center} pointerEvents="none">
          {titleElement ? (
            titleElement
          ) : title ? (
            <CText
              variant="h4"
              weight="semibold"
              color={titleColor ?? Colors.textPrimary}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.title, titleStyle]}
            >
              {title}
            </CText>
          ) : null}
        </View>

        {/* ── Right ── */}
        <View style={[styles.side, styles.rightSide]}>
          {rightElement ? (
            rightElement
          ) : rightIcon ? (
            <AppIcon
              name={rightIcon}
              onPress={onRightPress}
              color={titleColor ?? Colors.textPrimary}
              badge={rightBadge}
              size={ms(24)}
            />
          ) : null}
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    zIndex: 10,
  },
  inner: {
    height:          HEADER_HEIGHT,
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: ms(16),
  },
  side: {
    width:        ms(60),
    alignItems:   'flex-start',
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  center: {
    flex:       1,
    alignItems: 'center',
  },
  title: {
    fontSize: normFont(17),
    textAlign: 'center',
  },
  backBtn: {
    // extra hit area handled inside BackButton
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default Header;
