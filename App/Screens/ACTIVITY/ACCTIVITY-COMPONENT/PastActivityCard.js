import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { CText, AppButton, AppIcon, Colors, ms, vs } from '../../../Reusable-Component';
import AvatarRow from './AvatarRow';

const PastActivityCard = ({ activity, onViewHighlights, onAddHighlight, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.row}>
        {/* Thumbnail */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder} />
          {/* Completed badge */}
          <View style={styles.completedBadge}>
            <CText variant="label" weight="bold" color={Colors.white}>
              Completed
            </CText>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={styles.topInfo}>
            {/* Category icon + Title */}
            <View style={styles.titleRow}>
              <View style={styles.categoryIcon}>
                <AppIcon name="music-note" size={ms(14)} color={Colors.white} />
              </View>
              <CText variant="body" weight="bold" color={Colors.textPrimary} numberOfLines={1} style={styles.titleText}>
                {activity.title} {activity.emoji || ''}
              </CText>
            </View>

            {/* Location */}
            <View style={styles.metaRow}>
              <AppIcon name="location-on" size={ms(13)} color={Colors.textMuted} />
              <CText variant="caption" weight="regular" color={Colors.textSecondary} numberOfLines={1} style={styles.metaText}>
                {activity.location}
              </CText>
            </View>

            {/* Date */}
            <View style={styles.metaRow}>
              <AppIcon name="calendar-today" size={ms(13)} color={Colors.textMuted} />
              <CText variant="caption" weight="regular" color={Colors.textSecondary} numberOfLines={1} style={styles.metaText}>
                {activity.date}
              </CText>
            </View>

            {/* Members */}
            <View style={styles.metaRow}>
              <AppIcon name="group" size={ms(13)} color={Colors.textMuted} />
              <CText variant="caption" weight="regular" color={Colors.textSecondary} style={styles.metaText}>
                {activity.joined} / {activity.limit} Joined
              </CText>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <AppButton
              variant="ghost"
              title="View Highlights"
              leftIcon="photo-library"
              onPress={onViewHighlights}
              size="sm"
              style={styles.highlightBtn}
            />
            <TouchableOpacity style={styles.addHighlight} onPress={onAddHighlight}>
              <AppIcon name="add" size={ms(16)} color={Colors.textPrimary} />
              <CText variant="caption" weight="semibold" color={Colors.textPrimary}>
                Add Highlight
              </CText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chevron */}
        <View style={styles.chevronContainer}>
          <AppIcon name="chevron-right" size={ms(22)} color={Colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: ms(16),
    backgroundColor: Colors.white,
    borderRadius: ms(14),
    overflow: 'hidden',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: vs(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: ms(110),
    height: vs(140),
    position: 'relative',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.gray300,
  },
  completedBadge: {
    position: 'absolute',
    top: ms(8),
    left: ms(8),
    backgroundColor: Colors.success,
    paddingHorizontal: ms(8),
    paddingVertical: vs(2),
    borderRadius: ms(4),
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: ms(10),
    paddingVertical: vs(10),
    justifyContent: 'space-between',
  },
  topInfo: {
    marginBottom: vs(6),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(4),
    gap: ms(6),
  },
  categoryIcon: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(2),
    gap: ms(4),
  },
  metaText: {
    flex: 1,
  },
  actions: {
    gap: vs(4),
  },
  highlightBtn: {
    alignSelf: 'flex-start',
  },
  addHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  chevronContainer: {
    paddingRight: ms(8),
  },
});

export default PastActivityCard;
