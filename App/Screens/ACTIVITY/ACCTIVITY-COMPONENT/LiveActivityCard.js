import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CText, Colors, ms, vs, normFont } from '../../../Reusable-Component';
import AvatarRow from './AvatarRow';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - ms(32);
const IMAGE_HEIGHT = vs(200);

const getCoverImage = (icon) => {
  switch (icon) {
    case 'sports_soccer':
    case 'sports-soccer':
      return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&fit=crop';
    case 'local_cafe':
      return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&fit=crop';
    case 'music_note':
      return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&fit=crop';
    case 'sports_basketball':
      return 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800&fit=crop';
    default:
      return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&fit=crop';
  }
};

const getActivityEmoji = (icon) => {
  switch (icon) {
    case 'sports_soccer':
    case 'sports-soccer':  return '⚽';
    case 'local_cafe':     return '☕';
    case 'music_note':     return '🎵';
    case 'sports_basketball': return '🏀';
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
    backgroundColor: '#4ADE80',
  },
  core: {
    width: ms(7), height: ms(7),
    borderRadius: ms(4),
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
});

// ── Main Card ─────────────────────────────────────────────────────────────────
const LiveActivityCard = ({ activity, onChat, onViewLocation, onMenu }) => {
  const emoji = getActivityEmoji(activity.icon);
  const fillPct = Math.round((activity.joined / activity.limit) * 100);

  return (
    <View style={styles.card}>

      {/* ── Hero Image ─────────────────────────────────────────── */}
      <View style={styles.heroWrap}>
        <Image
          source={{ uri: getCoverImage(activity.icon) }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Dark gradient from bottom up */}
        <View style={styles.heroGradient} />

        {/* Top left: LIVE badge */}
        <View style={styles.liveBadge}>
          <LivePulse />
          <CText style={styles.liveText}>LIVE</CText>
        </View>

        {/* Top right: menu ⋯ */}
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={onMenu}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
        >
          <Ionicons name="ellipsis-horizontal" size={ms(18)} color={Colors.white} />
        </TouchableOpacity>

        {/* Bottom left: title + location overlaid on image */}
        <View style={styles.heroOverlayInfo}>
          <View style={styles.emojiPill}>
            <CText style={styles.emojiText}>{emoji}</CText>
          </View>
          <CText style={styles.heroTitle} numberOfLines={1}>{activity.title}</CText>
          <View style={styles.heroLocationRow}>
            <Ionicons name="location-sharp" size={ms(12)} color="rgba(255,255,255,0.8)" />
            <CText style={styles.heroLocationText} numberOfLines={1}>{activity.location}</CText>
          </View>
        </View>
      </View>

      {/* ── Info Row ──────────────────────────────────────────────── */}
      <View style={styles.infoSection}>

        {/* Time + member count */}
        <View style={styles.infoRow}>
          <View style={styles.infoPill}>
            <Ionicons name="time-outline" size={ms(13)} color={Colors.primary} />
            <CText style={styles.infoPillText} numberOfLines={1}>{activity.time}</CText>
          </View>
          <View style={styles.infoPill}>
            <Ionicons name="people-outline" size={ms(13)} color={Colors.primary} />
            <CText style={styles.infoPillText}>{activity.joined}/{activity.limit} joined</CText>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${fillPct}%` }]} />
          </View>
          <CText style={styles.progressLabel}>{fillPct}%</CText>
        </View>

        {/* Avatars */}
        <View style={styles.avatarRow}>
          <AvatarRow avatars={Array(activity.joined).fill(null)} maxVisible={5} />
          <CText style={styles.avatarCountText}>{activity.joined} members going</CText>
        </View>
      </View>

      {/* ── Action Buttons ─────────────────────────────────────────── */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.primaryAction} onPress={onChat} activeOpacity={0.85}>
          <Ionicons name="chatbubble-ellipses" size={ms(17)} color={Colors.white} />
          <CText style={styles.primaryActionText}>Open Chat</CText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryAction} onPress={onViewLocation} activeOpacity={0.8}>
          <Ionicons name="navigate-outline" size={ms(17)} color={Colors.primary} />
          <CText style={styles.secondaryActionText}>Location</CText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    marginHorizontal: ms(16),
    marginBottom: vs(16),
    backgroundColor: Colors.white,
    borderRadius: ms(22),
    overflow: 'hidden',
    shadowColor: '#1A0C3C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.07)',
  },

  // Hero
  heroWrap: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
    // layered dark overlay to mimic gradient
    backgroundColor: 'rgba(5, 10, 24, 0.62)',
  },

  // Live badge
  liveBadge: {
    position: 'absolute',
    top: ms(14),
    left: ms(14),
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    backgroundColor: 'rgba(10, 22, 41, 0.55)',
    paddingHorizontal: ms(10),
    paddingVertical: vs(5),
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  liveText: {
    fontSize: normFont(11),
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },

  // Menu button
  menuBtn: {
    position: 'absolute',
    top: ms(12),
    right: ms(14),
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: 'rgba(10, 22, 41, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  // Overlay info on image
  heroOverlayInfo: {
    position: 'absolute',
    bottom: ms(16),
    left: ms(16),
    right: ms(16),
  },
  emojiPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: ms(8),
    paddingVertical: vs(3),
    borderRadius: ms(8),
    marginBottom: vs(6),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emojiText: {
    fontSize: normFont(14),
    lineHeight: normFont(17),
  },
  heroTitle: {
    fontSize: normFont(20),
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
    lineHeight: normFont(24),
    marginBottom: vs(4),
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  heroLocationText: {
    fontSize: normFont(12),
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    flex: 1,
  },

  // Info section
  infoSection: {
    paddingHorizontal: ms(16),
    paddingTop: vs(14),
    paddingBottom: vs(4),
  },
  infoRow: {
    flexDirection: 'row',
    gap: ms(8),
    marginBottom: vs(12),
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(5),
    backgroundColor: 'rgba(133, 108, 226, 0.07)',
    paddingHorizontal: ms(10),
    paddingVertical: vs(5),
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.12)',
    flexShrink: 1,
  },
  infoPillText: {
    fontSize: normFont(11),
    fontWeight: '600',
    color: Colors.textSecondary,
    flexShrink: 1,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
    marginBottom: vs(12),
  },
  progressTrack: {
    flex: 1,
    height: vs(4),
    backgroundColor: 'rgba(133, 108, 226, 0.1)',
    borderRadius: vs(2),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: vs(2),
  },
  progressLabel: {
    fontSize: normFont(11),
    fontWeight: '700',
    color: Colors.primary,
    minWidth: ms(30),
    textAlign: 'right',
  },

  // Avatars
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    marginBottom: vs(2),
  },
  avatarCountText: {
    fontSize: normFont(11),
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: ms(10),
    paddingHorizontal: ms(16),
    paddingTop: vs(12),
    paddingBottom: vs(16),
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(7),
    backgroundColor: Colors.primary,
    borderRadius: ms(14),
    paddingVertical: vs(13),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionText: {
    fontSize: normFont(14),
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.1,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(7),
    backgroundColor: Colors.white,
    borderRadius: ms(14),
    paddingVertical: vs(13),
    borderWidth: 1.5,
    borderColor: 'rgba(133, 108, 226, 0.2)',
  },
  secondaryActionText: {
    fontSize: normFont(14),
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.1,
  },
});

export default LiveActivityCard;
