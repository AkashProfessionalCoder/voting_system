const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // CRITICAL: one vote per email, DB-enforced
    trim: true,
    lowercase: true,
  },
  nomineeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nominee",
    required: true,
  },
  votedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Vote", voteSchema);
