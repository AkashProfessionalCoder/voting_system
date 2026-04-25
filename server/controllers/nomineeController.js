const Nominee = require("../models/Nominee");

/**
 * GET /api/nominees
 * List all nominees (public)
 */
const getNominees = async (req, res) => {
  try {
    const nominees = await Nominee.find().sort({ category: 1, name: 1 });
    return res.status(200).json(nominees);
  } catch (error) {
    console.error("Get nominees error:", error);
    return res.status(500).json({ error: "Failed to fetch nominees." });
  }
};

/**
 * POST /api/admin/nominees
 * Add a new nominee (admin only)
 */
const addNominee = async (req, res) => {
  try {
    const { name, title, image, category } = req.body;

    if (!name || !title || !category) {
      return res
        .status(400)
        .json({ error: "Name, title, and category are required." });
    }

    if (
      typeof name !== "string" ||
      typeof title !== "string" ||
      typeof category !== "string" ||
      (image && typeof image !== "string")
    ) {
      return res.status(400).json({ error: "Invalid input format." });
    }

    const nominee = await Nominee.create({
      name: name.trim(),
      title: title.trim(),
      image: image || "",
      category: category.trim(),
    });

    return res.status(201).json(nominee);
  } catch (error) {
    console.error("Add nominee error:", error);
    return res.status(500).json({ error: "Failed to add nominee." });
  }
};

/**
 * PUT /api/admin/nominees/:id
 * Update a nominee (admin only)
 */
const updateNominee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, image, category } = req.body;

    if (
      (name && typeof name !== "string") ||
      (title && typeof title !== "string") ||
      (image !== undefined && typeof image !== "string") ||
      (category && typeof category !== "string")
    ) {
      return res.status(400).json({ error: "Invalid input format." });
    }

    const nominee = await Nominee.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(title && { title: title.trim() }),
        ...(image !== undefined && { image }),
        ...(category && { category: category.trim() }),
      },
      { new: true, runValidators: true },
    );

    if (!nominee) {
      return res.status(404).json({ error: "Nominee not found." });
    }

    return res.status(200).json(nominee);
  } catch (error) {
    console.error("Update nominee error:", error);
    return res.status(500).json({ error: "Failed to update nominee." });
  }
};

/**
 * DELETE /api/admin/nominees/:id
 * Delete a nominee (admin only)
 */
const deleteNominee = async (req, res) => {
  try {
    const { id } = req.params;

    const nominee = await Nominee.findByIdAndDelete(id);

    if (!nominee) {
      return res.status(404).json({ error: "Nominee not found." });
    }

    return res.status(200).json({ message: "Nominee deleted." });
  } catch (error) {
    console.error("Delete nominee error:", error);
    return res.status(500).json({ error: "Failed to delete nominee." });
  }
};

module.exports = { getNominees, addNominee, updateNominee, deleteNominee };
