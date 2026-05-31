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
  // ── Entrance animation ────────────────────────────────────────────────────
  const slideY    = useRef(new Animated.Value(-80)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

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
      {/* ── Single Row Layout: Filter Chips + Notification Bell ────────── */}
      <View style={styles.headerContent}>
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

        {/* Notification Bell */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onNotificationPress}
          activeOpacity={0.94}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={ms(18)} color="#333333" />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>
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
    paddingBottom: vs(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: ms(12),
  },

  // ── Icon Button (bell) ───────────────────────────────────────────────────
  iconBtn: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
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

  // ── Filter Chips ─────────────────────────────────────────────────────────
  chipsScroll: {
    flex: 1,
  },
  chipsContent: {
    paddingRight: ms(4),
    gap: ms(6),
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(5),
    paddingHorizontal: ms(14),
    paddingVertical: vs(10),
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
