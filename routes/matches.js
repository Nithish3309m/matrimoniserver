const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");
const Match = require("../models/match");

router.get("/matches", authMiddleware, async (req, res) => {
  const userId = req.user._id;

  try {
    // 1. Find all existing matches
    const existingMatches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }]
    });

    // 2. Extract matched user IDs
    const matchedUserIds = existingMatches.map(m =>
      m.user1.toString() === userId.toString() ? m.user2.toString() : m.user1.toString()
    );

    // 3. Fetch current user to access their preferences
    const currentUser = await User.findById(userId);

    // 4. Find suggested users based on preferences and not already matched
    const suggestions = await User.find({
      _id: { $ne: userId, $nin: matchedUserIds },
      gender: currentUser.preference, // preference (e.g., "male" / "female")
      age: { $gte: currentUser.ageMin || 18, $lte: currentUser.ageMax || 100 },
      city: currentUser.cityPreference || { $exists: true }
    }).select("-password");

    res.json({ matches: suggestions });
  } catch (err) {
    console.error("Error in /matches route:", err);
    res.status(500).json({ message: "Failed to fetch match suggestions" });
  }
});

module.exports = router;
