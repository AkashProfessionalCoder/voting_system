const mongoose = require("mongoose");
const Vote = require("../models/Vote");
const Nominee = require("../models/Nominee");
const { canonicalizeEmail } = require("../utils/emailUtils");
const { getActiveDeadline } = require("../utils/deadlineUtils");

/**
 * POST /api/votes  (batch — replaces the old per-nominee /api/vote)
 *
 * Body: { votes: [{ nomineeId: "..." }, ...] }
 *
 * Security model:
 *  - Requires a valid voter JWT (issued by verifyOtp)
 *  - Resolves nominee → category server-side; client never supplies the category
 *  - Enforces one-vote-per-category via DB unique index + explicit duplicate check
 *  - Marks the underlying OtpRequest as consumed so the token cannot be replayed
 *  - Rejects duplicate nomineeIds or duplicate categories in the same submission
 */
const castVotes = async (req, res) => {
  try {
    const { votes } = req.body;
    const { email, jti } = req.voter; // jti = OTP record id embedded in JWT

    // ── Input validation ─────────────────────────────────────────────────────
    if (!Array.isArray(votes) || votes.length === 0) {
      return res.status(400).json({ error: "At least one vote selection is required." });
    }
    if (votes.length > 10) {
      return res.status(400).json({ error: "Too many selections in a single request." });
    }

    const nomineeIds = votes.map((v) => v?.nomineeId).filter(Boolean);
    if (nomineeIds.length !== votes.length) {
      return res.status(400).json({ error: "Each vote must include a nomineeId." });
    }

    // Validate all IDs are valid ObjectIds
    const invalidId = nomineeIds.find((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidId) {
      return res.status(400).json({ error: "Invalid nominee ID provided." });
    }

    // Reject duplicate nomineeIds in the submission
    const uniqueNomineeIds = new Set(nomineeIds);
    if (uniqueNomineeIds.size !== nomineeIds.length) {
      return res.status(400).json({ error: "Duplicate nominee selections are not allowed." });
    }

    // ── Token replay prevention ───────────────────────────────────────────────
    if (jti) {
      const OtpRequest = require("../models/OtpRequest");
      const otpRecord = await OtpRequest.findOneAndUpdate(
        { _id: jti, verified: true, consumed: { $ne: true } },
        { $set: { consumed: true } }
      );
      if (!otpRecord) {
        return res.status(401).json({ error: "This session has already been used to vote. Please request a new OTP." });
      }
    }

    // ── Deadline check ────────────────────────────────────────────────────────
    const deadline = await getActiveDeadline();
    if (deadline && new Date() > deadline) {
      return res.status(403).json({ error: "Voting deadline has passed." });
    }

    // ── Resolve nominees → categories (server-side, not trusted from client) ──
    const nominees = await Nominee.find({ _id: { $in: nomineeIds } });
    if (nominees.length !== nomineeIds.length) {
      return res.status(404).json({ error: "One or more nominees were not found." });
    }

    // Build map: nomineeId → nominee doc
    const nomineeMap = Object.fromEntries(nominees.map((n) => [n._id.toString(), n]));

    // Reject duplicate categories in the submission
    const categories = nominees.map((n) => n.category);
    const uniqueCategories = new Set(categories);
    if (uniqueCategories.size !== categories.length) {
      return res.status(400).json({ error: "You may only vote once per category." });
    }

    // ── Check which categories this email has already voted in ────────────────
    const existingVotes = await Vote.find({ email, category: { $in: categories } }).select("category -_id");
    if (existingVotes.length > 0) {
      const alreadyVoted = existingVotes.map((v) => v.category);
      return res.status(409).json({
        error: `You have already voted in: ${alreadyVoted.map((c) => `"${c}"`).join(", ")}.`,
        categories: alreadyVoted,
      });
    }

    // ── Insert all votes ──────────────────────────────────────────────────────
    const voteDocs = nomineeIds.map((id) => ({
      email,
      nomineeId: id,
      category: nomineeMap[id].category,
    }));

    try {
      await Vote.insertMany(voteDocs, { ordered: false });
    } catch (err) {
      // 11000 = duplicate key — race condition guard (compound unique index)
      if (err.code === 11000 || err.writeErrors?.some?.((e) => e.code === 11000)) {
        return res.status(409).json({ error: "A concurrent vote was already recorded for one of these categories." });
      }
      throw err;
    }

    return res.status(200).json({
      message: "Votes recorded successfully.",
      categories,
    });
  } catch (error) {
    console.error("Batch vote error:", error);
    return res.status(500).json({ error: "Failed to record votes. Please try again." });
  }
};

/**
/**
 * POST /api/vote/status
 * Returns which categories the given email has already voted in.
 * Email is accepted in the request body to avoid PII in server logs.
 *
 * Response shape:
 *   { votes: { "Community Impact": true, ... } }  — booleans only, no nomineeIds.
 */
const checkVoteStatus = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "Email is required and must be a string." });
    }

    const canonicalEmail = canonicalizeEmail(email);

    const existingVotes = await Vote.find({ email: canonicalEmail }).select(
      "category -_id"
    );

    // Return only category presence (boolean) — no nomineeIds exposed to callers.
    const votes = existingVotes.reduce((acc, v) => {
      acc[v.category] = true;
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
 * Return the voting deadline from MongoDB (DB is the only source of truth).
 */
const getDeadline = async (req, res) => {
  try {
    const deadline = await getActiveDeadline();
    return res.status(200).json({ deadline: deadline ? deadline.toISOString() : null });
  } catch (error) {
    console.error("Get deadline error:", error);
    return res.status(500).json({ error: "Failed to fetch deadline." });
  }
};

module.exports = { castVotes, checkVoteStatus, getDeadline };
