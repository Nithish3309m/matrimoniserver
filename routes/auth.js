const express = require('express');
const route = express.Router();
const userdata = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");

route.post('/register', async (req, res) => {
  try {
    const { name, email, password, gender, age, education, job, city, religion, bio } = req.body;

    const existuser = await userdata.findOne({ email });

    if (existuser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new userdata({
      name,
      email,
      password: hash,
      gender,
      age,
      education,
      job,
      city,
      religion,
      bio
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

route.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const isuser = await userdata.findOne({ email });

    if (!isuser) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const ispassword = await bcrypt.compare(password, isuser.password);
    if (!ispassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // ✅ Blocked user check
    if (isuser.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked by the admin.' });
    }

    const token = jwt.sign({ id: isuser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login success",
      token,
      user: {
        id: isuser._id,
        name: isuser.name,
        email: isuser.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

route.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json({ user });
});

module.exports = route;
