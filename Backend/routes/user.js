const express = require('express');
const path = require('path');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const upload = require('../middleware/upload');
const auth = require("../middleware/auth");
const {
  changePassword,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

const Donation = require("../models/Donation");


const router = express.Router();

router.put("/change-password", auth, changePassword);
router.get("/", getAllUsers);

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const donationsShared = await Donation.countDocuments({
      donor: userId
    });

    const completedDonations = await Donation.countDocuments({
      donor: userId,
      status: "completed"
    });

    const allUserDonations = await Donation.find({
      donor: userId,
    });

    console.log(
      allUserDonations.map(d => ({
        title: d.title,
        status: d.status
      }))
    );

    const peopleHelped = completedDonations;

    const trustScore =
      donationsShared > 0
        ? Math.round(
          (completedDonations / donationsShared) * 100
        )
        : 0;

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
    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });
  }
});

router.get("/activity", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const donations = await Donation.find({
      donor: userId,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const activities = donations.map((donation) => ({
      id: donation._id,
      title: donation.title,
      status: donation.status,
      createdAt: donation.createdAt,
    }));

    res.json(activities);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.get("/:id/public", async (req, res) => {
  try {
    console.log(req.params.id);
    const userId = req.params.id;

    const user = await User.findById(userId).select(
      "username avatar about social createdAt"
    );

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

    const trustScore =
      donationsShared > 0
        ? Math.round(
          (completedDonations / donationsShared) * 100
        )
        : 0;

    res.json({
      ...user.toObject(),
      stats: {
        donationsShared,
        completedDonations,
        peopleHelped,
        trustScore,
      },
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.put('/profile', verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const payload = {};
    if (req.body.profile && typeof req.body.profile === 'object') {
      Object.assign(payload, req.body.profile);
    }
    Object.assign(payload, req.body);

    const updates = {};

    if (payload.name !== undefined) updates.username = payload.name;
    if (payload.username !== undefined) updates.username = payload.username;
    if (payload.email !== undefined) updates.email = String(payload.email).toLowerCase();
    if (payload.phone !== undefined) {
      updates.phone = String(payload.phone).replace(/[^\d+]/g, '');
    }
    if (payload.about !== undefined) {
      updates.about = String(payload.about).slice(0, 500);
    }

    if (payload.city !== undefined) {
      updates.city = String(payload.city);
    }

    if (payload.country !== undefined) {
      updates.country = String(payload.country);
    }

    if (payload.campus !== undefined) {
      updates.campus = String(payload.campus);
    }

    if (payload.building !== undefined) {
      updates.building = String(payload.building);
    }

    if (payload.locationNote !== undefined) {
      updates.locationNote = String(payload.locationNote);
    }

    if (payload.latitude !== undefined) {
      updates.latitude = Number(payload.latitude);
    }

    if (payload.longitude !== undefined) {
      updates.longitude = Number(payload.longitude);
    }

    if (payload.social !== undefined) {
      updates.social = payload.social;
    }

    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('[ERROR route PUT /profile]', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const userId = req.user?.id || req.userId;
    const avatarPath = `/uploads/${req.file.filename}`;

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

router.delete('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

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

router.put(
  "/:id/role",
  updateUserRole
);

router.delete(
  "/:id",
  auth,
  deleteUser
);

module.exports = router;
