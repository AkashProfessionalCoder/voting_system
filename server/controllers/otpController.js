const jwt = require("jsonwebtoken");
const OtpRequest = require("../models/OtpRequest");
const User = require("../models/User");
const { generateOtp, getOtpExpiry } = require("../services/otpService");
const { sendOtpEmail } = require("../services/emailService");

const GMAIL_REGEX = /^[a-zA-Z0-9.]+@gmail\.com$/;

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

    const normalizedEmail = email.trim().toLowerCase();

    // Gmail-only validation
    if (!GMAIL_REGEX.test(normalizedEmail)) {
      return res
        .status(400)
        .json({ error: "Only @gmail.com addresses are allowed." });
    }

    // Check voting deadline before sending OTP
    const deadline = process.env.VOTING_DEADLINE;
    if (deadline && new Date() > new Date(deadline)) {
      return res.status(403).json({ error: "Voting deadline has passed." });
    }

    // Check if user has already voted
    const Vote = require("../models/Vote");
    const existingVote = await Vote.findOne({ email: normalizedEmail });
    if (existingVote) {
      return res.status(409).json({ error: "You have already voted." });
    }

    // Rate limit: max 3 OTP requests per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentRequests = await OtpRequest.countDocuments({
      email: normalizedEmail,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentRequests >= 3) {
      return res
        .status(429)
        .json({ error: "Too many OTP requests. Try again later." });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = getOtpExpiry();

    // Save OTP to database
    await OtpRequest.create({
      email: normalizedEmail,
      otp,
      expiresAt,
    });

    // Upsert user record
    await User.findOneAndUpdate(
      { email: normalizedEmail },
      { email: normalizedEmail },
      { upsert: true, new: true },
    );

    // Send OTP email
    await sendOtpEmail(normalizedEmail, otp);

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

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!GMAIL_REGEX.test(normalizedEmail)) {
      return res
        .status(400)
        .json({ error: "Only @gmail.com addresses are allowed." });
    }

    // Atomic find-and-mark to prevent race conditions
    const otpRecord = await OtpRequest.findOneAndUpdate(
      {
        email: normalizedEmail,
        otp,
        verified: false,
        expiresAt: { $gt: new Date() },
      },
      { $set: { verified: true } },
      { sort: { createdAt: -1 }, new: true },
    );

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    // Update user as verified
    await User.findOneAndUpdate({ email: normalizedEmail }, { verified: true });

    // Generate short-lived JWT (15 minutes to cast vote)
    const token = jwt.sign(
      { email: normalizedEmail, role: "voter" },
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
