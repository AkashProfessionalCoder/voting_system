const Settings = require("../models/Settings");

/**
 * Get the active voting deadline from MongoDB.
 * The VOTING_DEADLINE env var is only used by seed.js — not here.
 */
const getActiveDeadline = async () => {
  const settings = await Settings.findOne({ key: "global" });
  return settings?.votingDeadline ?? null;
};

/**
 * Set / update the voting deadline in MongoDB.
 */
const setActiveDeadline = async (date) => {
  await Settings.findOneAndUpdate(
    { key: "global" },
    { votingDeadline: date },
    { upsert: true }
  );
};

module.exports = { getActiveDeadline, setActiveDeadline };
