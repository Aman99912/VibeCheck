import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CText, AppIcon, Colors, ms, vs, normFont } from '../../../Reusable-Component';

// Helper to get nice icon colors (matches LiveActivityCard)
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

const PastActivityCard = ({ activity, onViewHighlights, onAddHighlight, onPress }) => {
  const theme = getIconTheme(activity.icon);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.row}>
        
        {/* ── Left Icon Container ── */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
            <Ionicons name={theme.ionicon} size={ms(24)} color={theme.color} />
          </View>
        </View>

        {/* ── Info Container ── */}
        <View style={styles.infoContainer}>
          <View style={styles.topRow}>
            <CText style={styles.titleText} numberOfLines={1}>
              {activity.title} {activity.emoji || ''}
            </CText>
            {/* Completed badge */}
            <View style={styles.completedBadge}>
              <CText style={styles.completedText}>Done</CText>
            </View>
          </View>

          {/* Location & Date */}
          <View style={styles.metaRow}>
            <AppIcon name="location-on" size={ms(12)} color={Colors.textMuted} />
            <CText style={styles.metaText} numberOfLines={1}>
              {activity.location}
            </CText>
          </View>

          <View style={styles.metaRow}>
            <AppIcon name="calendar-today" size={ms(12)} color={Colors.textMuted} />
            <CText style={styles.metaText} numberOfLines={1}>
              {activity.date}
            </CText>
          </View>

          {/* Members */}
          <View style={styles.metaRow}>
            <AppIcon name="group" size={ms(12)} color={Colors.textMuted} />
            <CText style={styles.metaText}>
              {activity.joined} / {activity.limit} Joined
            </CText>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.highlightBtn} onPress={onViewHighlights}>
              <AppIcon name="photo-library" size={ms(16)} color={Colors.textPrimary} />
              <CText variant="caption" weight="semibold" color={Colors.textPrimary} style={{ marginLeft: ms(4) }}>
                View Highlights
              </CText>
            </TouchableOpacity>
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
          <AppIcon name="chevron-right" size={ms(20)} color={'#D1D5DB'} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: ms(16),
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: ms(14),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  // Icon
  iconContainer: {
    marginRight: ms(14),
  },
  iconBox: {
    width: ms(48),
    height: ms(48),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info
  infoContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(6),
  },
  titleText: {
    flex: 1,
    fontSize: normFont(15),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: ms(8),
  },
  completedBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: ms(8),
    paddingVertical: vs(2),
    borderRadius: ms(6),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completedText: {
    fontSize: normFont(10),
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(4),
    gap: ms(6),
  },
  metaText: {
    flex: 1,
    fontSize: normFont(12),
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
    marginTop: vs(8),
    paddingTop: vs(8),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  highlightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    marginLeft: 'auto',
  },
  chevronContainer: {
    paddingLeft: ms(8),
    justifyContent: 'center',
    alignItems: 'center',
    height: ms(48),
  },
});

export default PastActivityCard;
