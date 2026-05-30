import React, { useState } from 'react';
import {
  Modal,
  View,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
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

const getCoverImage = (icon) => {
  switch (icon) {
    case 'sports_soccer':
      return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&fit=crop';
    case 'sports_basketball':
      return 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800&fit=crop';
    case 'local_cafe':
      return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&fit=crop';
    case 'music_note':
      return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&fit=crop';
    default:
      return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&fit=crop';
  }
};

const ViewPin = ({ visible, onClose, pin, onJoinSuccess, joinedPinIds = [], onLeaveVibe }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [alertVisible, setAlertVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [profileVisible, setProfileVisible] = useState(false);

  if (!pin) return null;

  const isJoined = joinedPinIds.includes(pin.id);
  const isJoinedAny = joinedPinIds.length > 0;

  // Fallback defaults for pin fields if they don't exist
  const title = pin.title || 'Special Vibe Meetup';
  const hostedBy = pin.hostName || 'Arjun';
  const hostJoined = pin.hostJoined || 'Joined 2 years ago';
  const hostAvatar = pin.hostAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop';
  const locationName = pin.locationName || (pin.title === 'Football Match' ? 'Central Park, Koramangala' : 'Koramangala, Bengaluru');
  const dateStr = pin.dateStr || 'Today, 6:00 PM – 8:00 PM';

  // Calculate people count
  let peopleCount = 6;
  let peopleLimit = 8;
  if (pin.people) {
    const match = pin.people.match(/(\d+)/);
    if (match) {
      peopleCount = parseInt(match[0], 10);
      peopleLimit = peopleCount > 10 ? Math.ceil(peopleCount * 1.2) : 10;
    }
  }

  const description = pin.description || `Let's gather for a wonderful ${title.toLowerCase()}! All skills and backgrounds are welcome. Let's make new friends and vibe together!`;
  const tags = pin.tags || [pin.title === 'Football Match' ? 'Sports' : 'Social', 'Outdoor'];

  const avatarsList = pin.avatars || [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&fit=crop',
  ];

  const handleJoinPress = () => {
    setAlertVisible(true);
  };

  const handleConfirmJoin = () => {
    setAlertVisible(false);
    onJoinSuccess();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.rootContainer}>
        {/* Transparent Header overlay with Glass Circle Buttons */}
        <View style={[styles.floatingHeader, { paddingTop: Math.max(insets.top, vs(12)) }]}>
          <TouchableOpacity
            style={styles.glassButton}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <MaterialIcons name="arrow-back" size={ms(22)} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.glassButton}
            activeOpacity={0.8}
            onPress={() => console.log('Report pressed')}
          >
            <MaterialIcons name="flag" size={ms(22)} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Smooth Scrolling ScrollView */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, vs(16)) + vs(150) }]}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          decelerationRate="normal"
        >
          {/* Cover Image with subtle dark top gradient */}
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: getCoverImage(pin.icon) }}
              style={styles.coverImage}
              resizeMode="cover"
            />
            <View style={styles.topVignette} />
          </View>

          {/* Premium Physical Curved Overlap Container */}
          <View style={styles.contentContainer}>

            {/* Vibe Title */}
            <CText variant="h2" weight="bold" color={Colors.textPrimary} style={styles.title}>
              {title}
            </CText>

            {/* Organizer Row */}
            <View style={styles.organizerRow}>
              <Image source={{ uri: hostAvatar }} style={styles.organizerAvatar} />
              <CText variant="body" color={Colors.textSecondary} weight="medium">
                Hosted by <CText variant="body" weight="bold" color={Colors.primary}>{hostedBy}</CText>
              </CText>
            </View>

            {/* Premium Gen-Z styled Glass Detail Card capsules */}

            {/* 1. Location Capsule */}
            <View style={styles.detailsCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="location-on" size={ms(20)} color={Colors.primary} />
              </View>
              <View style={styles.detailsTextContainer}>
                <CText variant="caption" weight="bold" color={Colors.textMuted} style={styles.detailsLabel}>
                  WHERE
                </CText>
                <CText variant="body" weight="semibold" color={Colors.textPrimary} numberOfLines={2}>
                  {locationName}
                </CText>
              </View>
            </View>

            {/* 2. Date & Time Capsule */}
            <View style={styles.detailsCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="schedule" size={ms(20)} color={Colors.primary} />
              </View>
              <View style={styles.detailsTextContainer}>
                <CText variant="caption" weight="bold" color={Colors.textMuted} style={styles.detailsLabel}>
                  WHEN
                </CText>
                <CText variant="body" weight="semibold" color={Colors.textPrimary}>
                  {dateStr}
                </CText>
              </View>
            </View>

            {/* 3. Spots Capsule */}
            <View style={[styles.detailsCard, styles.spotsCard]}>
              <View style={styles.spotsRow}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="group" size={ms(20)} color={Colors.primary} />
                </View>
                <View style={styles.detailsTextContainer}>
                  <CText variant="caption" weight="bold" color={Colors.textMuted} style={styles.detailsLabel}>
                    SPOTS
                  </CText>
                  <CText variant="body" weight="semibold" color={Colors.textPrimary}>
                    {peopleCount} / {peopleLimit} Joined
                  </CText>
                </View>
              </View>
              {/* Sleek Progress Bar Indicator */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${(peopleCount / peopleLimit) * 100}%`, backgroundColor: pin.color || Colors.primary },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Description Box */}
            <View style={styles.descriptionBox}>
              <CText variant="body" color={Colors.textSecondary} style={styles.descriptionText}>
                {description}
              </CText>
            </View>

            {/* Category Tags Container */}
            <View style={styles.tagsContainer}>
              {tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <View style={styles.tagDot} />
                  <CText variant="caption" weight="bold" color={Colors.primary}>
                    {tag.toUpperCase()}
                  </CText>
                </View>
              ))}
            </View>

            {/* Members Section */}
            <View style={styles.section}>
              <CText variant="body" weight="bold" color={Colors.textPrimary} style={styles.sectionTitle}>
                Members Joined
              </CText>
              <View style={styles.avatarRow}>
                {avatarsList.slice(0, 5).map((avatarUrl, index) => (
                  <View
                    key={index}
                    style={[
                      styles.avatarWrapper,
                      { zIndex: 10 - index, marginLeft: index === 0 ? 0 : ms(-10) },
                    ]}
                  >
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                  </View>
                ))}
                {peopleCount > 5 && (
                  <View style={[styles.avatarBadge, { marginLeft: ms(-10) }]}>
                    <CText variant="caption" weight="bold" color={Colors.primary}>
                      +{peopleCount - 5}
                    </CText>
                  </View>
                )}
              </View>
            </View>

            {/* Organizer Profile Card */}
            <View style={styles.section}>
              <CText variant="body" weight="bold" color={Colors.textPrimary} style={styles.sectionTitle}>
                Host
              </CText>
              <View style={styles.hostCard}>
                <Image source={{ uri: hostAvatar }} style={styles.hostAvatar} />
                <View style={styles.hostInfo}>
                  <CText variant="body" weight="bold" color={Colors.textPrimary}>
                    {hostedBy}
                  </CText>
                  <CText variant="caption" color={Colors.textMuted}>
                    {hostJoined}
                  </CText>
                </View>
                <TouchableOpacity
                  style={styles.profileBtn}
                  activeOpacity={0.7}
                  onPress={() => setProfileVisible(true)}
                >
                  <CText variant="caption" weight="bold" color={Colors.primary}>
                    Profile
                  </CText>
                  <MaterialIcons name="chevron-right" size={ms(16)} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Floating Bottom Card - Detached floating glass panel in sync with NavBar.js */}
        <View style={[styles.bottomBar, { bottom: Math.max(insets.bottom, vs(12)) }]}>
          {isJoined ? (
            <View style={{ gap: vs(8) }}>
              <AppButton
                variant="primary"
                title="Open Chat"
                fullWidth
                size="lg"
                leftIcon="chat"
                onPress={() => {
                  onClose();
                  navigation.navigate('Activity');
                }}
                style={styles.premiumBtnGlow}
              />
              <TouchableOpacity
                onPress={() => {
                  setLeaveReason('');
                  setLeaveModalVisible(true);
                }}
                activeOpacity={0.75}
                style={styles.cancelLink}
              >
                <CText variant="body" color={Colors.error} weight="bold">
                  Cancel Request / Leave Vibe
                </CText>
              </TouchableOpacity>
            </View>
          ) : isJoinedAny ? (
            <AppButton
              variant="outline"
              title="Already in a Vibe"
              disabled
              fullWidth
              size="lg"
              style={styles.premiumBtnGlow}
            />
          ) : (
            <AppButton
              variant="primary"
              title="Accept & Join"
              fullWidth
              size="lg"
              rightIcon="arrow-forward"
              onPress={handleJoinPress}
              style={styles.premiumBtnGlow}
            />
          )}
        </View>

        {/* Screen 5: Join Vibe Confirmation Dialog */}
        <AppAlert
          visible={alertVisible}
          onClose={() => setAlertVisible(false)}
          title="Join Vibe"
          confirmTitle="Join"
          onConfirm={handleConfirmJoin}
          cancelTitle="Cancel"
          onCancel={() => setAlertVisible(false)}
          type="confirm"
          iconName="" // Hides the big icon circle to make the modal extremely small in height
          stackedButtons={false}
        >
          <View style={styles.alertContent}>
            <CText variant="bodySmall" color={Colors.textSecondary} align="center" style={styles.alertMessage}>
              You'll join the group chat, see other members' live locations, and receive instant updates for this vibe.
            </CText>
          </View>
        </AppAlert>

        {/* Leave Reason Modal */}
        <Modal
          visible={leaveModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLeaveModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.leaveReasonCard}>
              <CText variant="h3" weight="bold" color={Colors.textPrimary} style={styles.leaveTitle}>
                Leaving this Vibe?
              </CText>
              <CText variant="bodySmall" color={Colors.textSecondary} align="center" style={styles.leaveSubtitle}>
                Please let the host know why you cannot make it. Your feedback helps improve the community.
              </CText>

              <InputBox
                type="multiline"
                label="Reason for leaving"
                placeholder="e.g. Got busy, plans changed..."
                value={leaveReason}
                onChangeText={setLeaveReason}
                maxLength={100}
                containerStyle={styles.leaveInput}
              />

              <View style={styles.leaveActionsRow}>
                <TouchableOpacity
                  onPress={() => setLeaveModalVisible(false)}
                  activeOpacity={0.7}
                  style={styles.leaveCancelBtn}
                >
                  <CText variant="body" color={Colors.textSecondary} weight="semibold">
                    Cancel
                  </CText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setLeaveModalVisible(false);
                    if (onLeaveVibe) {
                      onLeaveVibe(pin.id, leaveReason);
                    }
                  }}
                  activeOpacity={0.75}
                  disabled={!leaveReason.trim()}
                  style={[
                    styles.leaveConfirmBtn,
                    !leaveReason.trim() && styles.leaveConfirmBtnDisabled
                  ]}
                >
                  <CText variant="body" color={Colors.white} weight="bold">
                    Leave Vibe
                  </CText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Host Profile Modal */}
        <HostProfile
          visible={profileVisible}
          onClose={() => setProfileVisible(false)}
          host={{
            name: hostedBy,
            avatar: hostAvatar,
            joined: hostJoined
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  floatingHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    alignItems: 'center',
    height: vs(64),
  },
  glassButton: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(21),
    backgroundColor: 'rgba(10, 22, 41, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    // padding bottom dynamically calculated in inline style
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: vs(280),
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: vs(100),
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  contentContainer: {
    marginTop: -vs(24),
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
    backgroundColor: Colors.white,
    paddingHorizontal: ms(20),
    paddingTop: vs(24),
  },
  title: {
    marginBottom: vs(12),
    lineHeight: normFont(28),
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(24),
  },
  organizerAvatar: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    marginRight: ms(8),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsCard: {
    backgroundColor: 'rgba(133, 108, 226, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.12)',
    borderRadius: ms(18),
    padding: ms(14),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  spotsCard: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingBottom: vs(16),
  },
  spotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: 'rgba(133, 108, 226, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(12),
  },
  detailsTextContainer: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: normFont(9),
    letterSpacing: 1.0,
    marginBottom: vs(1),
  },
  progressBarContainer: {
    marginTop: vs(12),
    paddingHorizontal: ms(2),
  },
  progressBarTrack: {
    height: vs(5),
    backgroundColor: 'rgba(133, 108, 226, 0.08)',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  section: {
    marginBottom: vs(24),
  },
  sectionTitle: {
    fontSize: normFont(16),
    marginBottom: vs(12),
  },
  descriptionBox: {
    backgroundColor: 'rgba(244, 246, 249, 0.65)',
    borderRadius: ms(16),
    padding: ms(16),
    marginBottom: vs(20),
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.06)',
  },
  descriptionText: {
    lineHeight: normFont(22),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: vs(20),
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(133, 108, 226, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.1)',
    paddingHorizontal: ms(12),
    paddingVertical: vs(5),
    borderRadius: ms(16),
    marginRight: ms(8),
    marginBottom: vs(8),
  },
  tagDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: Colors.primary,
    marginRight: ms(6),
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    borderWidth: 2,
    borderColor: Colors.white,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarBadge: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: 'rgba(133, 108, 226, 0.06)',
    borderWidth: 2,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(133, 108, 226, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.08)',
    borderRadius: ms(18),
    padding: ms(14),
  },
  hostAvatar: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    marginRight: ms(12),
  },
  hostInfo: {
    flex: 1,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.15)',
    paddingHorizontal: ms(12),
    paddingVertical: vs(6),
    borderRadius: ms(12),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bottomBar: {
    position: 'absolute',
    left: ms(16),
    right: ms(16),
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: 'rgba(133, 108, 226, 0.15)',
    borderRadius: ms(44),
    padding: ms(16),
    shadowColor: '#1A0C3C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  premiumBtnGlow: {
    borderWidth: 0,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: ms(30),
  },
  cancelLink: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(8),
    marginTop: vs(4),
    width: '100%',
  },
  alertContent: {
    width: '100%',
    paddingVertical: vs(6),
    paddingHorizontal: ms(8),
  },
  alertMessage: {
    lineHeight: normFont(18),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 41, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: ms(20),
  },
  leaveReasonCard: {
    backgroundColor: Colors.white,
    borderRadius: ms(20),
    padding: ms(20),
    width: '100%',
    maxWidth: ms(320),
    shadowColor: '#1A0C3C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  leaveTitle: {
    marginBottom: vs(6),
    textAlign: 'center',
  },
  leaveSubtitle: {
    marginBottom: vs(16),
    textAlign: 'center',
    lineHeight: normFont(18),
  },
  leaveInput: {
    marginBottom: vs(16),
  },
  leaveActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: ms(12),
  },
  leaveCancelBtn: {
    paddingVertical: vs(10),
    paddingHorizontal: ms(16),
  },
  leaveConfirmBtn: {
    backgroundColor: Colors.error,
    borderRadius: ms(10),
    paddingVertical: vs(10),
    paddingHorizontal: ms(20),
  },
  leaveConfirmBtnDisabled: {
    backgroundColor: Colors.disabled,
    opacity: 0.6,
  },
});

export default ViewPin;
