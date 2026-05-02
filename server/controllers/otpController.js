const jwt = require("jsonwebtoken");
const OtpRequest = require("../models/OtpRequest");
const User = require("../models/User");
const { generateOtp, getOtpExpiry } = require("../services/otpService");
const { sendOtpEmail } = require("../services/emailService");
const { canonicalizeEmail } = require("../utils/emailUtils");
const { getActiveDeadline } = require("../utils/deadlineUtils");
const { RATE_LIMITS } = require("../config/constants");

const GMAIL_REGEX = /^[a-zA-Z0-9.\+]+@gmail\.com$/;

/**
 * POST /api/otp/request
 * Request an OTP for a Gmail address
 */
const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required." });
    }

    const originalEmail = email.trim().toLowerCase();
    const canonicalEmail = canonicalizeEmail(originalEmail);

    // Gmail-only validation
    if (!GMAIL_REGEX.test(originalEmail)) {
      return res
        .status(400)
        .json({ error: "Only @gmail.com addresses are allowed." });
    }

    // Check voting deadline before sending OTP (reads DB first, falls back to env)
    const deadline = await getActiveDeadline();
    if (deadline && new Date() > new Date(deadline)) {
      return res.status(403).json({ error: "Voting deadline has passed." });
    }

    // Rate limit: max requests per email per hour
    const oneHourAgo = new Date(Date.now() - RATE_LIMITS.OTP_REQUEST.WINDOW_MS);
    const recentRequests = await OtpRequest.countDocuments({
      email: canonicalEmail,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentRequests >= RATE_LIMITS.OTP_REQUEST.MAX_REQUESTS_PER_EMAIL) {
      return res
        .status(429)
        .json({ error: "Too many OTP requests. Try again later." });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = getOtpExpiry();

    // Save OTP to database
    await OtpRequest.create({
      email: canonicalEmail,
      otp,
      expiresAt,
    });

    // Upsert user record
    await User.findOneAndUpdate(
      { email: canonicalEmail },
      { email: canonicalEmail },
      { upsert: true, returnDocument: 'after' },
    );

    // Send OTP email
    await sendOtpEmail(originalEmail, otp);

    return res.status(200).json({ message: "OTP sent to email." });
  } catch (error) {
    console.error("OTP request error:", error);
    return res
      .status(500)
      .json({ error: "Failed to send OTP. Please try again." });
  }
};

/**
 * POST /api/otp/verify
 * Verify OTP and return a short-lived JWT
 */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp || typeof email !== "string" || typeof otp !== "string") {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    const originalEmail = email.trim().toLowerCase();
    const canonicalEmail = canonicalizeEmail(originalEmail);

    if (!GMAIL_REGEX.test(originalEmail)) {
      return res
        .status(400)
        .json({ error: "Only @gmail.com addresses are allowed." });
    }

    // Atomic find-and-mark to prevent race conditions
    const otpRecord = await OtpRequest.findOneAndUpdate(
      {
        email: canonicalEmail,
        otp,
        verified: false,
        expiresAt: { $gt: new Date() },
      },
      { $set: { verified: true } },
      { sort: { createdAt: -1 }, returnDocument: 'after' },
    );

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    // Update user as verified
    await User.findOneAndUpdate({ email: canonicalEmail }, { verified: true });

    // Generate short-lived JWT (15 minutes to cast vote)
    const token = jwt.sign(
      { email: canonicalEmail, role: "voter" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    return res.status(200).json({ message: "OTP verified.", token });
  } catch (error) {
    console.error("OTP verify error:", error);
    return res
      .status(500)
      .json({ error: "Verification failed. Please try again." });
  }
};

module.exports = { requestOtp, verifyOtp };
