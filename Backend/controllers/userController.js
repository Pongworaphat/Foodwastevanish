const User = require('../models/User');
const path = require('path');
const fs = require('fs');

const safeUnlink = (filepath) => {
  if (!filepath) return;
  const full = path.join(__dirname, '..', 'uploads', path.basename(filepath));
  if (fs.existsSync(full)) fs.unlinkSync(full);
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const allowed = ['username', 'email', 'name', 'phone'];
    const updates = {};
    for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
    if (updates.email) updates.email = updates.email.toLowerCase();

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'not found' });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
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
