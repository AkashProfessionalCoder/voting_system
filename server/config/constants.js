const CONSTANTS = {
  RATE_LIMITS: {
    OTP_REQUEST: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hour
      MAX_REQUESTS_PER_IP: 50,
      MAX_REQUESTS_PER_EMAIL: 5,
    },
    OTP_VERIFY: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hour
      MAX_REQUESTS_PER_IP: 50,
    },
  },
};

module.exports = CONSTANTS;
