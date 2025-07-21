const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Match = require("../models/match");
const user=require("../models/user")
const Connect = require("../models/connect");

router.get("/matches", authMiddleware, async (req, res) => {
  const userId = req.user._id;

  const matches = await Match.find({
    $or: [{ user1: userId }, { user2: userId }]
  }).populate("user1 user2", "-password");

  const results = [];

  for (const m of matches) {
    const matchedUser = m.user1._id.toString() === userId.toString() ? m.user2 : m.user1;

    const isConnected = await Connect.findOne({
      $or: [
        { sender: userId, receiver: matchedUser._id, status: "accepted" },
        { sender: matchedUser._id, receiver: userId, status: "accepted" }
      ]
    });

    results.push({
      ...matchedUser._doc,
      _id: matchedUser._id,
      connected: !!isConnected
    });
  }

  res.json({ matches: results });
});

module.exports = router;
