const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Connect = require("../models/connect"); // You'll create this model
const User = require('../models/user');
const Match = require('../models/match');

router.post("/send", authMiddleware, async (req, res) => {
  const sender = req.user._id;
  const { receiverId } = req.body;

  if (sender.toString() === receiverId) {
    return res.status(400).json({ message: "Cannot connect to yourself." });
  }

  const exists = await Connect.findOne({ sender, receiver: receiverId });
  if (exists) {
    return res.status(400).json({ message: "Connection request already sent." });
  }

  await new Connect({ sender, receiver: receiverId }).save();
  res.json({ message: "Connection request sent" });
});


router.get('/status/:receiverId', authMiddleware, async (req, res) => {
  try {
    const existing = await Connect.findOne({
      sender: req.user._id,
      receiver: req.params.receiverId
    });

    if (!existing) {
      return res.json({ sent: false });
    }

    res.json({ sent: true, status: existing.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error checking connect status' });
  }
});


// route: GET /connect/received
router.get("/received", authMiddleware, async (req, res) => {
  const connects = await Connect.find({ receiver: req.user._id })
    .populate("sender", "-password")
    .sort({ createdAt: -1 });

  res.json({ connects });
});


router.post("/respond", authMiddleware, async (req, res) => {
  const { requestId, action } = req.body;

  try {
    const connect = await Connect.findById(requestId);
    if (!connect || connect.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    connect.status = action;
    await connect.save();

    res.json({ message: `Connection ${action}` });
  } catch (err) {
    console.error("Connect respond error:", err);
    res.status(500).json({ message: "Failed to update connect status" });
  }
});




module.exports = router;
