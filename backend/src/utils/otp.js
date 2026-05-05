const crypto = require('crypto');

/**
 * Generate 6-digit OTP code
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Get OTP expiry time (10 minutes from now)
 */
const getOtpExpiry = () => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);
  return expiry;
};

/**
 * Check if OTP is expired
 */
const isOtpExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

module.exports = { generateOtp, getOtpExpiry, isOtpExpired };
