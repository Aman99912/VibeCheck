/**
 * login.js
 * Phone Number Entry Screen.
 * Matches left screen design in APP_REFF/auth/image.png.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors, CText, InputBox, AppButton, ms, vs } from '../../../Reusable-Component';
import AuthHeader from '../AUTH-COMPONENT/auth.header';

const LoginScreen = ({
  phoneNumber,
  setPhoneNumber,
  onContinue,
  isLoading,
  errorMsg,
}) => {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Top content block — logo + heading + form */}
      <View style={styles.topBlock}>
        <AuthHeader type="login" />

        <View style={styles.formBlock}>
          <InputBox
            type="phone"
            label="Enter mobile number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter mobile number"
            errorMsg={errorMsg}
            countryCode="+91"
            disabled={isLoading}
            maxLength={10}
          />

          <AppButton
          title="Send Otp"
        //   rightIcon="arrow-forward"
            onPress={onContinue}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          />

          <View style={styles.securityRow}>
            <MaterialIcons name="lock-outline" size={ms(15)} color={Colors.textMuted} style={styles.lockIcon} />
            <CText variant="caption" color={Colors.textMuted}>
              We'll send you a verification code
            </CText>
          </View>
        </View>
      </View>

      {/* Footer — sticks to bottom */}
      <View style={styles.footerContainer}>
        <CText variant="caption" color={Colors.textMuted} align="center">
          By continuing, you agree to our
        </CText>
        <View style={styles.linksRow}>
          <CText variant="caption" weight="semibold" color={Colors.primary}>
            Terms of Service
          </CText>
          <CText variant="caption" color={Colors.textMuted} style={styles.bullet}>•</CText>
          <CText variant="caption" weight="semibold" color={Colors.primary}>
            Privacy Policy
          </CText>
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
    paddingTop: vs(100),
    paddingBottom: vs(24),
    justifyContent: 'space-between',
  },
  topBlock: {
    flex: 0,
  },
  formBlock: {
    marginTop: vs(28),
  },
  button: {
    marginTop: vs(14),
   borderRadius: ms(50),
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(14),
  },
  lockIcon: {
    marginRight: ms(6),
  },
  footerContainer: {
    paddingTop: vs(22),
    alignItems: 'center',
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(4),
  },
  bullet: {
    marginHorizontal: ms(6),
  },
});

export default LoginScreen;
