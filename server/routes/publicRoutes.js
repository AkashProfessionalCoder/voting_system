const express = require("express");
const router = express.Router();

const { requestOtp, verifyOtp } = require("../controllers/otpController");
const {
  castVotes,
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

// Voting — single batch request: { votes: [{ nomineeId }] }
router.post("/votes", verifyVoterToken, castVotes);
router.post("/vote/status", checkVoteStatus);

// Deadline
router.get("/deadline", getDeadline);

module.exports = router;
