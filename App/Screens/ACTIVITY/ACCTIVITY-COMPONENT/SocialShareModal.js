import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Clipboard,
  Linking,
  Platform,
} from 'react-native';
import Share from 'react-native-share';
import { CText, AppIcon, Colors, ms, vs } from '../../../Reusable-Component';

const { width } = Dimensions.get('window');

const SHARE_OPTIONS = [
  { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', iconFamily: 'FontAwesome', color: '#25D366' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram', iconFamily: 'FontAwesome', color: '#E1306C' },
  { id: 'snapchat', name: 'Snapchat', icon: 'snapchat-ghost', iconFamily: 'FontAwesome', color: '#FFFC00', textColor: '#0A1629' },
  { id: 'twitter', name: 'Twitter / X', icon: 'twitter', iconFamily: 'FontAwesome', color: '#000000' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook-official', iconFamily: 'FontAwesome', color: '#1877F2' },
  { id: 'copy', name: 'Copy Link', icon: 'content-copy', iconFamily: 'MaterialIcons', color: '#4B5563' },
  { id: 'more', name: 'More', icon: 'share', iconFamily: 'MaterialIcons', color: '#856CE2' },
];

const SocialShareModal = ({ visible, onClose, activity }) => {
  const [toastMessage, setToastMessage] = useState('');
  const toastFade = useRef(new Animated.Value(0)).current;

  if (!activity) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(toastFade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastMessage('');
    });
  };

  const handleShare = async (platformId) => {
    const lat = activity.lat || 28.4105;
    const lng = activity.lng || 77.3125;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const hostProfileUrl = activity.hostProfileUrl || `https://vibecheck.app/host/${activity.hostId || 'unknown'}`;

    // Rich structured share message
    const textMsg = [
      `🎉 Join me for — "${activity.title}" ${activity.emoji || ''}`,
      ``,
      `👤 Host: ${activity.hostName || 'Unknown Host'}`,
      `📍 Venue: ${activity.location || 'See map link'}`,
      `⏰ Time: ${activity.time || 'TBD'}`,
      `⌛ Duration: ${activity.duration ? activity.duration + ' hrs' : 'TBD'}`,
      ``,
      `🗺️ Google Maps: ${googleMapsUrl}`,
      `👤 Host Profile: ${hostProfileUrl}`,
      ``,
      `Tap the map link to navigate and join the vibe! 🚀`,
    ].join('\n');

    try {
      switch (platformId) {
        case 'whatsapp':
          try {
            await Share.shareSingle({
              social: Share.Social.WHATSAPP,
              message: textMsg,
              url: googleMapsUrl,
            });
          } catch (e) {
            const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(textMsg)}`;
            const canOpen = await Linking.canOpenURL(whatsappUrl);
            if (canOpen) {
              await Linking.openURL(whatsappUrl);
            } else {
              showToast('WhatsApp not installed. Trying system share...');
              setTimeout(async () => {
                await triggerSystemShare(textMsg, googleMapsUrl);
              }, 1200);
            }
          }
          break;

        case 'instagram':
          Clipboard.setString(textMsg);
          showToast('Text copied! Opening Instagram...');
          setTimeout(async () => {
            const instUrl = Platform.OS === 'ios' ? 'instagram://camera' : 'instagram://';
            const canOpen = await Linking.canOpenURL(instUrl);
            if (canOpen) {
              await Linking.openURL(instUrl);
            } else {
              await Linking.openURL('https://instagram.com');
            }
          }, 1000);
          break;

        case 'snapchat':
          Clipboard.setString(textMsg);
          showToast('Text copied! Opening Snapchat...');
          setTimeout(async () => {
            const snapUrl = 'snapchat://';
            const canOpen = await Linking.canOpenURL(snapUrl);
            if (canOpen) {
              await Linking.openURL(snapUrl);
            } else {
              await Linking.openURL('https://snapchat.com');
            }
          }, 1000);
          break;

        case 'facebook':
          try {
            await Share.shareSingle({
              social: Share.Social.FACEBOOK,
              url: googleMapsUrl,
              message: textMsg,
            });
          } catch (e) {
            const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(googleMapsUrl)}`;
            await Linking.openURL(fbUrl);
          }
          break;

        case 'twitter':
          try {
            await Share.shareSingle({
              social: Share.Social.TWITTER,
              message: textMsg,
            });
          } catch (e) {
            const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textMsg)}`;
            await Linking.openURL(twUrl);
          }
          break;

        case 'copy':
          Clipboard.setString(textMsg);
          showToast('Maps link & info copied to clipboard!');
          break;

        case 'more':
          await triggerSystemShare(textMsg, googleMapsUrl);
          break;

        default:
          break;
      }
    } catch (err) {
      console.warn('[SocialShareModal] Share action failed:', err);
    }
  };

  const triggerSystemShare = async (message, url) => {
    try {
      await Share.open({
        message: message,
        url: url,
        title: 'Share Vibe Location',
      });
    } catch (e) {
      // Ignore user cancellation errors
      if (e && e.message && !e.message.includes('User did not share')) {
        console.warn('[SocialShareModal] Native share error:', e);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.backdropFill} />
      </TouchableOpacity>

      {/* Modal Sheet Container */}
      <View style={styles.sheetContainer} pointerEvents="box-none">
        <View style={styles.sheet}>
          {/* Pull Handle */}
          <View style={styles.pullHandle} />

          {/* ── Rich Activity Preview ──────────────────────────────── */}
          <View style={styles.previewCard}>
            <View style={styles.previewTop}>
              <View style={styles.previewEmoji}>
                <CText style={styles.previewEmojiText}>{activity.emoji || '✨'}</CText>
              </View>
              <View style={styles.previewInfo}>
                <CText variant="h5" weight="bold" color={Colors.textPrimary} numberOfLines={1}>
                  {activity.title}
                </CText>
                <CText variant="caption" weight="medium" color={Colors.textSecondary} numberOfLines={1}>
                  Hosted by {activity.hostName || 'Unknown Host'}
                </CText>
              </View>
            </View>

            <View style={styles.previewMeta}>
              <View style={styles.previewMetaItem}>
                <CText style={styles.previewMetaIcon}>📍</CText>
                <CText variant="caption" weight="medium" color={Colors.textSecondary} numberOfLines={1} style={styles.previewMetaText}>
                  {activity.location || 'Venue TBD'}
                </CText>
              </View>
              <View style={styles.previewMetaItem}>
                <CText style={styles.previewMetaIcon}>⏰</CText>
                <CText variant="caption" weight="medium" color={Colors.textSecondary} style={styles.previewMetaText}>
                  {activity.time || 'TBD'}{activity.duration ? `  ·  ${activity.duration} hrs` : ''}
                </CText>
              </View>
            </View>
          </View>

          {/* ── Share via label ────────────────────────────────────── */}
          <View style={styles.shareViaRow}>
            <CText variant="caption" weight="bold" color={Colors.textSecondary} style={styles.shareViaLabel}>
              SHARE VIA
            </CText>
          </View>

          {/* Options Grid */}
          <View style={styles.grid}>
            {SHARE_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.optionItem}
                activeOpacity={0.7}
                onPress={() => handleShare(item.id)}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                  <AppIcon
                    family={item.iconFamily}
                    name={item.icon}
                    size={ms(24)}
                    color={item.textColor || Colors.white}
                  />
                </View>
                <CText variant="caption" weight="semibold" color={Colors.textSecondary} style={styles.optionLabel}>
                  {item.name}
                </CText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={onClose}>
            <CText variant="body" weight="bold" color={Colors.textPrimary}>
              Cancel
            </CText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Alert/Toast inside modal */}
      {toastMessage ? (
        <Animated.View style={[styles.toast, { opacity: toastFade }]}>
          <CText variant="caption" weight="bold" color={Colors.white} align="center">
            {toastMessage}
          </CText>
        </Animated.View>
      ) : null}
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropFill: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 41, 0.4)',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
    paddingHorizontal: ms(20),
    paddingBottom: vs(24),
    paddingTop: vs(12),
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 24,
  },
  pullHandle: {
    width: ms(36),
    height: vs(4),
    borderRadius: ms(2),
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: vs(16),
  },
  // ── Rich Preview Card ─────────────────────────────────────────────────────
  previewCard: {
    backgroundColor: '#F8FAFF',
    borderRadius: ms(16),
    padding: ms(14),
    marginBottom: vs(16),
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  previewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
    marginBottom: vs(10),
  },
  previewEmoji: {
    width: ms(48),
    height: ms(48),
    borderRadius: ms(14),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  previewEmojiText: {
    fontSize: ms(24),
  },
  previewInfo: {
    flex: 1,
    gap: vs(2),
  },
  previewMeta: {
    gap: vs(6),
  },
  previewMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  previewMetaIcon: {
    fontSize: ms(13),
  },
  previewMetaText: {
    flex: 1,
  },

  // ── Share Via Label ───────────────────────────────────────────────────────
  shareViaRow: {
    marginBottom: vs(10),
  },
  shareViaLabel: {
    fontSize: ms(10),
    letterSpacing: 1.2,
    color: '#9CA3AF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: ms(10),
    marginBottom: vs(16),
  },
  optionItem: {
    width: (width - ms(40) - ms(40)) / 4, // Calculate width for 4 columns
    alignItems: 'center',
    marginVertical: vs(8),
  },
  iconContainer: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(26),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  optionLabel: {
    fontSize: ms(11),
    textAlign: 'center',
  },
  cancelBtn: {
    marginTop: vs(8),
    height: vs(48),
    borderRadius: ms(14),
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: vs(100),
    left: ms(24),
    right: ms(24),
    backgroundColor: 'rgba(10, 22, 41, 0.9)',
    borderRadius: ms(12),
    paddingVertical: vs(10),
    paddingHorizontal: ms(16),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default SocialShareModal;
