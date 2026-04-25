const CONSTANTS = {
  RATE_LIMITS: {
    GLOBAL_API: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100,
    },
    OTP_REQUEST: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hour
      MAX_REQUESTS_PER_IP: 10,
      MAX_REQUESTS_PER_EMAIL: 5,
    },
    OTP_VERIFY: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS_PER_IP: 10,
    },
  },
};

module.exports = CONSTANTS;
