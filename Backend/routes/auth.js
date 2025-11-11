// แทนที่ไฟล์ Backend/routes/auth.js (หรือจุดที่ต้องการแก้)
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET not set in env. Set process.env.JWT_SECRET');
  // ใน production ควร process.exit(1) เพื่อไม่ให้รันโดยไม่มี secret
}

router.post("/signup",
  [
    body('username').isLength({ min: 3 }).withMessage('username สั้นเกินไป'),
    body('email').isEmail().withMessage('email ไม่ถูกต้อง').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('password สั้นเกินไป')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      let { username, email, password } = req.body;
      email = email.toLowerCase();

      const exists = await User.findOne({ $or: [{ email }, { username }] });
      if (exists) return res.status(409).json({ message: "อีเมลหรือชื่อผู้ใช้นี้ถูกใช้แล้ว" });

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      const user = new User({ username, email, password: hashed });
      await user.save();

      return res.status(201).json({ message: "สมัครสมาชิกสำเร็จ" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดเซิร์ฟเวอร์" });
    }
  });

router.post("/signin",
  [
    body('usernameOrEmail').notEmpty(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { usernameOrEmail, password } = req.body;
      const queryEmail = usernameOrEmail.toLowerCase();
      const user = await User.findOne({
        $or: [{ email: queryEmail }, { username: usernameOrEmail }]
      });
      if (!user) return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });

      const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

      return res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar || ""
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดเซิร์ฟเวอร์" });
    }
  });

module.exports = router;
