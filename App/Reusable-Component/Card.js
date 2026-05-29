/**
 * Card.js  ─  Card & List Item Components
 *
 * Exports:
 *  • Card        – general purpose elevated / flat card container
 *  • ListItem    – horizontal row with avatar/icon, title, subtitle, right content
 *  • SectionList – thin wrapper for sticky-section lists (re-exported for convenience)
 *
 * Card variants:
 *   elevated | flat | outlined | ghost | gradient (uses a solid bg approximation)
 *
 * Usage:
 *   <Card variant="elevated" onPress={...}>
 *     <CText>Content here</CText>
 *   </Card>
 *
 *   <ListItem
 *     title="John Doe"
 *     subtitle="Software Engineer"
 *     leftIcon="person"
 *     rightIcon="chevron-right"
 *     onPress={...}
 *   />
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CText from './CText';
import Colors from './Colors';
import { ms, vs } from './Scale';

// ─── CARD ─────────────────────────────────────────────────────────────────────
const CARD_VARIANTS = {
  elevated: {
    backgroundColor: Colors.white,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  flat: {
    backgroundColor: Colors.surface,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  outlined: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    backgroundColor: Colors.transparent,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  soft: {
    backgroundColor: Colors.primaryGhost,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
};

const Card = ({
  children,
  variant = 'elevated',
  onPress,
  style,
  padding = ms(16),
  radius = ms(16),
  borderColor,
}) => {
  const variantStyle = CARD_VARIANTS[variant] || CARD_VARIANTS.elevated;

  const cardStyle = [
    styles.card,
    variantStyle,
    { padding, borderRadius: radius },
    borderColor && { borderColor },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

// ─── LIST ITEM ────────────────────────────────────────────────────────────────
const ListItem = ({
  title,
  subtitle,
  caption,
  // Left side
  leftIcon,       // MaterialIcons name
  leftIconColor,
  leftIconBg,
  avatarUri,      // remote image URI for avatar
  avatarInitials, // fallback text if no image
  // Right side
  rightIcon,
  rightText,
  rightElement,  // arbitrary JSX on the right
  // Behavior
  onPress,
  disabled = false,
  // Style
  style,
  showDivider = true,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress
    ? { onPress, activeOpacity: 0.7, disabled, accessibilityRole: 'button' }
    : {};

  return (
    <Wrapper style={[styles.listItem, style]} {...wrapperProps}>
      {/* Left avatar / icon */}
      {(leftIcon || avatarUri || avatarInitials) && (
        <View
          style={[
            styles.listLeftContainer,
            leftIconBg ? { backgroundColor: leftIconBg } : styles.listLeftBg,
          ]}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : avatarInitials ? (
            <CText variant="bodySmall" weight="bold" color={Colors.white}>
              {avatarInitials.slice(0, 2).toUpperCase()}
            </CText>
          ) : (
            <MaterialIcons
              name={leftIcon}
              size={ms(20)}
              color={leftIconColor ?? Colors.primary}
            />
          )}
        </View>
      )}

      {/* Text block */}
      <View style={styles.listTextBlock}>
        {title ? (
          <CText variant="body" weight="semibold" numberOfLines={1} ellipsizeMode="tail">
            {title}
          </CText>
        ) : null}
        {subtitle ? (
          <CText variant="caption" color={Colors.textSecondary} numberOfLines={1}>
            {subtitle}
          </CText>
        ) : null}
        {caption ? (
          <CText variant="label" color={Colors.textMuted} numberOfLines={1}>
            {caption}
          </CText>
        ) : null}
      </View>

      {/* Right side */}
      {rightElement ? (
        <View style={styles.listRight}>{rightElement}</View>
      ) : (
        <View style={styles.listRight}>
          {rightText ? (
            <CText variant="caption" color={Colors.textMuted}>
              {rightText}
            </CText>
          ) : null}
          {rightIcon ? (
            <MaterialIcons name={rightIcon} size={ms(20)} color={Colors.gray400} />
          ) : null}
        </View>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  // Card
  card: {
    overflow: 'hidden',
  },
  // List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(16),
    paddingVertical: vs(12),
    backgroundColor: Colors.white,
  },
  listLeftContainer: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(14),
  },
  listLeftBg: {
    backgroundColor: Colors.primaryGhost,
  },
  avatar: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
  },
  listTextBlock: {
    flex: 1,
  },
  listRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    marginLeft: ms(8),
  },
});

export { Card, ListItem };
export default Card;
