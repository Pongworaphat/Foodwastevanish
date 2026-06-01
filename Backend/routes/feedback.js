const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getAllFeedbacks,
  resolveFeedback,
} = require("../controllers/feedbackController");

const verifyToken = require("../middleware/auth");

router.post("/", verifyToken, createFeedback);

router.get("/", verifyToken, getAllFeedbacks);

router.put(
  "/:id/resolve",
  verifyToken,
  resolveFeedback
);

module.exports = router;