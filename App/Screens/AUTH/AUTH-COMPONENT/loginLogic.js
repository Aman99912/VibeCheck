/**
 * loginLogic.js
 * Encapsulates state management and business logic for the Auth flow.
 */

import { useState, useEffect } from 'react';

export const useLoginLogic = (onLoginSuccess) => {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Timer effect for OTP resend countdown
  useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  const handleSendOtp = () => {
    setErrorMsg('');
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      setErrorMsg('Please enter a valid mobile number');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setCountdown(30); // 30 seconds countdown
    }, 800);
  };

  const handleVerifyOtp = (codeOverride) => {
    setErrorMsg('');
    const codeToVerify = codeOverride || otpCode;
    
    // We check for 6 digits based on the UI grid, but match '000000' or '0000'
    if (!codeToVerify || (codeToVerify.length !== 6 && codeToVerify.length !== 4)) {
      setErrorMsg('Please enter the verification code');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (codeToVerify === '000000' || codeToVerify === '0000') {
        onLoginSuccess?.();
      } else {
        setErrorMsg('Invalid OTP');
      }
    }, 800);
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    setErrorMsg('');
    setOtpCode('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCountdown(30);
    }, 800);
  };

  const handleEditPhone = () => {
    setStep('phone');
    setOtpCode('');
    setErrorMsg('');
  };

  return {
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
  };
};
export default useLoginLogic;
