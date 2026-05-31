import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CText, Colors, ms, vs, normFont } from '../../../Reusable-Component';
import AvatarRow from './AvatarRow';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper to get nice icon colors
const getIconTheme = (icon) => {
  switch (icon) {
    case 'sports_soccer':
    case 'sports-soccer':
      return { bg: '#E0F2FE', color: '#0284C7', ionicon: 'football' }; // Blue
    case 'local_cafe':
      return { bg: '#FEF3C7', color: '#D97706', ionicon: 'cafe' }; // Orange/Amber
    case 'music_note':
    case 'music-note':
      return { bg: '#FCE7F3', color: '#DB2777', ionicon: 'musical-notes' }; // Pink
    case 'sports_basketball':
    case 'sports-basketball':
      return { bg: '#FFEDD5', color: '#EA580C', ionicon: 'basketball' }; // Orange
    default:
      return { bg: Colors.primary + '15', color: Colors.primary, ionicon: 'calendar' }; // Default
  }
};

const getActivityEmoji = (icon) => {
  switch (icon) {
    case 'sports_soccer':
    case 'sports-soccer':  return '⚽';
    case 'local_cafe':     return '☕';
    case 'music_note':
    case 'music-note':     return '🎵';
    case 'sports_basketball':
    case 'sports-basketball': return '🏀';
    default:               return '✨';
  }
};

// ── Pulsing Live Dot ─────────────────────────────────────────────────────────
const LivePulse = () => {
  const pulse = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.6, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,   duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [pulse, opacity]);

  return (
    <View style={liveDot.wrap}>
      <Animated.View style={[liveDot.ring, { transform: [{ scale: pulse }], opacity }]} />
      <View style={liveDot.core} />
    </View>
  );
};

const liveDot = StyleSheet.create({
  wrap: { width: ms(12), height: ms(12), alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: ms(12), height: ms(12),
    borderRadius: ms(6),
    backgroundColor: '#10B981',
  },
  core: {
    width: ms(7), height: ms(7),
    borderRadius: ms(4),
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
});

// ── Main Card ─────────────────────────────────────────────────────────────────
const LiveActivityCard = ({ activity, onChat, onViewLocation, onMenu, onViewRequests }) => {
  const fillPct = Math.round((activity.joined / activity.limit) * 100);
  const theme = getIconTheme(activity.icon);
  const emoji = getActivityEmoji(activity.icon);

  return (
    <View style={styles.card}>
      
      {/* ── Top Header Section ── */}
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
            <Ionicons name={theme.ionicon} size={ms(28)} color={theme.color} />
          </View>
          <View style={styles.titleTextWrap}>
            <View style={styles.titleLine}>
              <CText style={styles.title} numberOfLines={1}>{activity.title} {emoji}</CText>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={ms(14)} color={Colors.textMuted} />
              <CText style={styles.locationText} numberOfLines={1}>{activity.location}</CText>
            </View>
          </View>

          {/* Right actions: Live badge + Menu */}
          <View style={styles.topRightActions}>
            <TouchableOpacity onPress={onMenu} style={styles.menuBtn} hitSlop={{top:10, bottom:10, left:10, right:10}}>
              <Ionicons name="ellipsis-horizontal" size={ms(20)} color={Colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.liveBadge}>
              <LivePulse />
              <CText style={styles.liveText}>LIVE</CText>
            </View>
          </View>
        </View>
      </View>

      {/* ── Info & Progress Section ── */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoPill}>
            <Ionicons name="time-outline" size={ms(14)} color={Colors.textSecondary} />
            <CText style={styles.infoPillText} numberOfLines={1}>{activity.time}</CText>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${fillPct}%` }]} />
          </View>
          <CText style={styles.progressLabel}>{activity.joined}/{activity.limit} Joined</CText>
        </View>

        {/* Avatars */}
        <View style={styles.avatarRow}>
          <AvatarRow avatars={Array(activity.joined).fill(null)} maxVisible={5} />
          <CText style={styles.avatarCountText}>{activity.joined} members going</CText>
        </View>
      </View>

      {/* ── Action Buttons ── */}
      <View style={styles.actionRow}>
        {activity.isHost ? (
          <>
            <TouchableOpacity style={styles.primaryAction} onPress={onViewRequests} activeOpacity={0.85}>
              <Ionicons name="people" size={ms(18)} color={Colors.white} />
              <CText style={styles.primaryActionText} numberOfLines={1}>View Requests ({activity.requests || 0})</CText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryAction} onPress={onChat} activeOpacity={0.8}>
              <Ionicons name="chatbubbles-outline" size={ms(18)} color={Colors.primary} />
              <CText style={styles.secondaryActionText} numberOfLines={1}>Open Chat</CText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.primaryAction} onPress={onChat} activeOpacity={0.85}>
              <Ionicons name="chatbubbles-outline" size={ms(18)} color={Colors.white} />
              <CText style={styles.primaryActionText} numberOfLines={1}>Open Chat</CText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryAction} onPress={onViewLocation} activeOpacity={0.8}>
              <Ionicons name="map-outline" size={ms(18)} color={Colors.primary} />
              <CText style={styles.secondaryActionText}>Location</CText>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    marginHorizontal: ms(16),
    marginBottom: vs(16),
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: ms(16),
  },

  // Header
  headerSection: {
    marginBottom: vs(14),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(14),
  },
  titleTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(4),
  },
  title: {
    fontSize: normFont(17),
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  locationText: {
    fontSize: normFont(13),
    color: Colors.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
  },
  topRightActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: ms(56),
  },
  menuBtn: {
    marginBottom: 'auto',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    backgroundColor: '#ECFDF5', // Light green
    paddingHorizontal: ms(8),
    paddingVertical: vs(4),
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  liveText: {
    fontSize: normFont(10),
    fontWeight: '800',
    color: '#059669', // Emerald 600
    letterSpacing: 0.5,
  },

  // Info section
  infoSection: {
    marginBottom: vs(16),
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: vs(12),
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    backgroundColor: '#F9FAFB',
    paddingHorizontal: ms(12),
    paddingVertical: vs(6),
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoPillText: {
    fontSize: normFont(12),
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    marginBottom: vs(14),
  },
  progressTrack: {
    flex: 1,
    height: vs(6),
    backgroundColor: '#F3F4F6',
    borderRadius: vs(3),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: vs(3),
  },
  progressLabel: {
    fontSize: normFont(12),
    fontWeight: '700',
    color: Colors.primary,
  },

  // Avatars
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
  },
  avatarCountText: {
    fontSize: normFont(12),
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: ms(12),
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(8),
    backgroundColor: Colors.primary,
    borderRadius: ms(14),
    paddingVertical: vs(12),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryActionText: {
    fontSize: normFont(14),
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(8),
    backgroundColor: '#F9FAFB',
    borderRadius: ms(14),
    paddingVertical: vs(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryActionText: {
    fontSize: normFont(14),
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});

export default LiveActivityCard;
