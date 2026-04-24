const express = require("express");
const router = express.Router();

const {
  login,
  getResults,
  getVoters,
  exportVotes,
  setDeadline,
} = require("../controllers/adminController");
const {
  addNominee,
  updateNominee,
  deleteNominee,
} = require("../controllers/nomineeController");
const { verifyAdminToken } = require("../middlewares/authMiddleware");

// Public admin route
router.post("/login", login);

// Protected admin routes
router.get("/results", verifyAdminToken, getResults);
router.get("/voters", verifyAdminToken, getVoters);
router.get("/export", verifyAdminToken, exportVotes);
router.put("/deadline", verifyAdminToken, setDeadline);

// Nominee management
router.post("/nominees", verifyAdminToken, addNominee);
router.put("/nominees/:id", verifyAdminToken, updateNominee);
router.delete("/nominees/:id", verifyAdminToken, deleteNominee);

module.exports = router;
