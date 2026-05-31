import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, CText, ms, vs, normFont } from '../../../Reusable-Component';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MOCK_REQUESTS = [
  {
    id: '1',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&fit=crop',
    rating: 4.8,
    behavior: 'Excellent',
    reliability: '95%',
    joined: 'Joined 1 year ago',
    bio: 'Looking for fun evening sports and casual meetups!',
  },
  {
    id: '2',
    name: 'Rahul Verma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop',
    rating: 4.5,
    behavior: 'Good',
    reliability: '88%',
    joined: 'Joined 3 months ago',
    bio: 'Big fan of live music and weekend jamming.',
  },
  {
    id: '3',
    name: 'Sneha K.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&fit=crop',
    rating: 4.9,
    behavior: 'Excellent',
    reliability: '99%',
    joined: 'Joined 2 years ago',
    bio: 'Always down for a cafe run or board games.',
  },
];

const RequestsModal = ({ visible, onClose, onViewProfile }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 120,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleAccept = (id) => {
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleReject = (id) => {
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={handleClose} />

        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          
          <View style={styles.dragHandleArea}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <View>
              <CText style={styles.title}>Join Requests</CText>
              <CText style={styles.subtitle}>{requests.length} pending</CText>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={ms(20)} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {requests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-done-circle-outline" size={ms(48)} color={Colors.textMuted} />
                <CText style={styles.emptyText}>All caught up!</CText>
                <CText style={styles.emptySubtext}>You have no pending requests.</CText>
              </View>
            ) : (
              requests.map((req) => (
                <View key={req.id} style={styles.requestCard}>
                  
                  {/* Tappable Profile Area */}
                  <TouchableOpacity 
                    style={styles.profileArea} 
                    activeOpacity={0.7} 
                    onPress={() => onViewProfile(req)}
                  >
                    <Image source={{ uri: req.avatar }} style={styles.avatar} />
                    <View style={styles.infoArea}>
                      <CText style={styles.name} numberOfLines={1}>{req.name}</CText>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={ms(12)} color="#F59E0B" />
                        <CText style={styles.ratingText}>{req.rating}</CText>
                        <CText style={styles.viewProfileText}>• View Profile</CText>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Actions */}
                  <View style={styles.actionArea}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.rejectBtn]} 
                      onPress={() => handleReject(req.id)}
                    >
                      <Ionicons name="close" size={ms(18)} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.acceptBtn]} 
                      onPress={() => handleAccept(req.id)}
                    >
                      <Ionicons name="checkmark" size={ms(18)} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
    maxHeight: SCREEN_HEIGHT * 0.8,
    minHeight: SCREEN_HEIGHT * 0.4,
  },
  dragHandleArea: {
    paddingVertical: vs(12),
    alignItems: 'center',
  },
  dragHandle: {
    width: ms(40),
    height: ms(4),
    borderRadius: ms(2),
    backgroundColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingBottom: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: normFont(20),
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: normFont(13),
    color: Colors.primary,
    fontWeight: '600',
    marginTop: vs(2),
  },
  closeBtn: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: ms(20),
    paddingBottom: vs(40),
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: ms(12),
    borderRadius: ms(16),
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  profileArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: ms(48),
    height: ms(48),
    borderRadius: ms(24),
    marginRight: ms(12),
    backgroundColor: '#F3F4F6',
  },
  infoArea: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: normFont(15),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: vs(2),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  ratingText: {
    fontSize: normFont(12),
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  viewProfileText: {
    fontSize: normFont(12),
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: ms(4),
  },
  actionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
    marginLeft: ms(8),
  },
  actionBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(40),
  },
  emptyText: {
    fontSize: normFont(16),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: vs(12),
  },
  emptySubtext: {
    fontSize: normFont(13),
    color: Colors.textSecondary,
    marginTop: vs(4),
  },
});

export default RequestsModal;
