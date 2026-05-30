import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  CText,
  AppButton,
  ms,
  vs,
} from '../../../Reusable-Component';

const AcceptSuccess = ({ visible, onClose, pin, onOpenChat }) => {
  const insets = useSafeAreaInsets();
  
  // Continuous Loop Animations for Checkmark and Sparkles
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 1. Continuous scale pulsing for the green checkmark circle
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 2. Continuous rotation for the sparkles confetti backdrop
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 9000, // 9 seconds per full rotation
          useNativeDriver: true,
        })
      ).start();
    }
  }, [visible, pulseAnim, rotateAnim]);

  if (!pin) return null;

  const title = pin.title || 'Special Vibe Meetup';

  const handleOpenChat = () => {
    onOpenChat?.();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          {/* Confetti Sparkles Backdrop Container (Animated Rotation) */}
          <View style={styles.headerDecorContainer}>
            <Animated.View style={[styles.sparklesContainer, { transform: [{ rotate: rotation }] }]} pointerEvents="none">
              <View style={[styles.sparkle, styles.sp1]} />
              <View style={[styles.sparkle, styles.sp2]} />
              <View style={[styles.sparkle, styles.sp3]} />
              <View style={[styles.sparkle, styles.sp4]} />
              <View style={[styles.sparkle, styles.sp5]} />
            </Animated.View>

            {/* Pulsing Green Checkmark Circle */}
            <Animated.View style={[styles.checkmarkCircle, { transform: [{ scale: pulseAnim }] }]}>
              <MaterialIcons name="check" size={ms(44)} color={Colors.white} />
            </Animated.View>
          </View>

          {/* Celebration Text Block */}
          <CText variant="h1" weight="bold" color={Colors.textPrimary} align="center" style={styles.successTitle}>
            Joined Successfully! 🎉
          </CText>
          
          <CText variant="body" color={Colors.textSecondary} align="center" style={styles.subtitle}>
            You are now a member of
          </CText>

          <CText variant="h3" weight="bold" color={Colors.textPrimary} align="center" style={styles.vibeTitle}>
            {title}
          </CText>

          {/* Quick Actions List (Premium Gen-Z glass styling) */}
          <View style={styles.actionsList}>
            {/* Action 1: Group Chat */}
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={handleOpenChat}>
              <View style={[styles.actionIconCircle, { backgroundColor: Colors.primaryLight }]}>
                <MaterialIcons name="chat" size={ms(20)} color={Colors.primary} />
              </View>
              <View style={styles.actionTextContainer}>
                <CText variant="body" weight="semibold" color={Colors.textPrimary}>
                  Group Chat
                </CText>
                <CText variant="caption" color={Colors.textMuted}>
                  Tap to start chatting
                </CText>
              </View>
              <MaterialIcons name="chevron-right" size={ms(20)} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Action 2: View Members */}
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.actionIconCircle, { backgroundColor: Colors.primaryLight }]}>
                <MaterialIcons name="people" size={ms(20)} color={Colors.primary} />
              </View>
              <View style={styles.actionTextContainer}>
                <CText variant="body" weight="semibold" color={Colors.textPrimary}>
                  View Members
                </CText>
                <CText variant="caption" color={Colors.textMuted}>
                  See all joined members
                </CText>
              </View>
              <MaterialIcons name="chevron-right" size={ms(20)} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Action 3: View on Map */}
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={onClose}>
              <View style={[styles.actionIconCircle, { backgroundColor: Colors.successLight }]}>
                <MaterialIcons name="map" size={ms(20)} color={Colors.success} />
              </View>
              <View style={styles.actionTextContainer}>
                <CText variant="body" weight="semibold" color={Colors.textPrimary}>
                  View on Map
                </CText>
                <CText variant="caption" color={Colors.textMuted}>
                  See live location
                </CText>
              </View>
              <MaterialIcons name="chevron-right" size={ms(20)} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Bottom Action Card (Detached capsule style matching NavBar and ViewPin bottomBar) */}
        <View style={[styles.bottomBar, { bottom: Math.max(insets.bottom, vs(12)) }]}>
          <AppButton
            variant="primary"
            title="Open Chat"
            fullWidth
            size="lg"
            onPress={handleOpenChat}
            style={styles.openChatBtn}
          />
          <AppButton
            variant="text"
            title="Back to Map"
            fullWidth
            size="md"
            onPress={onClose}
            style={styles.backToMapBtn}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(24),
    paddingBottom: vs(160), // extra padding to clear floating bottomBar card
  },
  headerDecorContainer: {
    position: 'relative',
    width: ms(140),
    height: ms(140),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(24),
  },
  sparklesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  checkmarkCircle: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(40),
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    zIndex: 2,
  },
  sparkle: {
    position: 'absolute',
    borderRadius: 50,
  },
  sp1: { width: ms(8), height: ms(8), top: vs(16), left: ms(24), backgroundColor: '#10B981' },
  sp2: { width: ms(12), height: ms(12), top: vs(24), right: ms(16), backgroundColor: '#FFD700' },
  sp3: { width: ms(6), height: ms(6), bottom: vs(20), left: ms(18), backgroundColor: '#00F2FE' },
  sp4: { width: ms(10), height: ms(10), bottom: vs(28), right: ms(28), backgroundColor: '#856CE2' },
  sp5: { width: ms(8), height: ms(8), top: vs(8), right: ms(52), backgroundColor: '#FF4500' },
  successTitle: {
    marginBottom: vs(12),
  },
  subtitle: {
    marginBottom: vs(4),
  },
  vibeTitle: {
    marginBottom: vs(32),
  },
  actionsList: {
    width: '100%',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(133, 108, 226, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.12)',
    borderRadius: ms(20),
    padding: ms(14),
    marginVertical: vs(6),
  },
  actionIconCircle: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(12),
    borderWidth: 1,
    borderColor: 'rgba(133, 108, 226, 0.12)',
  },
  actionTextContainer: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    left: ms(16),
    right: ms(16),
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: 'rgba(133, 108, 226, 0.15)',
    borderRadius: ms(54), // MATCHES THE USER PREFERENCE CURVE
    padding: ms(16),
   
  },
  openChatBtn: {
    borderWidth: 0,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: ms(30), // MATCHES THE USER PREFERENCE CURVE
    marginBottom: vs(8),
  },
  backToMapBtn: {
    borderWidth: 0,
  },
});

export default AcceptSuccess;
