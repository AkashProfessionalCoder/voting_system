const crypto = require("crypto");

/**
 * Generate a cryptographically secure 6-digit OTP
 */
const generateOtp = () => {
  // Generate random number between 100000 and 999999
  const otp = crypto.randomInt(100000, 999999);
  return otp.toString();
};

/**
 * Get OTP expiry date (5 minutes from now)
 */
const getOtpExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

module.exports = { generateOtp, getOtpExpiry };
