const Feedback = require("../models/Feedback");
const User = require("../models/User");

exports.createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create({
      user: req.user.id,
      category: req.body.category,
      title: req.body.title,
      message: req.body.message,
      contactEmail: req.body.contactEmail,
    });

    res.status(201).json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.resolveFeedback = async (req, res) => {
  try {

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );

    res.json(feedback);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};