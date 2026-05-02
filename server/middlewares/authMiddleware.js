const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

/**
 * Verify JWT token for admin routes.
 * Also checks that the token was issued AFTER the last password change —
 * this invalidates all old tokens across all sessions/devices when the
 * admin password is changed.
 */
const verifyAdminToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    // Check whether the password was changed after this token was issued
    const admin = await Admin.findOne({ username: decoded.username });
    if (admin?.passwordChangedAt) {
      const changedAt = Math.floor(admin.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < changedAt) {
        return res
          .status(401)
          .json({ error: "Session expired. Password was changed. Please log in again." });
      }
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

/**
 * Verify JWT token for voter (OTP-verified user)
 */
const verifyVoterToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Access denied. OTP verification required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "voter") {
      return res.status(403).json({ error: "Invalid token type." });
    }

    req.voter = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = { verifyAdminToken, verifyVoterToken };
