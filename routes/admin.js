// routes/admin.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const User = require("../models/user");

router.get("/dashboard", auth, adminOnly, async (req, res) => {
  const totalUsers = await User.countDocuments({ isAdmin: false });
  const featuredUsers = await User.find({ isFeatured: true }).limit(6).select("-password");

  res.json({ totalUsers, featuredUsers });
});

router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, "name email gender isBlocked createdAt"); // get necessary fields
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
