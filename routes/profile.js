const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userdata = require('../models/user'); // your user model
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
const authMiddleware=require('../middleware/authMiddleware');
const Interest = require("../models/interest");
const Connect = require("../models/connect");


// ✅ Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Uploads go here
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// ✅ Profile update route (image + data)
router.post('/update', upload.single('image'), authMiddleware, async (req, res) => {
    try {
        const { email, name, password, age, gender, city, education, job, religion, bio, preference, ageMin, ageMax, cityPreference, language, lookingFor, hobbies } = req.body;

        const updatedData = {
            name,
            age,
            gender,
            city,
            education,
            job,
            religion,
            bio,
            preference,
            ageMin,
            ageMax,
            cityPreference,
            language,
            lookingFor,
            hobbies
        };

        if (req.file) {
            updatedData.image = req.file.path;
        }
        if (password && password.trim() !== '') {
            const hash = await bcrypt.hash(password, 10);
            updatedData.password = hash;
        }

        const user = await userdata.findOneAndUpdate(
            { email },
            { $set: updatedData },
            { new: true }
        );

        res.status(200).json({ message: 'Profile updated', user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
});



router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // You can also re-fetch from DB if needed, or just send req.user
    const user = await userdata.findById(req.user._id).select("-password");
    res.json({ user, message: "User profile fetched" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
});

router.get("/user/:id", authMiddleware, async (req, res) => {
  const targetId = req.params.id;
  const currentUserId = req.user._id;

  const user = await userdata.findById(targetId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  const existingInterest = await Interest.findOne({
    sender: currentUserId,
    receiver: targetId,
  });

  const existingConnect = await Connect.findOne({
    sender: currentUserId,
    receiver: targetId,
  });

  res.json({
    user,
    interestStatus: existingInterest ? existingInterest.status : null,
    connectStatus: existingConnect ? existingConnect.status : null,
  });
});



module.exports = router;
