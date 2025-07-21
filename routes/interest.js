const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Interest = require("../models/interest");
const User = require('../models/user');
const Match = require("../models/match"); // ✅ Add this at the top

// Send interest
router.post("/send", authMiddleware, async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  if (senderId.toString() === receiverId) {
    return res.status(400).json({ message: "Cannot send interest to yourself." });
  }

  const exists = await Interest.findOne({ sender: senderId, receiver: receiverId });
  if (exists) {
    return res.status(400).json({ message: "Interest already sent." });
  }

  const interest = new Interest({ sender: senderId, receiver: receiverId });
  await interest.save();

  res.status(200).json({ message: "Interest sent successfully" });
});


router.get('/status/:receiverId', authMiddleware, async (req, res) => {
  try {
    const existing = await Interest.findOne({
      sender: req.user._id,
      receiver: req.params.receiverId
    });

    if (!existing) {
      return res.json({ sent: false });
    }

    res.json({ sent: true, status: existing.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error checking interest status' });
  }
});

// route: GET /interest/received
router.get("/received", authMiddleware, async (req, res) => {
  const interests = await Interest.find({ receiver: req.user._id })
    .populate("sender", "-password")
    .sort({ createdAt: -1 });

  res.json({ interests });
});


// POST /interest/respond


// Accept/Reject Interest Request
router.post("/respond", authMiddleware, async (req, res) => {
  const { requestId, action } = req.body;

  try {
    const interest = await Interest.findById(requestId);

    if (!interest || interest.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    interest.status = action;
    await interest.save();

    // ✅ If accepted, check if sender also received interest and accepted it
    if (action === "accepted") {
      const reverse = await Interest.findOne({
        sender: req.user._id,
        receiver: interest.sender,
        status: "accepted",
      });

      if (reverse) {
        // ✅ Already mutually accepted, create match if not already matched
        const alreadyMatched = await Match.findOne({
          $or: [
            { user1: interest.sender, user2: req.user._id },
            { user1: req.user._id, user2: interest.sender }
          ]
        });

        if (!alreadyMatched) {
          const newMatch = new Match({
            user1: interest.sender,
            user2: req.user._id
          });
          await newMatch.save();
        }
      }
    }

    res.status(200).json({ message: `Interest ${action}` });
  } catch (err) {
    console.error("Error responding to interest:", err);
    res.status(500).json({ message: "Failed to update interest" });
  }
});



module.exports = router;
