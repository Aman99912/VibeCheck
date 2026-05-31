import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Text,
  PanResponder,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Colors,
  CText,
  AppButton,
  AppAlert,
  InputBox,
  ms,
  vs,
  normFont,
} from '../../../Reusable-Component';
import HostProfile from './hostProfile';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Activity helpers ──────────────────────────────────────────────────────────
const getActivityEmoji = (icon) => {
  switch (icon) {
    case 'sports_soccer':     return '⚽';
    case 'sports_basketball': return '🏀';
    case 'local_cafe':        return '☕';
    case 'music_note':        return '🎵';
    case 'sports_gaming':     return '🎮';
    default:                  return '✨';
  }
};

const getHostAvatar = (icon) => {
  switch (icon) {
    case 'sports_soccer':     return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop';
    case 'sports_basketball': return 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&fit=crop';
    case 'local_cafe':        return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop';
    case 'music_note':        return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop';
    default:                  return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop';
  }
};

// Avatar data per activity type
const getAvatarData = (icon) => {
  switch (icon) {
    case 'sports_soccer':
      return [
        { bg: '#1A5C2E', initial: 'R' },
        { bg: '#16A34A', initial: 'A' },
        { bg: '#22C55E', initial: 'S' },
      ];
    case 'local_cafe':
      return [
        { bg: '#6B3D1E', initial: 'P' },
        { bg: '#92400E', initial: 'M' },
        { bg: '#B45309', initial: 'K' },
      ];
    case 'music_note':
      return [
        { bg: '#4A1D6E', initial: 'D' },
        { bg: '#7C3AED', initial: 'N' },
        { bg: '#9333EA', initial: 'L' },
      ];
    case 'sports_basketball':
      return [
        { bg: '#B84900', initial: 'V' },
        { bg: '#EA580C', initial: 'J' },
        { bg: '#F97316', initial: 'T' },
      ];
    default:
      return [
        { bg: '#1E3A6E', initial: 'G' },
        { bg: '#2563EB', initial: 'H' },
        { bg: '#3B82F6', initial: 'C' },
      ];
  }
};

// Emoji reactions config
const REACTIONS = [
  { key: 'fire',     emoji: '🔥', defaultCount: 8  },
  { key: 'thumbs',   emoji: '👍', defaultCount: 5  },
  { key: 'hundred',  emoji: '💯', defaultCount: 3  },
];

// ── ViewPin ───────────────────────────────────────────────────────────────────
const ViewPin = ({ visible, onClose, pin, onJoinSuccess, joinedPinIds = [], onLeaveVibe }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // ── Sheet animation ───────────────────────────────────────────────────────
  const slideAnim    = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // ── PanResponder (drag handle to dismiss) ─────────────────────────────────
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) panY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 0.8) {
          // Dismiss
          handleClose();
        } else {
          // Snap back
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 18,
            stiffness: 200,
          }).start();
        }
      },
    })
  ).current;

  // ── State ─────────────────────────────────────────────────────────────────
  const [alertVisible,       setAlertVisible]       = useState(false);
  const [leaveModalVisible,  setLeaveModalVisible]  = useState(false);
  const [leaveReason,        setLeaveReason]        = useState('');
  const [profileVisible,     setProfileVisible]     = useState(false);
  const [joined,             setJoined]             = useState(false);
  const [displayCount,       setDisplayCount]       = useState(0);
  const [reactionCounts,     setReactionCounts]     = useState({
    fire: 8, thumbs: 5, hundred: 3,
  });

  // Reaction bounce animations
  const reactionScales = useRef({
    fire:    new Animated.Value(1),
    thumbs:  new Animated.Value(1),
    hundred: new Animated.Value(1),
  }).current;

  // Join button animation
  const joinScale     = useRef(new Animated.Value(1)).current;
  const [joinDone,    setJoinDone]  = useState(false);

  // ── handleClose (must be defined before early-return so no hooks below it) ─
  const handleClose = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      panY.setValue(0);
      onClose();
    });
  }, [onClose, slideAnim, panY]);

  // ── Derived pin data ──────────────────────────────────────────────────────
  const isJoined    = pin ? joinedPinIds.includes(pin.id) : false;
  const isJoinedAny = joinedPinIds.length > 0;

  const title        = pin?.title       || 'Special Vibe Meetup';
  const hostedBy     = pin?.hostName    || 'Rohit Sharma';
  const hostJoined   = pin?.hostJoined  || 'Joined 2 years ago';
  const hostAvatar   = pin?.hostAvatar  || getHostAvatar(pin?.icon);
  const locationName = pin?.locationName || 'Koramangala, Bengaluru';
  const distanceText = pin?.dist        || '0.4 km';
  const dateStr      = pin?.dateStr     || 'Today, 6:00 PM';
  const emoji        = getActivityEmoji(pin?.icon);
  const accentColor  = pin?.color       || '#2563EB';
  const avatarData   = getAvatarData(pin?.icon);
  const description  = pin?.description ||
    `Join us for an awesome ${title.toLowerCase()}! All levels welcome. Come meet new people and share the vibe!`;

  let peopleCount = 6;
  if (pin?.people) {
    const m = pin.people.match(/(\d+)/);
    if (m) peopleCount = parseInt(m[0], 10);
  }

  // ── Open / close sheet ────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      // Reset all states
      panY.setValue(0);
      setJoined(false);
      setJoinDone(false);
      setDisplayCount(0);
      setReactionCounts({ fire: 8, thumbs: 5, hundred: 3 });

      // Slide up
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 120,
        mass: 0.8,
      }).start();

      // Count ticker: 0 → peopleCount over 600ms
      let count = 0;
      const steps   = Math.max(peopleCount, 1);
      const stepMs  = Math.floor(600 / steps);
      const ticker  = setInterval(() => {
        count += 1;
        setDisplayCount(count);
        if (count >= peopleCount) clearInterval(ticker);
      }, stepMs);
      return () => clearInterval(ticker);
    }
  }, [visible, peopleCount, slideAnim, panY]);

  // handleClose is defined above (before early-return guard)

  // ── Reaction tap ──────────────────────────────────────────────────────────
  const handleReaction = (key) => {
    setReactionCounts(prev => ({ ...prev, [key]: prev[key] + 1 }));
    const sc = reactionScales[key];
    Animated.sequence([
      Animated.spring(sc, { toValue: 1.4, useNativeDriver: true, damping: 8, stiffness: 300 }),
      Animated.spring(sc, { toValue: 1,   useNativeDriver: true, damping: 12, stiffness: 250 }),
    ]).start();
  };

  // ── Join button press ─────────────────────────────────────────────────────
  const handleJoinPress = () => {
    // Scale press feedback
    Animated.sequence([
      Animated.timing(joinScale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.spring(joinScale,  { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 200 }),
    ]).start();

    // Show the community guidelines agree modal
    setAlertVisible(true);
  };

  // ── Sheet combined translateY ─────────────────────────────────────────────
  const sheetTranslateY = Animated.add(slideAnim, panY);

  if (!pin || !visible) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]} pointerEvents="box-none">
      <View style={[styles.modalRoot]} pointerEvents="box-none">

        {/* ── Bottom Sheet ───────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, vs(24)) + vs(85) },
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          {/* Scrollable content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >

            {/* ── 1. Clean Header (Title & Host) ────────────────────── */}
            <View style={styles.cleanHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerEmoji}>{emoji}</Text>
                <Text style={styles.activityName} numberOfLines={2}>{title}</Text>
              </View>
              <TouchableOpacity
                style={styles.hostMini}
                activeOpacity={0.8}
                onPress={() => setProfileVisible(true)}
              >
                <Image source={{ uri: hostAvatar }} style={styles.hostMiniAvatar} />
              </TouchableOpacity>
            </View>

            {/* ── 2. Context Card (Where & When) ─────────────────────── */}
            <View style={styles.contextCard}>
              <View style={styles.contextRow}>
                <View style={styles.contextIconWrap}>
                  <Ionicons name="calendar-outline" size={ms(18)} color="#111111" />
                </View>
                <View style={styles.contextTextWrap}>
                  <Text style={styles.contextLabel}>When</Text>
                  <Text style={styles.contextValue}>{dateStr}</Text>
                </View>
              </View>

              <View style={styles.contextDivider} />

              <View style={styles.contextRow}>
                <View style={styles.contextIconWrap}>
                  <Ionicons name="location-outline" size={ms(18)} color="#111111" />
                </View>
                <View style={styles.contextTextWrap}>
                  <Text style={styles.contextLabel}>Where</Text>
                  <Text style={styles.contextValue} numberOfLines={1}>{locationName}</Text>
                  <Text style={styles.contextSubValue}>{distanceText} away</Text>
                </View>
              </View>
            </View>

            {/* ── 3. Description ─────────────────────────────────────── */}
            <Text style={styles.description} numberOfLines={3}>{description}</Text>

            {/* ── 4. Social Proof (Attendees) ────────────────────────── */}
            <View style={styles.attendeesRow}>
              <View style={styles.avatarStack}>
                {avatarData.map((av, i) => (
                  <View
                    key={i}
                    style={[
                      styles.avatarCircle,
                      { backgroundColor: av.bg, marginLeft: i === 0 ? 0 : -ms(10), zIndex: 10 - i },
                    ]}
                  >
                    <Text style={styles.avatarInitial}>{av.initial}</Text>
                  </View>
                ))}
                {peopleCount > 3 && (
                  <View style={[styles.avatarCircle, styles.avatarMore, { marginLeft: -ms(10), zIndex: 0 }]}>
                    <Text style={styles.avatarMoreText}>+{peopleCount - 3}</Text>
                  </View>
                )}
                <Text style={styles.goingText}>{displayCount} people going</Text>
              </View>
            </View>

          </ScrollView>

          {/* ── Bottom Action Bar ───────────────────────────────────────── */}
          <View style={styles.bottomBar}>
            {isJoined ? (
              // Already joined: Open Chat + Leave
              <View style={styles.joinedActions}>
                <TouchableOpacity
                  style={styles.chatBtn}
                  onPress={() => { handleClose(); navigation.navigate('Activity'); }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="chatbubbles-outline" size={ms(18)} color="#2563EB" />
                  <Text style={styles.chatBtnText}>Open Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.leaveBtn}
                  onPress={() => { setLeaveReason(''); setLeaveModalVisible(true); }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="exit-outline" size={ms(18)} color={Colors.error} />
                  <Text style={styles.leaveBtnText}>Leave</Text>
                </TouchableOpacity>
              </View>
            ) : isJoinedAny ? (
              // Already in a different vibe
              <View style={styles.disabledWrapper}>
                <Ionicons name="lock-closed-outline" size={ms(16)} color={Colors.textMuted} />
                <Text style={styles.disabledText}>You're already in a Vibe</Text>
              </View>
            ) : (
              // Join button
              <Animated.View style={[styles.joinBtnWrapper, { transform: [{ scale: joinScale }] }]}>
                <TouchableOpacity
                  style={[
                    styles.joinBtn,
                    { backgroundColor: joinDone ? '#16A34A' : '#2563EB' },
                  ]}
                  onPress={handleJoinPress}
                  disabled={joinDone}
                  activeOpacity={0.95}
                >
                  <Text style={styles.joinBtnText}>
                    {joinDone ? '✓  Joined!' : 'Join Activity'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </View>

      {/* ── Join Alert (kept for legacy flow compatibility) ────────────── */}
      <AppAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="Join Vibe"
        confirmTitle="Join"
        onConfirm={() => { setAlertVisible(false); onJoinSuccess?.(); }}
        cancelTitle="Cancel"
        onCancel={() => setAlertVisible(false)}
        type="confirm"
        iconName=""
        stackedButtons={false}
      >
        <View style={styles.alertBody}>
          <CText style={styles.alertText}>
            You'll join the group chat, see live locations, and get instant updates for this vibe.
          </CText>
        </View>
      </AppAlert>

      {/* ── Leave Reason Modal ─────────────────────────────────────────── */}
      <Modal
        visible={leaveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLeaveModalVisible(false)}
      >
        <View style={styles.leaveOverlay}>
          <View style={styles.leaveCard}>
            <View style={styles.leaveIconRow}>
              <View style={styles.leaveIconWrap}>
                <Ionicons name="exit-outline" size={ms(26)} color={Colors.error} />
              </View>
            </View>
            <CText style={styles.leaveTitle}>Leave this Vibe?</CText>
            <CText style={styles.leaveSubtitle}>
              Let the host know why you can't make it. It helps the community.
            </CText>
            <InputBox
              type="multiline"
              label="Reason (optional)"
              placeholder="e.g. Got busy, plans changed..."
              value={leaveReason}
              onChangeText={setLeaveReason}
              maxLength={120}
              containerStyle={styles.leaveInput}
            />
            <View style={styles.leaveActions}>
              <TouchableOpacity
                style={styles.leaveCancelBtn}
                onPress={() => setLeaveModalVisible(false)}
                activeOpacity={0.7}
              >
                <CText style={styles.leaveCancelText}>Cancel</CText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.leaveConfirmBtn,
                  !leaveReason.trim() && styles.leaveConfirmDisabled,
                ]}
                disabled={!leaveReason.trim()}
                onPress={() => {
                  setLeaveModalVisible(false);
                  onLeaveVibe?.(pin.id, leaveReason);
                }}
                activeOpacity={0.8}
              >
                <CText style={styles.leaveConfirmText}>Leave Vibe</CText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Host Profile ─────────────────────────────────────────────────── */}
      <HostProfile
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        host={{ name: hostedBy, avatar: hostAvatar, joined: hostJoined }}
        accentColor={accentColor}
      />
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // Modal root
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  // ── Sheet ─────────────────────────────────────────────────────────────────
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
    maxHeight: SCREEN_HEIGHT * 0.92,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 24,
    overflow: 'hidden',
  },

  // Drag handle
  dragHandleArea: {
    paddingVertical: vs(10),
    alignItems: 'center',
  },
  dragHandle: {
    width: ms(40),
    height: ms(4),
    borderRadius: ms(2),
    backgroundColor: '#E0E0E0',
  },

  // Scroll content
  scrollContent: {
    paddingBottom: vs(12),
  },

  // ── Clean Header ──────────────────────────────────────────────────────────
  cleanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(20),
    marginBottom: vs(20),
    marginTop: vs(4),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: ms(16),
  },
  headerEmoji: {
    fontSize: ms(32),
    lineHeight: ms(38),
    marginRight: ms(12),
  },
  activityName: {
    flex: 1,
    fontSize: normFont(22),
    fontWeight: '800',
    color: '#0A0A0A',
    letterSpacing: -0.5,
    lineHeight: normFont(26),
  },
  hostMini: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  hostMiniAvatar: {
    width: '100%',
    height: '100%',
  },

  // ── Context Card ──────────────────────────────────────────────────────────
  contextCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: ms(20),
    marginHorizontal: ms(20),
    padding: ms(16),
    marginBottom: vs(16),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contextIconWrap: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(10),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    marginRight: ms(12),
  },
  contextTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  contextLabel: {
    fontSize: normFont(11),
    fontWeight: '700',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: vs(2),
  },
  contextValue: {
    fontSize: normFont(15),
    fontWeight: '600',
    color: '#111111',
  },
  contextSubValue: {
    fontSize: normFont(13),
    fontWeight: '500',
    color: '#2563EB',
    marginTop: vs(1),
  },
  contextDivider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: vs(12),
    marginLeft: ms(48), // align with text
  },

  // ── Description ───────────────────────────────────────────────────────────
  description: {
    fontSize: normFont(15),
    color: '#444444',
    lineHeight: normFont(15) * 1.5,
    marginHorizontal: ms(20),
    marginBottom: vs(20),
  },

  // ── Attendees ─────────────────────────────────────────────────────────────
  attendeesRow: {
    paddingHorizontal: ms(20),
    marginBottom: vs(16),
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    borderWidth: ms(2.5),
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarInitial: {
    fontSize: normFont(12),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarMore: {
    backgroundColor: '#9CA3AF', // Neutral gray for '+x'
  },
  avatarMoreText: {
    fontSize: normFont(10),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  goingText: {
    fontSize: normFont(14),
    fontWeight: '600',
    color: '#111111',
    marginLeft: ms(12),
  },

  // ── Bottom action bar ─────────────────────────────────────────────────────
  bottomBar: {
    paddingHorizontal: ms(20),
    paddingTop: vs(12),
    paddingBottom: vs(12),
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },

  // Join button
  joinBtnWrapper: {
    width: '100%',
  },
  joinBtn: {
    width: '100%',
    paddingVertical: vs(16),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  joinBtnText: {
    fontSize: normFont(16),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Joined state actions
  joinedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(6),
    backgroundColor: '#EFF6FF',
    paddingVertical: vs(14),
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.15)',
  },
  chatBtnText: {
    fontSize: normFont(14),
    fontWeight: '700',
    color: '#2563EB',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    paddingHorizontal: ms(14),
    paddingVertical: vs(14),
    borderRadius: ms(16),
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
  },
  leaveBtnText: {
    fontSize: normFont(13),
    fontWeight: '700',
    color: Colors.error,
  },

  // Disabled
  disabledWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(6),
    paddingVertical: vs(14),
  },
  disabledText: {
    fontSize: normFont(14),
    color: Colors.textMuted,
    fontWeight: '600',
  },

  // Alert
  alertBody: {
    paddingVertical: vs(4),
    paddingHorizontal: ms(4),
  },
  alertText: {
    fontSize: normFont(14),
    color: Colors.textSecondary,
    lineHeight: normFont(20),
    textAlign: 'center',
  },

  // Leave modal
  leaveOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ms(24),
  },
  leaveCard: {
    backgroundColor: Colors.white,
    borderRadius: ms(24),
    padding: ms(24),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  leaveIconRow: {
    alignItems: 'center',
    marginBottom: vs(12),
  },
  leaveIconWrap: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: Colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveTitle: {
    fontSize: normFont(18),
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: vs(8),
  },
  leaveSubtitle: {
    fontSize: normFont(13),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: normFont(19),
    marginBottom: vs(16),
  },
  leaveInput: {
    marginBottom: vs(20),
  },
  leaveActions: {
    flexDirection: 'row',
    gap: ms(10),
  },
  leaveCancelBtn: {
    flex: 1,
    paddingVertical: vs(13),
    borderRadius: ms(14),
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaveCancelText: {
    fontSize: normFont(14),
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  leaveConfirmBtn: {
    flex: 1,
    paddingVertical: vs(13),
    borderRadius: ms(14),
    backgroundColor: Colors.error,
    alignItems: 'center',
  },
  leaveConfirmDisabled: {
    opacity: 0.4,
  },
  leaveConfirmText: {
    fontSize: normFont(14),
    fontWeight: '700',
    color: Colors.white,
  },
});

export default ViewPin;
