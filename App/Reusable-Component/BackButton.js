/**
 * BackButton.js  ─  Hardware-safe Back Button
 *
 * Features:
 *  • Works without the hardware back button (iOS has no hardware back).
 *  • Intercepts Android hardware back press via useFocusEffect +
 *    BackHandler — so the physical back button and the on-screen button
 *    always do the same thing.
 *  • Loop-guard: only calls navigation.goBack() when canGoBack() is true.
 *  • Fully customisable: size, color, icon, label.
 *
 * Usage:
 *   <BackButton />                          ← auto-detects navigation context
 *   <BackButton label="Go Back" />          ← with text label
 *   <BackButton onPress={customHandler} />  ← override the back action
 *   <BackButton color={Colors.primary} />
 */

import React, { useCallback } from 'react';
import { TouchableOpacity, StyleSheet, BackHandler, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CText from './CText';
import Colors from './Colors';
import { ms, vs } from './Scale';

const BackButton = ({
  onPress,          // custom override – if provided, hardware back also calls this
  color = Colors.textPrimary,
  size = ms(24),
  label,            // optional text next to arrow
  style,
  hitSlop = { top: 12, bottom: 12, left: 12, right: 12 },
  containerStyle,
}) => {
  const navigation = useNavigation();

  const handleBack = useCallback(() => {
    if (onPress) {
      onPress();
      return true; // consumed — prevents default Android back
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true; // consumed
    }
    return false; // let OS handle (exits app on root screen)
  }, [onPress, navigation]);

  // ── Intercept Android hardware back key while this screen is focused ───────
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => sub.remove(); // clean up on blur / unmount
    }, [handleBack])
  );

  return (
    <TouchableOpacity
      onPress={handleBack}
      hitSlop={hitSlop} 
      activeOpacity={0.7}
      style={[styles.container, containerStyle]}
      accessibilityLabel="Go back"
      accessibilityRole="button"
    >
      <MaterialIcons name="chevron-left" size={size + 6} color={color} style={styles.icon} />
      {label ? (
        <CText
          variant="body"
          weight="medium"
          color={color}
          style={styles.label}
        >
          {label}
        </CText>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: ms(6),
  },
});

export default BackButton;
