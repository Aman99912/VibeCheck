import React from 'react';
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, CText, ms, vs, normFont } from '../../../Reusable-Component';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HostProfile = ({ visible, onClose, host, accentColor: propAccent }) => {
  const accentColor = propAccent || '#2563EB';

  if (!host) return null;

  const name        = host.name        || 'Arjun';
  const avatar      = host.avatar      || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop';
  const joined      = host.joined      || 'Joined 2 years ago';
  const bio         = host.bio         || 'Hey there! I love organizing casual sports matches, weekend coffee sessions, and late-night acoustic music jams.';
  const rating      = host.rating      || 4.9;
  const behavior    = host.behavior    || 'Excellent';
  const reliability = host.reliability || '98%';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        {/* Tap outside to close */}
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.card}>
          
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={ms(20)} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Avatar Area */}
          <View style={styles.headerRow}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
              
            </View>

            <View style={styles.headerTextInfo}>
              <View style={styles.nameRow}>
                <View style={{flexDirection:'row',alignItems:'center',gap:ms(5)}}>

                
                <CText style={styles.hostName}>{name}</CText>
                <View style={{top:ms(-1)}}><Ionicons name="checkmark-circle" size={ms(18)} color={accentColor} /></View>
                </View>
              </View>
              <CText style={styles.hostJoined}>{joined}</CText>
            </View>
          </View>

          {/* Detailed Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statIconWrap}>
                <Ionicons name="star" size={ms(16)} color="#F59E0B" />
              </View>
              <CText style={styles.statValue}>{rating}</CText>
              <CText style={styles.statLabel}>Avg Rating</CText>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconWrap, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="shield-checkmark" size={ms(16)} color="#16A34A" />
              </View>
              <CText style={styles.statValue}>{behavior}</CText>
              <CText style={styles.statLabel}>Behavior</CText>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="time" size={ms(16)} color="#2563EB" />
              </View>
              <CText style={styles.statValue}>{reliability}</CText>
              <CText style={styles.statLabel}>Reliability</CText>
            </View>
          </View>

          {/* Bio */}
          <CText style={styles.sectionTitle}>About</CText>
          <CText style={styles.bioText}>{bio}</CText>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 41, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: SCREEN_WIDTH - ms(40),
    backgroundColor: Colors.white,
    borderRadius: ms(28),
    padding: ms(24),
    paddingTop: vs(28),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: ms(16),
    right: ms(16),
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(18),
  },
  avatarWrap: {
    width: ms(64),
    height: ms(64),
    marginRight: ms(16),
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: ms(32),
    backgroundColor: Colors.surface,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -ms(2),
    right: -ms(2),
    backgroundColor: Colors.white,
    borderRadius: ms(10),
    padding: ms(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTextInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  hostName: {
    fontSize: normFont(22),
    fontWeight: '800',
    // flexDirection:'row',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: vs(2),
  },
  hostJoined: {
    fontSize: normFont(13),
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(24),
    gap: ms(8),
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: ms(16),
    padding: ms(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statIconWrap: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(6),
  },
  statValue: {
    fontSize: normFont(14),
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: vs(2),
  },
  statLabel: {
    fontSize: normFont(11),
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Headings
  sectionTitle: {
    fontSize: normFont(16),
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: vs(8),
  },

  // Bio
  bioText: {
    fontSize: normFont(14),
    lineHeight: normFont(21),
    marginBottom: vs(10), // Reduced since there's no tags below it
  },
});

export default HostProfile;
