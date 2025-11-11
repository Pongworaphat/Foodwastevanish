// Backend/routes/user.js
const express = require('express');
const path = require('path'); // <- ต้องมี
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const upload = require('../middleware/upload'); // ใช้ middleware ที่แยกไว้

const router = express.Router();

/** GET profile */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/** PUT update profile (whitelist fields) */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const allowed = ['username', 'email', 'name', 'phone'];
    const updates = {};
    for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
    if (updates.email) updates.email = updates.email.toLowerCase();

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/** POST avatar (uses upload middleware) */
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const userId = req.user?.id || req.userId;
    const avatarPath = `/uploads/${req.file.filename}`;

    // ลบไฟล์เก่าถ้ามี (optional: implement safe unlink ใน controller)
    const existing = await User.findById(userId).select('avatar');
    if (existing && existing.avatar) {
      const fs = require('fs');
      const uploadsDir = require('path').join(__dirname, '..', 'uploads');
      const old = require('path').join(uploadsDir, require('path').basename(existing.avatar));
      fs.access(old, fs.constants.F_OK, (err) => { if (!err) fs.unlink(old, () => { }); });
    }

    const user = await User.findByIdAndUpdate(userId, { avatar: avatarPath }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Avatar updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/** DELETE user */
router.delete('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ลบ avatar ถ้ามี
    if (user.avatar) {
      const fs = require('fs');
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      const old = path.join(uploadsDir, path.basename(user.avatar));
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
