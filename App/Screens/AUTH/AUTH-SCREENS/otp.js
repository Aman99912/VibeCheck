/**
 * otp.js
 * OTP Code Entry Screen — matches APP_REFF/auth/image.png (right panel) exactly.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, CText, ms, vs, normFont } from '../../../Reusable-Component';
import AuthHeader from '../AUTH-COMPONENT/auth.header';


const OTP_BOX_COUNT = 4;
const GAP = ms(10);

const OtpBoxes = ({ value = '', onChangeText, disabled, errorMsg }) => {
  const inputsRef = useRef([]);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const chars = value.split('').concat(Array(OTP_BOX_COUNT).fill('')).slice(0, OTP_BOX_COUNT);

  const handleChange = (text, idx) => {
    const next = [...chars];
    next[idx] = text.replace(/[^0-9]/g, '').slice(-1);
    onChangeText?.(next.join(''));
    if (text && idx < OTP_BOX_COUNT - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!chars[idx] && idx > 0) {
        const next = [...chars];
        next[idx - 1] = '';
        onChangeText?.(next.join(''));
        inputsRef.current[idx - 1]?.focus();
      }
    }
  };

  return (
    <View style={otpStyles.container}>
      <View style={otpStyles.row}>
        {Array.from({ length: OTP_BOX_COUNT }).map((_, idx) => {
          const isFocused = focusedIdx === idx;
          const hasVal = !!chars[idx];
          const hasErr = !!errorMsg;
          const borderColor = hasErr
            ? Colors.error
            : isFocused || hasVal
            ? Colors.primary
            : Colors.border;

          return (
            <TextInput
              key={idx}
              ref={(r) => (inputsRef.current[idx] = r)}
              style={[
                otpStyles.box,
                { borderColor },
                isFocused && otpStyles.boxFocused,
              ]}
              value={chars[idx]}
              onChangeText={(t) => handleChange(t, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              onFocus={() => setFocusedIdx(idx)}
              onBlur={() => setFocusedIdx(-1)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!disabled}
              allowFontScaling={false}
              textAlign="center"
              caretHidden={false}
              selectionColor={Colors.primary}
            />
          );
        })}
      </View>
      {errorMsg ? (
        <CText variant="caption" color={Colors.error} style={otpStyles.errText}>
          {errorMsg}
        </CText>
      ) : null}
    </View>
  );
};

const otpStyles = StyleSheet.create({
  container: { width: '100%' },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: GAP,
  },
  box: {
    width: ms(52),
    height: ms(72),
    borderWidth: ms(1.5),
    borderRadius: ms(12),
    fontSize: normFont(20),
    fontFamily: 'Poppins-SemiBold',
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
    // subtle shadow like Figma
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.06,
    shadowRadius: ms(4),
    elevation: 1,
  },
  boxFocused: {
    borderWidth: ms(2),
    shadowOpacity: 0.14,
    elevation: 2,
  },
  errText: {
    marginTop: vs(8),
    textAlign: 'center',
  },
});

// ─── Main OTP Screen ──────────────────────────────────────────────────────────
const OtpScreen = ({
  phoneNumber,
  otpCode,
  setOtpCode,
  onVerify,
  onResend,
  onBack,
  onEditPhone,
  countdown,
  isLoading,
  errorMsg,
}) => {
  const lastVerifiedCode = useRef('');

  useEffect(() => {
    if (otpCode && otpCode.length === 4 && !isLoading && otpCode !== lastVerifiedCode.current) {
      lastVerifiedCode.current = otpCode;
      onVerify(otpCode);
    } else if (otpCode && otpCode.length < 4) {
      // Allow re-verifying the same code if they backspace and re-type it
      lastVerifiedCode.current = '';
    }
  }, [otpCode, onVerify, isLoading]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header — back + shield + title + phone */}
      <View style={styles.topBlock}>
        <AuthHeader
          type="otp"
          phoneNumber={`+91 ${phoneNumber}`}
          onBackPress={onBack}
          onEditPhonePress={onEditPhone}
        />

        {/* OTP boxes */}
        <View style={styles.otpBlock}>
          <OtpBoxes
            value={otpCode}
            onChangeText={setOtpCode}
            disabled={isLoading}
            errorMsg={errorMsg}
          />

          {/* Resend row */}
          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <CText variant="body" color={Colors.textSecondary} align="center">
                {'Resend code in '}
                <CText variant="body" weight="semibold" color={Colors.primary}>
                  {formatTime(countdown)}
                </CText>
              </CText>
            ) : (
              <TouchableOpacity onPress={onResend} disabled={isLoading} activeOpacity={0.7}>
                <CText variant="body" weight="semibold" color={Colors.primary} align="center">
                  Resend code
                </CText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Privacy row — matches Figma exactly: small shield icon + text, light bg pill */}
      <View style={styles.footerContainer}>
        <View style={styles.privacyRow}>
          {/* Shield badge — light blue circle */}
          <View style={styles.shieldBadge}>
            <MaterialIcons name="security" size={ms(18)} color={Colors.primary} />
          </View>
          <View style={styles.privacyText}>
            <CText variant="bodySmall" weight="bold" color={Colors.textPrimary}>
              Your number is safe with us.
            </CText>
            <CText variant="caption" color={Colors.textSecondary}>
              We never share it with anyone.
            </CText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: ms(24),
    paddingBottom: Platform.OS === 'ios' ? vs(32) : vs(24),
    justifyContent: 'space-between',
  },
  topBlock: {
    flex: 0,
  },
  otpBlock: {
    marginTop: vs(32),
    alignItems: 'center',
    width: '100%',
  },
  resendRow: {
    marginTop: vs(28),
    alignItems: 'center',
    minHeight: vs(28),
    justifyContent: 'center',
  },
  footerContainer: {
    paddingTop: vs(24),
  },
  // Figma: rounded rect, light grey/blue bg, icon left, text right
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f4f9f8ff",
    borderRadius: ms(34),
    paddingVertical: vs(14),
    paddingHorizontal: ms(16),
  },
  shieldBadge: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(12),
  },
  privacyText: {
    flex: 1,
  },
});

export default OtpScreen;
