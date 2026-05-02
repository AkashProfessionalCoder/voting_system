const Settings = require("../models/Settings");

/**
 * Get the active voting deadline.
 * Priority: DB (persisted via admin panel) → VOTING_DEADLINE env var → null.
 */
const getActiveDeadline = async () => {
  try {
    const settings = await Settings.findOne({ key: "global" });
    if (settings?.votingDeadline) return settings.votingDeadline;
  } catch (_) {
    // Fall through to env var if DB is unreachable
  }
  const envDeadline = process.env.VOTING_DEADLINE;
  return envDeadline ? new Date(envDeadline) : null;
};

/**
 * Set / update the voting deadline, persisting it in MongoDB.
 */
const setActiveDeadline = async (date) => {
  await Settings.findOneAndUpdate(
    { key: "global" },
    { votingDeadline: date },
    { upsert: true }
  );
};

module.exports = { getActiveDeadline, setActiveDeadline };
