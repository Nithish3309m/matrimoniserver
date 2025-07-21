// Example: routes/chat.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Match = require("../models/match");
const Connect = require("../models/connect");
const Chat = require("../models/chat");

// 🔐 Middleware-like chat permission check
const canChat = async (user1, user2) => {
  const matched = await Match.findOne({
    $or: [
      { user1, user2 },
      { user1: user2, user2: user1 }
    ]
  });

  const connected = await Connect.findOne({
    $or: [
      { sender: user1, receiver: user2, status: "accepted" },
      { sender: user2, receiver: user1, status: "accepted" }
    ]
  });

  return matched && connected;
};

router.post("/send", authMiddleware, async (req, res) => {
  const sender = req.user._id;
  const { receiver, message } = req.body;

  try {
    const allowed = await canChat(sender, receiver);

    if (!allowed) {
      return res.status(403).json({ message: "You must match and connect to start chat." });
    }

    const newChat = new Chat({ sender, receiver, message });
    await newChat.save();

    res.status(201).json({ message: "Message sent successfully", chat: newChat });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: "Server error sending message" });
  }
});



router.get("/:id", authMiddleware, async (req, res) => {
  const user1 = req.user._id;
  const user2 = req.params.id;

  try {
    const allowed = await canChat(user1, user2);
    if (!allowed) {
      return res.status(403).json({ message: "You must match and connect to view chat." });
    }

    const chats = await Chat.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ createdAt: 1 }); // oldest to newest

    res.json({ chats });
  } catch (err) {
    console.error("Chat history fetch error:", err);
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

module.exports = router;
