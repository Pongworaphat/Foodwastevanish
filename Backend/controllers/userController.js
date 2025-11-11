const User = require('../models/User');
const path = require('path');
const fs = require('fs');

const safeUnlink = (filepath) => {
  if (!filepath) return;
  const full = path.join(__dirname, '..', 'uploads', path.basename(filepath));
  if (fs.existsSync(full)) fs.unlinkSync(full);
};

// Backend/controllers/userController.js
// Backend/controllers/userController.js
exports.updateProfile = async (req, res) => {
  try {
    // log สำหรับตรวจสอบ
    console.log('[DEBUG] req.body:', req.body);

    const userId = req.user?.id || req.userId;
    const profile = req.body.profile || {}; // frontend ส่งมาแบบนี้
    const { phone, about, name } = profile;

    const updates = {};

    if (name !== undefined) updates.username = name; // frontend ใช้ 'name' แทน username
    if (phone !== undefined) updates.phone = phone.replace(/[^\d+]/g, '');
    if (about !== undefined) updates.about = about.slice(0, 500);

    // อัปเดตข้อมูลใน MongoDB
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('[UPDATED]', updates);
    return res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('[ERROR updateProfile]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'no file' });

    const userId = req.user?.id || req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'not found' });

    if (user.avatar) safeUnlink(user.avatar);
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ message: 'avatar updated', avatar: user.avatar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'not found' });

    if (user.avatar) safeUnlink(user.avatar);
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};
