const Message = require("../models/Message");

exports.getMessages = async (req, res) => {
  try {

    const messages = await Message.find({
      chat: req.params.chatId
    })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Get messages failed"
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Message is required"
      });
    }

    const message = await Message.create({
      chat: req.params.chatId,
      sender: req.user.id,
      text
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username avatar");

    res.status(201).json(populatedMessage);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Send message failed"
    });
  }
};