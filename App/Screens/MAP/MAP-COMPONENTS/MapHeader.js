/**
 * MapHeader.js — Premium Map Discover Screen Header
 *
 * Two-row header:
 *  Row 1: Animated hamburger (→X) | Centered location pill | Bell (dot) + Settings
 *  Row 2: Horizontally-scrollable filter chips (All/Sports/Music/Cafe/Gaming)
 *
 * Entrance: slides down from -80px + fades in, 0.4s ease-out on mount.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  Text,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ms, vs, normFont } from '../../../Reusable-Component';

// ─── Filter chip config ───────────────────────────────────────────────────────
const FILTER_CHIPS = [
  { id: 'all',     label: 'All',     emoji: null  },
  { id: 'sports',  label: 'Sports',  emoji: '🏅'  },
  { id: 'music',   label: 'Music',   emoji: '🎵'  },
  { id: 'cafe',    label: 'Cafe',    emoji: '☕'   },
  { id: 'gaming',  label: 'Gaming',  emoji: '🎮'  },
];

// ─── MapHeader ────────────────────────────────────────────────────────────────
const MapHeader = ({
  locationName = 'Current Location',
  onLocationPress,
  onFilterChange,
  onHamburgerPress,
  onNotificationPress,
  onSettingsPress,
}) => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Entrance animation ────────────────────────────────────────────────────
  const slideY    = useRef(new Animated.Value(-80)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  // ── Hamburger → X animation ───────────────────────────────────────────────
  const hamBtnScale  = useRef(new Animated.Value(1)).current;
  const line1TransY  = useRef(new Animated.Value(0)).current;
  const line1Rot     = useRef(new Animated.Value(0)).current;
  const line2Opacity = useRef(new Animated.Value(1)).current;
  const line3TransY  = useRef(new Animated.Value(0)).current;
  const line3Rot     = useRef(new Animated.Value(0)).current;

  // Chip scale animations (one per chip)
  const chipScales = useRef(FILTER_CHIPS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    StatusBar.setBarStyle('dark-content', true);
    StatusBar.setBackgroundColor('#FFFFFF', true);

    Animated.parallel([
      Animated.timing(slideY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Hamburger press handler ────────────────────────────────────────────────
  const handleHamburgerPress = () => {
    const opening = !menuOpen;
    setMenuOpen(opening);

    // Press feedback scale
    Animated.sequence([
      Animated.timing(hamBtnScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(hamBtnScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 220,
      }),
    ]).start();

    // The vertical offset to cross the lines (each line is 2px tall, gap is 5px)
    const lineOffset = ms(7); // 5px gap + 2px line

    Animated.parallel([
      // Line 1: translate down + rotate 45°
      Animated.timing(line1TransY, {
        toValue: opening ? lineOffset : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(line1Rot, {
        toValue: opening ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      // Line 2: fade out
      Animated.timing(line2Opacity, {
        toValue: opening ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Line 3: translate up + rotate -45°
      Animated.timing(line3TransY, {
        toValue: opening ? -lineOffset : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(line3Rot, {
        toValue: opening ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    onHamburgerPress?.(opening);
  };

  // ── Filter chip press ──────────────────────────────────────────────────────
  const handleFilterPress = (id, idx) => {
    setActiveFilter(id);
    onFilterChange?.(id);

    // Tap scale feedback
    Animated.sequence([
      Animated.timing(chipScales[idx], { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(chipScales[idx], {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 250,
      }),
    ]).start();
  };

  const line1Rotate = line1Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  const line3Rotate = line3Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-45deg'] });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, vs(10)) + vs(4),
          transform: [{ translateY: slideY }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* ── Row 1: Top Bar ───────────────────────────────────────────────── */}
      <View style={styles.topRow}>

        {/* Hamburger menu button */}
        <Animated.View style={{ transform: [{ scale: hamBtnScale }] }}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleHamburgerPress}
            activeOpacity={1}
            accessibilityLabel="Menu"
          >
            <View style={styles.hamburgerLines}>
              <Animated.View
                style={[
                  styles.hamLine,
                  {
                    transform: [
                      { translateY: line1TransY },
                      { rotate: line1Rotate },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.hamLine,
                  { marginTop: ms(5), opacity: line2Opacity },
                ]}
              />
              <Animated.View
                style={[
                  styles.hamLine,
                  {
                    marginTop: ms(5),
                    transform: [
                      { translateY: line3TransY },
                      { rotate: line3Rotate },
                    ],
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Location Pill — center */}
        <TouchableOpacity
          style={styles.locationPill}
          onPress={onLocationPress}
          activeOpacity={0.97}
          accessibilityLabel={`Current location: ${locationName}`}
        >
          <View style={styles.locationDot} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationName}
          </Text>
          <Ionicons name="refresh" size={ms(14)} color="#888888" />
        </TouchableOpacity>

        {/* Right action buttons */}
        <View style={styles.rightBtns}>
          {/* Bell with notification dot */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onNotificationPress}
            activeOpacity={0.94}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={ms(18)} color="#333333" />
            <View style={styles.notifDot} />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={[styles.iconBtn, { marginLeft: ms(8) }]}
            onPress={onSettingsPress}
            activeOpacity={0.94}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={ms(18)} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Row 2: Filter Chips ──────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
        decelerationRate="fast"
      >
        {FILTER_CHIPS.map((chip, idx) => {
          const isActive = activeFilter === chip.id;
          return (
            <Animated.View
              key={chip.id}
              style={{ transform: [{ scale: chipScales[idx] }] }}
            >
              <TouchableOpacity
                style={[
                  styles.chip,
                  isActive ? styles.chipActive : styles.chipInactive,
                ]}
                onPress={() => handleFilterPress(chip.id, idx)}
                activeOpacity={1}
              >
                <Text
                  style={[
                    styles.chipText,
                    isActive ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {chip.emoji ? `${chip.emoji} ${chip.label}` : chip.label}
                </Text>
                {/* Live dot on active chip */}
                {isActive && <View style={styles.chipLiveDot} />}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 50,
    paddingHorizontal: ms(16),
    paddingBottom: vs(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(10),
  },

  // ── Icon Button (hamburger, bell, settings) ──────────────────────────────
  iconBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(12),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  // ── Hamburger lines ──────────────────────────────────────────────────────
  hamburgerLines: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamLine: {
    width: ms(20),
    height: ms(2),
    backgroundColor: '#222222',
    borderRadius: ms(1),
  },

  // ── Location pill ────────────────────────────────────────────────────────
  locationPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    borderRadius: ms(20),
    paddingVertical: vs(6),
    paddingLeft: ms(8),
    paddingRight: ms(12),
    marginHorizontal: ms(10),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  locationDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: '#2563EB',
    flexShrink: 0,
  },
  locationText: {
    flex: 1,
    fontSize: normFont(14),
    fontWeight: '600',
    color: '#111111',
    letterSpacing: -0.2,
  },

  // ── Notification dot ─────────────────────────────────────────────────────
  notifDot: {
    position: 'absolute',
    top: ms(7),
    right: ms(7),
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: '#EF4444',
    borderWidth: ms(2),
    borderColor: '#FFFFFF',
  },

  // ── Right buttons group ──────────────────────────────────────────────────
  rightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ── Filter Chips ─────────────────────────────────────────────────────────
  chipsScroll: {
    flexGrow: 0,
  },
  chipsContent: {
    paddingBottom: vs(4),
    paddingRight: ms(4),
    gap: ms(6),
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(5),
    paddingHorizontal: ms(14),
    paddingVertical: vs(7),
    borderRadius: ms(20),
    borderWidth: 1.5,
    flexShrink: 0,
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8E8E8',
  },
  chipText: {
    fontSize: normFont(13),
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#555555',
  },
  // Live pulse dot inside active chip
  chipLiveDot: {
    width: ms(5),
    height: ms(5),
    borderRadius: ms(3),
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});

export default MapHeader;
