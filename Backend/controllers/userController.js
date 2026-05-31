const User = require("../models/User");
const Donation = require("../models/Donation");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const donationsShared = await Donation.countDocuments({
      donor: userId,
    });

    const completedDonations = await Donation.countDocuments({
      donor: userId,
      status: "completed",
    });

    const peopleHelped = completedDonations;

    const trustScore = 0;

    res.json({
      user,
      stats: {
        donationsShared,
        completedDonations,
        peopleHelped,
        trustScore,
      },
    });

  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบ" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
