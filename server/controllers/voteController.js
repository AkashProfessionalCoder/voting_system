const mongoose = require("mongoose");
const Vote = require("../models/Vote");
const Nominee = require("../models/Nominee");

/**
 * POST /api/vote
 * Cast a vote (requires verified OTP token)
 */
const castVote = async (req, res) => {
  try {
    const { nomineeId } = req.body;
    const { email } = req.voter; // from JWT middleware

    if (!nomineeId) {
      return res.status(400).json({ error: "Nominee selection is required." });
    }

    // Validate nomineeId format
    if (!mongoose.Types.ObjectId.isValid(nomineeId)) {
      return res.status(400).json({ error: "Invalid nominee ID." });
    }

    // Check voting deadline
    const deadline = process.env.VOTING_DEADLINE;
    if (deadline && new Date() > new Date(deadline)) {
      return res.status(403).json({ error: "Voting deadline has passed." });
    }

    // Verify nominee exists
    const nominee = await Nominee.findById(nomineeId);
    if (!nominee) {
      return res.status(404).json({ error: "Nominee not found." });
    }

    // Attempt to insert vote — unique index on email prevents duplicates
    try {
      await Vote.create({
        email,
        nomineeId,
      });
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate key error = already voted
        return res.status(409).json({ error: "You have already voted." });
      }
      throw err;
    }

    return res.status(200).json({ message: "Vote recorded successfully." });
  } catch (error) {
    console.error("Vote error:", error);
    return res
      .status(500)
      .json({ error: "Failed to record vote. Please try again." });
  }
};

/**
 * GET /api/vote/status?email=...
 * Check if an email has already voted
 */
const checkVoteStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingVote = await Vote.findOne({ email: normalizedEmail });

    return res.status(200).json({ hasVoted: !!existingVote });
  } catch (error) {
    console.error("Vote status error:", error);
    return res.status(500).json({ error: "Failed to check vote status." });
  }
};

/**
 * GET /api/deadline
 * Return the voting deadline
 */
const getDeadline = async (req, res) => {
  const deadline = process.env.VOTING_DEADLINE || null;
  return res.status(200).json({ deadline });
};

module.exports = { castVote, checkVoteStatus, getDeadline };
