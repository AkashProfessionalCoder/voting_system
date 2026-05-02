const mongoose = require("mongoose");
const Vote = require("../models/Vote");
const Nominee = require("../models/Nominee");
const { canonicalizeEmail } = require("../utils/emailUtils");

/**
 * POST /api/vote
 * Cast a vote for a nominee (requires verified OTP token).
 * Enforces: one vote per email per category.
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

    // Verify nominee exists and get their category
    const nominee = await Nominee.findById(nomineeId);
    if (!nominee) {
      return res.status(404).json({ error: "Nominee not found." });
    }

    const { category } = nominee;

    // Explicit duplicate check: has this email already voted in this category?
    const existingVote = await Vote.findOne({ email, category });
    if (existingVote) {
      return res.status(409).json({
        error: `You have already voted in the "${category}" category.`,
        category,
      });
    }

    // Attempt to insert vote — compound unique index (email + category) is the
    // final safety net against race conditions.
    try {
      await Vote.create({ email, nomineeId, category });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          error: `You have already voted in the "${category}" category.`,
          category,
        });
      }
      throw err;
    }

    return res.status(200).json({
      message: "Vote recorded successfully.",
      category,
    });
  } catch (error) {
    console.error("Vote error:", error);
    return res
      .status(500)
      .json({ error: "Failed to record vote. Please try again." });
  }
};

/**
 * GET /api/vote/status?email=...
 * Returns which categories the given email has already voted in,
 * along with the nomineeId chosen per category.
 *
 * Response shape:
 *   { votes: { "Community Impact": "<nomineeId>", ... } }
 */
const checkVoteStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const canonicalEmail = canonicalizeEmail(email);

    const existingVotes = await Vote.find({ email: canonicalEmail }).select(
      "category nomineeId -_id"
    );

    // Build a map: { category -> nomineeId }
    const votes = existingVotes.reduce((acc, v) => {
      acc[v.category] = v.nomineeId.toString();
      return acc;
    }, {});

    return res.status(200).json({ votes });
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
