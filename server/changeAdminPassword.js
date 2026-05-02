/**
 * Change admin password script
 * Usage:
 *   node server/changeAdminPassword.js <newPassword>
 *   npm run change-admin-password -- <newPassword>
 *
 * Example:
 *   node server/changeAdminPassword.js mySecurePass123
 */
require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const connectDB = require("./config/db");

const run = async () => {
  const newPassword = process.argv[2];

  if (!newPassword) {
    console.error("❌  Usage: node server/changeAdminPassword.js <newPassword>");
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error("❌  Password must be at least 6 characters.");
    process.exit(1);
  }

  await connectDB();

  const admin = await Admin.findOne({ username: "admin" });
  if (!admin) {
    console.error("❌  Admin user not found. Run `npm run seed` first.");
    await mongoose.disconnect();
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  admin.password = hashed;
  admin.passwordChangedAt = new Date(); // invalidates all existing JWT tokens
  await admin.save();

  console.log("✅  Admin password updated successfully.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
