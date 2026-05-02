const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Vote = require("../models/Vote");

/**
 * POST /api/admin/login
 * Admin login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid input format." });
    }

    const admin = await Admin.findOne({
      username: username.trim().toLowerCase(),
    });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    return res.status(200).json({ message: "Login successful.", token });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ error: "Login failed." });
  }
};

/**
 * GET /api/admin/results
 * Get vote counts per nominee, grouped by category.
 */
const getResults = async (req, res) => {
  try {
    const results = await Vote.aggregate([
      {
        $group: {
          _id: "$nomineeId",
          voteCount: { $sum: 1 },
          // category is denormalized on each Vote document
          category: { $first: "$category" },
        },
      },
      {
        $lookup: {
          from: "nominees",
          localField: "_id",
          foreignField: "_id",
          as: "nominee",
        },
      },
      { $unwind: "$nominee" },
      {
        $project: {
          _id: 0,
          nomineeId: "$_id",
          name: "$nominee.name",
          title: "$nominee.title",
          category: "$category",
          image: "$nominee.image",
          voteCount: 1,
        },
      },
      // Sort by category name then descending vote count
      { $sort: { category: 1, voteCount: -1 } },
    ]);

    // Per-category totals (useful for computing % within a category)
    const categoryTotals = results.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.voteCount;
      return acc;
    }, {});

    const totalVotes = await Vote.countDocuments();

    return res.status(200).json({ results, totalVotes, categoryTotals });
  } catch (error) {
    console.error("Get results error:", error);
    return res.status(500).json({ error: "Failed to fetch results." });
  }
};

/**
 * GET /api/admin/voters
 * List all voters with their nominee choices
 */
const getVoters = async (req, res) => {
  try {
    const voters = await Vote.find()
      .populate("nomineeId", "name title category")
      .sort({ votedAt: -1 });

    return res.status(200).json(voters);
  } catch (error) {
    console.error("Get voters error:", error);
    return res.status(500).json({ error: "Failed to fetch voters." });
  }
};

/**
 * GET /api/admin/export
 * Export votes as CSV
 */
const exportVotes = async (req, res) => {
  try {
    const votes = await Vote.find()
      .populate("nomineeId", "name title category")
      .sort({ votedAt: -1 });

    // Build CSV
    const header = "Email,Nominee,Title,Category,Voted At\n";
    const rows = votes.map((v) => {
      const nominee = v.nomineeId;
      const name = nominee ? nominee.name : "Deleted";
      const title = nominee ? nominee.title : "";
      const category = nominee ? nominee.category : "";
      const votedAt = v.votedAt.toISOString();
      // Escape fields for CSV (prevent formula injection)
      const safe = (s) =>
        s.replace(/"/g, '""').replace(/^([=+\-@\t\r])/g, "'$1");
      return `"${safe(v.email)}","${safe(name)}","${safe(title)}","${safe(category)}","${votedAt}"`;
    });

    const csv = header + rows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=votes-export.csv",
    );
    return res.status(200).send(csv);
  } catch (error) {
    console.error("Export error:", error);
    return res.status(500).json({ error: "Failed to export votes." });
  }
};

/**
 * PUT /api/admin/deadline
 * Set/update voting deadline
 */
const setDeadline = async (req, res) => {
  try {
    const { deadline } = req.body;

    if (!deadline) {
      return res.status(400).json({ error: "Deadline timestamp is required." });
    }

    // Validate date
    const date = new Date(deadline);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }

    // Update environment variable at runtime
    process.env.VOTING_DEADLINE = date.toISOString();

    return res.status(200).json({
      message: "Deadline updated.",
      deadline: date.toISOString(),
    });
  } catch (error) {
    console.error("Set deadline error:", error);
    return res.status(500).json({ error: "Failed to set deadline." });
  }
};

/**
 * DELETE /api/admin/voters/truncate
 * Truncate all votes and voters data (Danger Zone)
 */
const truncateVotes = async (req, res) => {
  try {
    await Vote.deleteMany({});
    return res.status(200).json({ message: "All votes have been successfully deleted." });
  } catch (error) {
    console.error("Truncate votes error:", error);
    return res.status(500).json({ error: "Failed to truncate votes." });
  }
};

module.exports = { login, getResults, getVoters, exportVotes, setDeadline, truncateVotes };
