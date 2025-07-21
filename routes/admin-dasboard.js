const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const User = require("../models/user");
const Connect = require("../models/connect");

router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMatches = await Connect.countDocuments({ status: "accepted" });
    // const totalReports = await Report.countDocuments(); // Optional

    res.json({
      users: totalUsers,
      matches: totalMatches,
      reports: 0, // replace with totalReports if available
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});


router.get("/users", authMiddleware, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const users = await User.find({ isAdmin: { $ne: true } }).select("-password");
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// PATCH: Block/Unblock a user
router.patch("/users/:id/block", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ success: true, isBlocked: user.isBlocked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




module.exports = router;
