const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  quantity: {
    type: String,
    required: true
  },

  category: {
    type: String,
    default: ""
  },

  pickupLocation: {
    type: String,
    required: true
  },

  pickupTime: {
    type: String,
    default: ""
  },

  image: {
    type: String,
    default: ""
  },

  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  status: {
    type: String,
    enum: ["available", "claimed", "completed"],
    default: "available"
  }

}, { timestamps: true });

module.exports = mongoose.model("Donation", donationSchema);