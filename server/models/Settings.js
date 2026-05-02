const mongoose = require("mongoose");

/**
 * Singleton settings document for the voting system.
 * Only one document (key: "global") should ever exist in this collection.
 */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    votingDeadline: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
