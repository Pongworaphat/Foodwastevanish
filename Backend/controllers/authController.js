const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) console.error('JWT_SECRET not set');

exports.register = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    email = email.toLowerCase();

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ message: 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้แล้ว' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', user: { id: user._id, username, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const email = usernameOrEmail.toLowerCase();
    const user = await User.findOne({ $or: [{ email }, { username: usernameOrEmail }] });
    if (!user) return res.status(401).json({ message: 'invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id || req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};
