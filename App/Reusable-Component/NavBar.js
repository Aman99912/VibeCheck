/**
 * NavBar.js  ─  Bottom Tab Navigation Bar
 *
 * A fully custom bottom navigation bar component.
 * Pass it to the `tabBar` prop of a React Navigation BottomTabNavigator,
 * OR use it as a standalone controlled component.
 *
 * Features:
 *  • Active item indicator with animated scale + color highlight
 *  • Badge support per tab
 *  • Safe-area aware (uses useSafeAreaInsets)
 *  • Customisable via props
 *  • allowFontScaling={false} on all labels
 *
 * Standalone Usage:
 *   const TABS = [
 *     { key: 'home',    label: 'Home',     icon: 'home'        },
 *     { key: 'explore', label: 'Explore',  icon: 'explore'     },
 *     { key: 'chat',    label: 'Messages', icon: 'chat-bubble'  },
 *     { key: 'profile', label: 'Profile',  icon: 'person'       },
 *   ];
 *   <NavBar tabs={TABS} active="home" onTabPress={(key) => setActive(key)} />
 *
 * React Navigation integration:
 *   <Tab.Navigator tabBar={(props) => <NavBar {...props} />}>
 *     ...
 *   </Tab.Navigator>
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CText from './CText';
import Colors from './Colors';
import { ms, vs, normFont } from './Scale';

// ─── Single Tab Item ─────────────────────────────────────────────────────────
const TabItem = ({ tab, isActive, onPress, badgeCount }) => {
  const scale = useRef(new Animated.Value(isActive ? 1.15 : 1)).current;
  const color = isActive ? Colors.primary : Colors.gray500;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.15 : 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [isActive]);

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={() => onPress(tab.key)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={tab.label}
    >
      <Animated.View style={[styles.iconWrapper, { transform: [{ scale }] }]}>
        {/* Active pill behind icon */}
        {isActive && <View style={styles.activePill} />}
        <MaterialIcons name={tab.icon} size={ms(28)} color={color} />

        {/* Badge */}
        {!!badgeCount && (
          <View style={styles.badge}>
            <CText variant="label" weight="bold" color={Colors.white} style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : String(badgeCount)}
            </CText>
          </View>
        )}
      </Animated.View>

    </TouchableOpacity>
  );
};

// ─── NavBar ───────────────────────────────────────────────────────────────────
const NavBar = ({
  // ─── Standalone props ──────────────────────────────────────────────────────
  tabs,          // [{ key, label, icon, badge? }]
  active,        // currently active key
  onTabPress,    // (key) => void

  // ─── React Navigation BottomTabNavigator props (auto-filled when used as tabBar) ─
  state,
  descriptors,
  navigation,

  // ─── Style overrides ────────────────────────────────────────────────────────
  style,
}) => {
  const insets = useSafeAreaInsets();

  // ─── Resolve tab list from either mode ─────────────────────────────────────
  let resolvedTabs   = tabs ?? [];
  let resolvedActive = active;
  let resolvedPress  = onTabPress;

  if (state && descriptors && navigation) {
    resolvedTabs = state.routes.map((route) => {
      const { options } = descriptors[route.key];
      return {
        key:   route.key,
        label: options.tabBarLabel ?? options.title ?? route.name,
        icon:  options.tabBarIcon ?? 'circle',
        badge: options.tabBarBadge,
      };
    });
    resolvedActive = state.routes[state.index]?.key;
    resolvedPress  = (key) => {
      const route   = state.routes.find((r) => r.key === key);
      const isFocused = resolvedActive === key;
      const event   = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate({ name: route.name, merge: true });
      }
    };
  }

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, vs(10)) + vs(4) },
        style,
      ]}
    >
      {resolvedTabs.map((tab) => (
        <TabItem
          key={tab.key}
          tab={tab}
          isActive={resolvedActive === tab.key}
          onPress={resolvedPress}
          badgeCount={tab.badge}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingTop: vs(20),
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#2e2e2eff',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: ms(50),
    height: ms(32),
  },
  activePill: {
    position: 'absolute',
    // width: ms(45),
    // height: ms(37),
    borderRadius: ms(30),
    backgroundColor: Colors.primaryGhost,
  },
  tabLabel: {
    marginTop: vs(3),
    fontSize: normFont(10),
  },
  badge: {
    position: 'absolute',
    top: -vs(4),
    right: -ms(2),
    minWidth: ms(16),
    height: ms(16),
    borderRadius: ms(8),
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(3),
  },
  badgeText: {
    fontSize: normFont(9),
  },
});

export default NavBar;
