import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CText, AppButton, AppIcon, Colors, ms, vs } from '../../../Reusable-Component';
import AvatarRow from './AvatarRow';

const LiveActivityCard = ({ activity, onChat, onViewLocation, onMenu }) => {
  return (
    <View style={styles.card}>
      {/* Top half: Image + Info side by side */}
      <View style={styles.topRow}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder} />

          {/* LIVE badge */}
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <CText variant="label" weight="bold" color={Colors.white}>
              LIVE
            </CText>
          </View>

          {/* Category icon */}
          <View style={styles.categoryIcon}>
            <AppIcon name="sports-soccer" size={ms(20)} color={Colors.white} />
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <CText variant="body" weight="bold" color={Colors.textPrimary} numberOfLines={1} style={styles.titleText}>
              {activity.title} {activity.emoji || ''}
            </CText>
            <TouchableOpacity onPress={onMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <AppIcon name="more-horiz" size={ms(22)} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={styles.metaRow}>
            <AppIcon name="location-on" size={ms(14)} color={Colors.textMuted} />
            <CText variant="caption" weight="regular" color={Colors.textSecondary} numberOfLines={1} style={styles.metaText}>
              {activity.location}
            </CText>
          </View>

          {/* Time */}
          <View style={styles.metaRow}>
            <AppIcon name="schedule" size={ms(14)} color={Colors.textMuted} />
            <CText variant="caption" weight="regular" color={Colors.textSecondary} numberOfLines={1} style={styles.metaText}>
              {activity.time}
            </CText>
          </View>

          {/* Members */}
          <View style={styles.metaRow}>
            <AppIcon name="group" size={ms(14)} color={Colors.textMuted} />
            <CText variant="caption" weight="regular" color={Colors.textSecondary} style={styles.metaText}>
              {activity.joined} / {activity.limit} Joined
            </CText>
          </View>

          {/* Avatar row */}
          <View style={styles.avatarSection}>
            <AvatarRow avatars={Array(activity.joined).fill(null)} maxVisible={5} />
          </View>
        </View>
      </View>

      {/* Bottom: Buttons */}
      <View style={styles.buttonContainer}>
        <AppButton
          variant="primary"
          title="Open Activity Chat"
          leftIcon="chat-bubble"
          onPress={onChat}
          fullWidth
          size="sm"
        />
        <AppButton
          variant="outline"
          title="View Location"
          leftIcon="location-on"
          onPress={onViewLocation}
          fullWidth
          size="sm"
          style={styles.viewLocationBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: ms(16),
    backgroundColor: Colors.white,
    borderRadius: ms(16),
    overflow: 'hidden',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: vs(16),
  },
  topRow: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: '42%',
    minHeight: vs(200),
    position: 'relative',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.gray300,
  },
  liveBadge: {
    position: 'absolute',
    top: ms(10),
    left: ms(10),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: ms(8),
    paddingVertical: vs(3),
    borderRadius: ms(6),
    gap: ms(4),
  },
  liveDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: Colors.white,
  },
  categoryIcon: {
    position: 'absolute',
    bottom: ms(10),
    left: ms(10),
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: ms(12),
    paddingVertical: vs(12),
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(8),
  },
  titleText: {
    flex: 1,
    marginRight: ms(4),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(4),
    gap: ms(4),
  },
  metaText: {
    flex: 1,
  },
  avatarSection: {
    marginTop: vs(8),
  },
  buttonContainer: {
    paddingHorizontal: ms(12),
    paddingBottom: vs(12),
    gap: vs(8),
  },
  viewLocationBtn: {
    marginTop: 0,
  },
});

export default LiveActivityCard;
