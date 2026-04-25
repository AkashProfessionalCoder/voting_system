const rateLimit = require("express-rate-limit");
const { RATE_LIMITS } = require("../config/constants");

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL_API.WINDOW_MS,
  max: RATE_LIMITS.GLOBAL_API.MAX_REQUESTS,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP request rate limiter — max 5 requests per IP per hour
 * This is a strict per-IP limiter; per-email limit is 3, enforced in controller.
 */
const otpLimiter = rateLimit({
  windowMs: RATE_LIMITS.OTP_REQUEST.WINDOW_MS,
  max: RATE_LIMITS.OTP_REQUEST.MAX_REQUESTS_PER_IP,
  message: { error: "Too many OTP requests from this IP. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP verify rate limiter — max 5 attempts per IP per 15 minutes
 */
const otpVerifyLimiter = rateLimit({
  windowMs: RATE_LIMITS.OTP_VERIFY.WINDOW_MS,
  max: RATE_LIMITS.OTP_VERIFY.MAX_REQUESTS_PER_IP,
  message: { error: "Too many OTP verification attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, otpLimiter, otpVerifyLimiter };
