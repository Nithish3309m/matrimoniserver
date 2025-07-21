const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await User.findOne({ email, isAdmin: true });
  if (!admin) {
    return res.status(401).json({ message: "Admin account not found." });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign({ id: admin._id, isAdmin: true }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });

  res.json({ message: "Admin login success", token, admin: { id: admin._id, name: admin.name } });
});







module.exports = router;


module.exports = router;
