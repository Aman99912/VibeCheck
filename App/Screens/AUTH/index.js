/**
 * index.js
 * AuthFlow Entry Point.
 * Controls the navigation between Login (Phone) and OTP Verification.
 */

import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginScreen from './AUTH-SCREENS/login';
import OtpScreen from './AUTH-SCREENS/otp';
import useLoginLogic from './AUTH-COMPONENT/loginLogic';
import { Colors } from '../../Reusable-Component';

const AuthFlow = ({ onLoginSuccess }) => {
  const {
    step,
    phoneNumber,
    setPhoneNumber,
    otpCode,
    setOtpCode,
    isLoading,
    errorMsg,
    countdown,
    handleSendOtp,
    handleVerifyOtp,
    handleResendOtp,
    handleEditPhone,
  } = useLoginLogic(onLoginSuccess);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {step === 'phone' ? (
          <LoginScreen
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            onContinue={handleSendOtp}
            isLoading={isLoading}
            errorMsg={errorMsg}
          />
        ) : (
          <OtpScreen
            phoneNumber={phoneNumber}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            onBack={handleEditPhone}
            onEditPhone={handleEditPhone}
            countdown={countdown}
            isLoading={isLoading}
            errorMsg={errorMsg}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
});

export default AuthFlow;
