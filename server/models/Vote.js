const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  nomineeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nominee",
    required: true,
  },
  // Denormalized from Nominee at vote time.
  // Required for the compound unique index (email + category).
  category: {
    type: String,
    required: true,
    trim: true,
  },
  votedAt: {
    type: Date,
    default: Date.now,
  },
});

// CRITICAL: One vote per email per category — DB-enforced compound unique index.
// Replaces the old single-field unique on email.
voteSchema.index({ email: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
