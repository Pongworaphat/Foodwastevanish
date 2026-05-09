const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  getMessages,
  sendMessage
} = require("../controllers/chatController");

router.get("/:chatId/messages", auth, getMessages);

router.post("/:chatId/messages", auth, sendMessage);

module.exports = router;