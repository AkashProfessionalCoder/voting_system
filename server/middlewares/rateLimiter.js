const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP request rate limiter — max 3 requests per email per hour
 * This is a global limiter per IP; per-email enforcement is in the controller.
 */
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // per IP (generous); per-email limit is 3, enforced in controller
  message: { error: "Too many OTP requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, otpLimiter };
