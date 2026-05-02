const express = require("express");
const router = express.Router();

const { requestOtp, verifyOtp } = require("../controllers/otpController");
const {
  castVote,
  checkVoteStatus,
  getDeadline,
} = require("../controllers/voteController");
const { getNominees } = require("../controllers/nomineeController");
const { verifyVoterToken } = require("../middlewares/authMiddleware");
const { otpLimiter, otpVerifyLimiter } = require("../middlewares/rateLimiter");

// Nominees
router.get("/nominees", getNominees);

// OTP
router.post("/otp/request", otpLimiter, requestOtp);
router.post("/otp/verify", otpVerifyLimiter, verifyOtp);

// Voting
router.post("/vote", verifyVoterToken, castVote);
router.post("/vote/status", checkVoteStatus);

// Deadline
router.get("/deadline", getDeadline);

module.exports = router;
