/**
 * alert.js  ─  Universal Dialog & Alert Component
 *
 * Renders a premium overlay modal with rich layouts.
 * Supported types:
 *   • confirm  – double button choice (Confirm vs Cancel)
 *   • danger   – red theme for warnings / logout verification
 *   • success  – green theme for success checkmarks
 *   • warning  – orange theme for cautions
 *   • info     – blue theme for information
 *
 * Features:
 *   • Custom icons, background highlights
 *   • Supports side-by-side or stacked buttons
 *   • Supports children prop for custom list views, info rows, or forms
 *   • Smooth backdrop fade and card slide transitions
 *
 * Usage:
 *   <AppAlert
 *     visible={visible}
 *     onClose={() => setVisible(false)}
 *     title="Join this vibe?"
 *     onConfirm={handleJoin}
 *     confirmTitle="Yes, Accept & Join"
 *     cancelTitle="Cancel"
 *   >
 *     <InfoRow label="You'll join the group chat" />
 *   </AppAlert>
 */

import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CText from './CText';
import Colors from './Colors';
import AppButton from './Buttons';
import { ms, vs, width, normFont } from './Scale';

const TYPE_CONFIGS = {
  confirm: {
    icon: 'help-outline',
    iconBg: Colors.primaryLight,
    iconFg: Colors.primary,
    confirmVariant: 'primary',
  },
  success: {
    icon: 'check',
    iconBg: Colors.successLight,
    iconFg: Colors.success,
    confirmVariant: 'success',
  },
  danger: {
    icon: 'error-outline',
    iconBg: Colors.errorLight,
    iconFg: Colors.error,
    confirmVariant: 'danger',
  },
  warning: {
    icon: 'warning',
    iconBg: Colors.warningLight,
    iconFg: Colors.warning,
    confirmVariant: 'warning',
  },
  info: {
    icon: 'info',
    iconBg: Colors.infoLight,
    iconFg: Colors.info,
    confirmVariant: 'primary',
  },
};

const AppAlert = ({
  visible,
  onClose,
  title,
  message,
  type = 'confirm',
  iconName,
  iconBgColor,
  iconColor,
  confirmTitle,
  onConfirm,
  cancelTitle,
  onCancel,
  children,
  closeOnOverlayPress = true,
  stackedButtons = false, // stack buttons vertically if true
}) => {
  const config = TYPE_CONFIGS[type] || TYPE_CONFIGS.confirm;

  const currentIcon = iconName ?? config.icon;
  const currentIconBg = iconBgColor ?? config.iconBg;
  const currentIconFg = iconColor ?? config.iconFg;

  const handleBackdropPress = () => {
    if (closeOnOverlayPress) {
      onClose?.();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose?.();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.cardContainer}
            >
              <View style={styles.card}>
                
                {/* Header Icon Circle */}
                {currentIcon && (
                  <View style={[styles.iconCircle, { backgroundColor: currentIconBg }]}>
                    <MaterialIcons name={currentIcon} size={ms(32)} color={currentIconFg} />
                  </View>
                )}

                {/* Title */}
                {title ? (
                  <CText variant="h3" weight="bold" color={Colors.textPrimary} align="center" style={styles.title}>
                    {title}
                  </CText>
                ) : null}

                {/* Message Body */}
                {message ? (
                  <CText variant="body" color={Colors.textSecondary} align="center" style={styles.message}>
                    {message}
                  </CText>
                ) : null}

                {/* Optional Custom Child Content */}
                {children ? <View style={styles.childrenContainer}>{children}</View> : null}

                {/* Action Buttons */}
                <View style={[styles.actions, stackedButtons ? styles.actionsStacked : styles.actionsRow]}>
                  {cancelTitle ? (
                    <AppButton
                      variant="outline"
                      title={cancelTitle}
                      onPress={handleCancel}
                      style={stackedButtons ? styles.buttonStacked : styles.buttonHalf}
                    />
                  ) : null}

                  {confirmTitle && onConfirm ? (
                    <AppButton
                      variant={config.confirmVariant}
                      title={confirmTitle}
                      onPress={onConfirm}
                      style={stackedButtons ? styles.buttonStacked : styles.buttonHalf}
                    />
                  ) : null}
                </View>

              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 41, 0.45)', // matching the overlay style from mockup
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.86,
    backgroundColor: Colors.white,
    borderRadius: ms(24),
    paddingHorizontal: ms(24),
    paddingTop: vs(28),
    paddingBottom: vs(24),
    alignItems: 'center',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: ms(68),
    height: ms(68),
    borderRadius: ms(34),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(18),
  },
  title: {
    marginBottom: vs(8),
    paddingHorizontal: ms(8),
  },
  message: {
    marginBottom: vs(16),
    lineHeight: normFont(20),
    paddingHorizontal: ms(4),
  },
  childrenContainer: {
    width: '100%',
    marginBottom: vs(20),
  },
  actions: {
    width: '100%',
    marginTop: vs(8),
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: ms(12),
  },
  actionsStacked: {
    flexDirection: 'column',
    gap: vs(10),
  },
  buttonHalf: {
    flex: 1,
  },
  buttonStacked: {
    width: '100%',
  },
});

export default AppAlert;
