/**
 * NavBar.js  ─  Professional Bottom Tab Navigation Bar
 *
 * Clean, modern floating bottom nav with:
 *  • Crisp Ionicons for each tab — no icon mapping issues
 *  • Animated pill active indicator that slides smoothly
 *  • Icon + label layout (icon shifts up on active, label fades in)
 *  • Solid FAB with brand gradient glow
 *  • Safe-area aware, stable layout, no SVG cutout complexity
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
import CText from './CText';
import Colors from './Colors';
import AppIcon from './AppIcon';
import { ms, vs, normFont } from './Scale';

// ─── Tab Icon + Label Config ─────────────────────────────────────────────────
// Each route name maps to a specific Ionicons icon (outline = inactive, filled = active)
const TAB_CONFIG = {
  Map: {
    activeIcon: 'map',
    inactiveIcon: 'map-outline',
    label: 'Map',
    family: 'Ionicons',
  },
  Highlights: {
    activeIcon: 'play-circle',
    inactiveIcon: 'play-circle-outline',
    label: 'Highlights',
    family: 'Ionicons',
  },
  Activity: {
    activeIcon: 'flash',
    inactiveIcon: 'flash-outline',
    label: 'Activity',
    family: 'Ionicons',
  },
  Profile: {
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
    label: 'Profile',
    family: 'Ionicons',
  },
};

// ─── Single Tab Item ──────────────────────────────────────────────────────────
const TabItem = ({ routeName, label, isActive, onPress, badgeCount }) => {
  const config = TAB_CONFIG[routeName] ?? {
    activeIcon: 'ellipse',
    inactiveIcon: 'ellipse-outline',
    label: label ?? routeName,
    family: 'Ionicons',
  };

  const translateY = useRef(new Animated.Value(isActive ? -vs(2) : 0)).current;
  const labelOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const iconScale = useRef(new Animated.Value(isActive ? 1.08 : 1)).current;
  const pillOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const pillScale = useRef(new Animated.Value(isActive ? 1 : 0.75)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: isActive ? -vs(2) : 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 160,
      }),
      Animated.spring(iconScale, {
        toValue: isActive ? 1.08 : 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 160,
      }),
      Animated.timing(labelOpacity, {
        toValue: isActive ? 1 : 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.spring(pillOpacity, {
        toValue: isActive ? 1 : 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
      }),
      Animated.spring(pillScale, {
        toValue: isActive ? 1 : 0.75,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={config.label}
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View
        style={[
          styles.tabInner,
          { transform: [{ translateY }, { scale: iconScale }] },
        ]}
      >
        {/* Active pill background */}
        <Animated.View
          style={[
            styles.activePill,
            {
              opacity: pillOpacity,
              transform: [{ scale: pillScale }],
            },
          ]}
        />

        {/* Icon */}
        <AppIcon
          family={config.family}
          name={isActive ? config.activeIcon : config.inactiveIcon}
          size={ms(22)}
          color={isActive ? '#2563EB' : Colors.gray500}
        />

        {/* Badge */}
        {!!badgeCount && (
          <View style={styles.badge}>
            <CText
              variant="label"
              weight="bold"
              color={Colors.white}
              style={styles.badgeText}
            >
              {badgeCount > 99 ? '99+' : String(badgeCount)}
            </CText>
          </View>
        )}
      </Animated.View>

      {/* Label — fades in when active */}
      <Animated.View style={{ opacity: labelOpacity, height: vs(13) }}>
        <CText
          style={styles.tabLabel}
          numberOfLines={1}
          weight="semibold"
          color="#2563EB"
        >
          {config.label}
        </CText>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── NavBar ───────────────────────────────────────────────────────────────────
const NavBar = ({
  // Standalone props
  tabs,
  active,
  onTabPress,

  // React Navigation BottomTabNavigator props
  state,
  descriptors,
  navigation,

  style,
}) => {
  const insets = useSafeAreaInsets();

  // FAB press spring
  const fabScale = useRef(new Animated.Value(1)).current;

  const handleFabPress = () => {
    Animated.sequence([
      Animated.spring(fabScale, {
        toValue: 0.88,
        useNativeDriver: true,
        damping: 10,
        stiffness: 200,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 8,
        stiffness: 120,
      }),
    ]).start();

    if (navigation) {
      navigation.navigate('CreatePin');
    }
  };

  // ── Resolve tabs from React Navigation or standalone props ────────────────
  let resolvedTabs = [];
  let resolvedActive = active;
  let resolvedPress = onTabPress;

  if (state && descriptors && navigation) {
    resolvedTabs = state.routes.map((route) => {
      const { options } = descriptors[route.key];
      return {
        key: route.key,
        name: route.name,
        label: options.tabBarLabel ?? options.title ?? route.name,
        badge: options.tabBarBadge,
      };
    });
    resolvedActive = state.routes[state.index]?.key;
    resolvedPress = (key) => {
      const route = state.routes.find((r) => r.key === key);
      const isFocused = resolvedActive === key;
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate({ name: route.name, merge: true });
      }
    };
  } else if (tabs) {
    resolvedTabs = tabs.map((t) => ({ key: t.key, name: t.key, label: t.label, badge: t.badge }));
  }

  // Split into left (2) and right (2) around center FAB
  const leftTabs = resolvedTabs.slice(0, 2);
  const rightTabs = resolvedTabs.slice(2, 4);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom + vs(8), vs(16)) },
        style,
      ]}
    >
      <View style={styles.bar}>
        {/* Left tabs */}
        <View style={styles.tabGroup}>
          {leftTabs.map((tab) => (
            <TabItem
              key={tab.key}
              routeName={tab.name}
              label={tab.label}
              isActive={resolvedActive === tab.key}
              onPress={() => resolvedPress(tab.key)}
              badgeCount={tab.badge}
            />
          ))}
        </View>

        {/* Center FAB */}
        <View style={styles.fabSlot}>
          <Animated.View style={{ transform: [{ scale: fabScale }] }}>
            <TouchableOpacity
              style={styles.fab}
              activeOpacity={0.88}
              onPress={handleFabPress}
              accessibilityLabel="Create activity"
              accessibilityRole="button"
            >
              <AppIcon
                family="Ionicons"
                name="add"
                size={ms(28)}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Right tabs */}
        <View style={styles.tabGroup}>
          {rightTabs.map((tab) => (
            <TabItem
              key={tab.key}
              routeName={tab.name}
              label={tab.label}
              isActive={resolvedActive === tab.key}
              onPress={() => resolvedPress(tab.key)}
              badgeCount={tab.badge}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: ms(12),
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: ms(32),
    height: vs(68),
    marginHorizontal: ms(8),
    shadowColor: '#0A1629',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    overflow: 'visible',
  },
  tabGroup: {
    flex: 1,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(6),
    gap: vs(2),
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ms(44),
    height: ms(36),
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: ms(12),
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  tabLabel: {
    fontSize: normFont(10),
    lineHeight: normFont(13),
    color: '#2563EB',
    letterSpacing: 0.1,
  },
  // FAB
  fabSlot: {
    width: ms(72),
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    // Tight, downward-only shadow — contained, premium
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    // White ring for premium depth
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    top: -vs(3),
    right: -ms(3),
    minWidth: ms(16),
    height: ms(16),
    borderRadius: ms(8),
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(3),
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    fontSize: normFont(9),
    lineHeight: normFont(11),
  },
});

export default NavBar;
