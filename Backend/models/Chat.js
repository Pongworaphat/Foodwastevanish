const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({

  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Donation",
    required: true
  },

  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);