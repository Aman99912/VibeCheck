/**
 * NavBar.js  ─  Premium Curved Bottom Tab Navigation Bar
 *
 * A modern, floating bottom navigation bar with a smooth liquid (milk-fold) 
 * cutout in the center and a raised floating action button (FAB).
 *
 * Features:
 *  • Custom SVG curved shape with soft Bezier transitions
 *  • Premium active tab glow background + scale and shift animations
 *  • High-quality Feather/Ionicons automatic mapping via AppIcon
 *  • Safe-area awareness with floating pill layout
 *  • Android-friendly touch targeting for raised elements
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import CText from './CText';
import Colors from './Colors';
import AppIcon from './AppIcon';
import { ms, vs, normFont } from './Scale';

// ─── Icon Mapping for Premium Look ───────────────────────────────────────────
const mapIcon = (iconName) => {
  switch (iconName) {
    case 'location-on':
      return { family: 'Feather', name: 'map' };
    case 'smart-display':
      return { family: 'Feather', name: 'play-circle' };
    case 'assignment-turned-in':
      return { family: 'Feather', name: 'activity' };
    case 'person-outline':
      return { family: 'Feather', name: 'user' };
    default:
      return { family: 'MaterialIcons', name: iconName };
  }
};

// ─── Single Tab Item ─────────────────────────────────────────────────────────
const TabItem = ({ tab, isActive, onPress, badgeCount }) => {
  const scale = useRef(new Animated.Value(isActive ? 1.15 : 1)).current;
  const translate = useRef(new Animated.Value(isActive ? -vs(4) : 0)).current;
  const glowScale = useRef(new Animated.Value(isActive ? 1 : 0.6)).current;
  const glowOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  const iconConfig = mapIcon(tab.icon);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isActive ? 1.15 : 1,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }),
      Animated.spring(translate, {
        toValue: isActive ? -vs(4) : 0,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }),
      Animated.spring(glowScale, {
        toValue: isActive ? 1 : 0.6,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }),
      Animated.timing(glowOpacity, {
        toValue: isActive ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const activeColor = Colors.primary;
  const inactiveColor = Colors.gray500;

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={() => onPress(tab.key)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={tab.label}
    >
      <View style={styles.iconContainer}>
        {/* Animated Wrapper for Glow, Icon and Badge to scale/shift together without overlapping */}
        <Animated.View 
          style={[
            styles.iconWrapper, 
            { transform: [{ scale }, { translateY: translate }] }
          ]}
        >
          {/* Glow Background for Active Tab */}
          <Animated.View
            style={[
              styles.glowBg,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }]
              },
            ]}
          />

          <AppIcon
            family={iconConfig.family}
            name={iconConfig.name}
            size={ms(26)}
            color={isActive ? activeColor : inactiveColor}
          />

          {/* Badge inside the wrapper so it moves with the icon! */}
          {!!badgeCount && (
            <View style={styles.badge}>
              <CText variant="label" weight="bold" color={Colors.white} style={styles.badgeText}>
                {badgeCount > 99 ? '99+' : String(badgeCount)}
              </CText>
            </View>
          )}
        </Animated.View>
      </View>
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
  const screenWidth = Dimensions.get('window').width;
  
  // Set initial width approximation to avoid layout flashes
  const [width, setWidth] = useState(screenWidth - ms(32));
  
  const barHeight = vs(64);
  const cutoutDepth = vs(30); // Deeper cutout curve for more organic milk-fold transition

  const onLayout = (event) => {
    const { width: layoutWidth } = event.nativeEvent.layout;
    if (layoutWidth > 0) {
      setWidth(layoutWidth);
    }
  };

  // ─── Resolve tab list from either mode ─────────────────────────────────────
  let resolvedTabs = tabs ?? [];
  let resolvedActive = active;
  let resolvedPress = onTabPress;

  if (state && descriptors && navigation) {
    resolvedTabs = state.routes.map((route) => {
      const { options } = descriptors[route.key];
      return {
        key: route.key,
        label: options.tabBarLabel ?? options.title ?? route.name,
        icon: options.tabBarIcon ?? 'circle',
        badge: options.tabBarBadge,
      };
    });
    resolvedActive = state.routes[state.index]?.key;
    resolvedPress = (key) => {
      const route = state.routes.find((r) => r.key === key);
      const isFocused = resolvedActive === key;
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate({ name: route.name, merge: true });
      }
    };
  }

  // ─── SVG Path for Liquid Cutout ────────────────────────────────────────────
  // Generates a floating tab bar outline with a smooth Bezier dip in the center
  const r = ms(24); // Corner radius of floating bar
  const centerX = width / 2;
  const depth = cutoutDepth;
  
  const path = `M 0,${r} 
                A ${r},${r} 0 0 1 ${r},0 
                L ${centerX - ms(50)},0 
                C ${centerX - ms(32)},0 ${centerX - ms(24)},${depth} ${centerX},${depth} 
                C ${centerX + ms(24)},${depth} ${centerX + ms(32)},0 ${centerX + ms(50)},0 
                L ${width - r},0 
                A ${r},${r} 0 0 1 ${width},${r} 
                L ${width},${barHeight - r} 
                A ${r},${r} 0 0 1 ${width - r},${barHeight} 
                L ${r},${barHeight} 
                A ${r},${r} 0 0 1 0,${barHeight - r} 
                Z`;

  // FAB Spring Press Effect
  const fabScale = useRef(new Animated.Value(1)).current;
  const handleFabPress = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    if (navigation) {
      navigation.navigate('CreatePin');
    }
  };

  return (
    <View
      onLayout={onLayout}
      pointerEvents="box-none"
      style={[
        styles.container,
        { bottom: Math.max(insets.bottom, vs(12)) },
        style,
      ]}
    >
      {/* SVG Background Path with Custom Cutout */}
      <View style={[styles.svgContainer, { width, height: barHeight }]}>
        <Svg width={width} height={barHeight} viewBox={`0 0 ${width} ${barHeight}`}>
          <Path d={path} fill={Colors.white} />
        </Svg>
      </View>

      {/* Tab Items Row (with a spacer for the central FAB) */}
      <View style={[styles.rowContainer, { height: barHeight }]} pointerEvents="box-none">
        {resolvedTabs.map((tab, index) => {
          const isCenter = index === 2;
          return (
            <React.Fragment key={tab.key}>
              {isCenter && <View style={styles.centerPlaceholder} />}
              <TabItem
                tab={tab}
                isActive={resolvedActive === tab.key}
                onPress={resolvedPress}
                badgeCount={tab.badge}
              />
            </React.Fragment>
          );
        })}
      </View>

      {/* Floating Center Button (FAB) container */}
      {/* Positioned at the top of the container to be touch-accessible on Android */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <Animated.View style={{ transform: [{ scale: fabScale }] }}>
          <TouchableOpacity
            style={styles.centerButton}
            activeOpacity={0.85}
            onPress={handleFabPress}
          >
            <AppIcon family="Feather" name="plus" size={ms(28)} color={Colors.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: ms(16),
    right: ms(16),
    height: vs(88), // Taller wrapper to keep the raised FAB within the touchable bounds
    backgroundColor: 'transparent',
  },
  svgContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    // Soft shadow casting around the custom SVG shape (supported natively on iOS)
    shadowColor: '#1A0C3C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8, // Shadows for Android
  },
  rowContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: ms(48),
    height: ms(48),
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ms(48),
    height: ms(48),
    position: 'relative',
  },
  glowBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: ms(24),
    backgroundColor: Colors.primaryGhost, // 8% opacity primary color
    borderWidth: 1.5,
    borderColor: 'rgba(133, 108, 226, 0.15)', // Soft outline matching active brand color
  },
  centerPlaceholder: {
    flex: 1,
    height: '100%',
  },
  fabContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: vs(88),
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centerButton: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(26),
    backgroundColor: Colors.primary, // Matches the branding
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(4), // Aligns perfectly in the cutout depth
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  badge: {
    position: 'absolute',
    top: -vs(2),
    right: -ms(2),
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
  },
});

export default NavBar;
