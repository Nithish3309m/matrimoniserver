const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/featured", async (req, res) => {
  try {
    const usersWithImages = await User.find({
      image: { $ne: "" }, // ✅ only users who have uploaded an image
    }).select("-password").limit(6); // You can increase/decrease limit

    res.json({ users: usersWithImages });
  } catch (err) {
    console.error("Error fetching featured users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
