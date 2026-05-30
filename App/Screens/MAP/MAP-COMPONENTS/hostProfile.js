import React from 'react';
import {
  Modal,
  View,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, CText, AppButton, ms, vs, normFont } from '../../../Reusable-Component';

const HostProfile = ({ visible, onClose, host }) => {
  const insets = useSafeAreaInsets();
  
  if (!host) return null;
  
  const name = host.name || 'Arjun';
  const avatar = host.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop';
  const joined = host.joined || 'Joined 2 years ago';
  
  // Mock host statistics
  const rating = '4.9 ★';
  const totalVibes = '42';
  const vibeScore = '980 pts';
  const bio = 'Hey there! I love organizing casual sports matches, weekend coffee sessions, and late-night acoustic music jams. Always looking to meet new people and vibe together!';
  const tags = ['⚽ Soccer', '☕ Coffee', '🎵 Acoustic Jam', '🚲 Cycling', '🌍 Travel'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.rootContainer}>
        {/* Header Overlay */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, vs(12)) }]}>
          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <MaterialIcons name="arrow-back" size={ms(22)} color={Colors.textPrimary} />
          </TouchableOpacity>
          <CText variant="h3" weight="bold" color={Colors.textPrimary}>
            Host Profile
          </CText>
          <View style={{ width: ms(42) }} /> {/* spacing spacer */}
        </View>

        {/* Scroll Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, vs(16)) + vs(40) }]}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
        >
          {/* Main User Card Details */}
          <View style={styles.profileHeaderContainer}>
            <View style={styles.avatarGlowRing}>
              <Image source={{ uri: avatar }} style={styles.avatar} />
            </View>
            <CText variant="h2" weight="bold" color={Colors.textPrimary} style={styles.name}>
              {name}
            </CText>
            <View style={styles.joinedBadge}>
              <MaterialIcons name="verified-user" size={ms(12)} color={Colors.primary} style={{ marginRight: ms(4) }} />
              <CText variant="caption" weight="semibold" color={Colors.textSecondary}>
                {joined}
              </CText>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <CText variant="h3" weight="bold" color={Colors.primary}>
                {rating}
              </CText>
              <CText variant="caption" color={Colors.textMuted} weight="medium">
                Rating
              </CText>
            </View>
            <View style={styles.statCard}>
              <CText variant="h3" weight="bold" color={Colors.primary}>
                {totalVibes}
              </CText>
              <CText variant="caption" color={Colors.textMuted} weight="medium">
                Vibes Hosted
              </CText>
            </View>
            <View style={styles.statCard}>
              <CText variant="h3" weight="bold" color={Colors.primary}>
                {vibeScore}
              </CText>
              <CText variant="caption" color={Colors.textMuted} weight="medium">
                Vibe Score
              </CText>
            </View>
          </View>

          {/* Bio Section */}
          <View style={styles.section}>
            <CText variant="body" weight="bold" color={Colors.textPrimary} style={styles.sectionTitle}>
              About Host
            </CText>
            <View style={styles.cardContainer}>
              <CText variant="body" color={Colors.textSecondary} style={styles.bioText}>
                {bio}
              </CText>
            </View>
          </View>

          {/* Tags Section */}
          <View style={styles.section}>
            <CText variant="body" weight="bold" color={Colors.textPrimary} style={styles.sectionTitle}>
              Interests & Vibes
            </CText>
            <View style={styles.tagsWrapper}>
              {tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <CText variant="body2" weight="semibold" color={Colors.primary}>
                    {tag}
                  </CText>
                </View>
              ))}
            </View>
          </View>

          {/* Host Badges Section */}
          <View style={styles.section}>
            <CText variant="body" weight="bold" color={Colors.textPrimary} style={styles.sectionTitle}>
              Achievements
            </CText>
            <View style={styles.badgeRow}>
              <View style={styles.badgeItem}>
                <View style={[styles.badgeIconBg, { backgroundColor: '#FFEEDB' }]}>
                  <MaterialIcons name="local-fire-department" size={ms(24)} color="#FF9500" />
                </View>
                <CText variant="caption" weight="bold" color={Colors.textPrimary} style={{ marginTop: vs(6) }}>
                  Super Host
                </CText>
              </View>
              <View style={styles.badgeItem}>
                <View style={[styles.badgeIconBg, { backgroundColor: '#E5F6FF' }]}>
                  <MaterialIcons name="thumb-up" size={ms(20)} color="#00A3FF" />
                </View>
                <CText variant="caption" weight="bold" color={Colors.textPrimary} style={{ marginTop: vs(6) }}>
                  Top Rated
                </CText>
              </View>
              <View style={styles.badgeItem}>
                <View style={[styles.badgeIconBg, { backgroundColor: '#E6F9F0' }]}>
                  <MaterialIcons name="stars" size={ms(22)} color="#10B981" />
                </View>
                <CText variant="caption" weight="bold" color={Colors.textPrimary} style={{ marginTop: vs(6) }}>
                  Vibe Star
                </CText>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Back Button Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, vs(16)) }]}>
          <AppButton
            variant="primary"
            title="Back to Vibe"
            fullWidth
            size="lg"
            onPress={onClose}
            style={styles.backBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    height: vs(64),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(133, 108, 226, 0.08)',
  },
  closeButton: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(21),
    backgroundColor: 'rgba(133, 108, 226, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ms(20),
    paddingTop: vs(20),
  },
  profileHeaderContainer: {
    alignItems: 'center',
    marginBottom: vs(24),
  },
  avatarGlowRing: {
    width: ms(100),
    height: ms(100),
    borderRadius: ms(50),
    padding: ms(3),
    backgroundColor: 'rgba(133, 108, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: ms(47),
  },
  name: {
    fontSize: normFont(24),
    marginBottom: vs(4),
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(133, 108, 226, 0.06)',
    paddingHorizontal: ms(10),
    paddingVertical: vs(4),
    borderRadius: ms(12),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(24),
    gap: ms(10),
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(133, 108, 226, 0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(133, 108, 226, 0.08)',
    borderRadius: ms(16),
    paddingVertical: vs(14),
  },
  section: {
    marginBottom: vs(24),
  },
  sectionTitle: {
    fontSize: normFont(16),
    marginBottom: vs(12),
  },
  cardContainer: {
    backgroundColor: 'rgba(244, 246, 249, 0.65)',
    borderRadius: ms(16),
    padding: ms(16),
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.06)',
  },
  bioText: {
    lineHeight: normFont(22),
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
  },
  tag: {
    backgroundColor: 'rgba(133, 108, 226, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.1)',
    paddingHorizontal: ms(14),
    paddingVertical: vs(6),
    borderRadius: ms(20),
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(133, 108, 226, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.05)',
    borderRadius: ms(18),
    paddingVertical: vs(16),
  },
  badgeItem: {
    alignItems: 'center',
  },
  badgeIconBg: {
    width: ms(48),
    height: ms(48),
    borderRadius: ms(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: ms(20),
    paddingTop: vs(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(133, 108, 226, 0.08)',
    backgroundColor: Colors.white,
  },
  backBtn: {
    borderWidth: 0,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: ms(30),
  },
});

export default HostProfile;
