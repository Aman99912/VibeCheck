/**
 * API/auth.js
 * Authentication endpoints client.
 */

import api from './index';

export const authApi = {
  /**
   * Request an OTP code for a mobile number.
   * @param {string} phoneNumber
   */
  sendOtp: (phoneNumber) => 
    api.post('/auth/send-otp', { phoneNumber }),

  /**
   * Verify the entered code for a mobile number.
   * @param {string} phoneNumber
   * @param {string} code
   */
  verifyOtp: (phoneNumber, code) => 
    api.post('/auth/verify-otp', { phoneNumber, code }),
};

export default authApi;
