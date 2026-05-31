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

  latitude: {
    type: Number,
    default: null
  },

  longitude: {
    type: Number,
    default: null
  },

  pickupTime: {
    type: String,
    default: ""
  },

  expDate: {
    type: String,
    default: ""
  },

  productionDate: {
    type: String,
    default: ""
  },

  pickupEndTime: {
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
  },

  ownerConfirmed: {
    type: Boolean,
    default: false,
  },

  receiverConfirmed: {
    type: Boolean,
    default: false,
  },

  donorName: {
    type: String,
  },

  donorAvatar: {
    type: String,
  },


}, { timestamps: true });

module.exports = mongoose.model("Donation", donationSchema);