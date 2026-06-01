const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },


  avatar: {
    type: String,
    default: "/uploads/default-avatar.png"
  },

  phone: { type: String, default: "", trim: true },
  about: { type: String, default: "", maxlength: 500 },

  campus: { type: String, default: "" },
  building: { type: String, default: "" },
  locationNote: { type: String, default: "" },

  latitude: {
    type: Number,
    default: 13.1206,
  },

  longitude: {
    type: Number,
    default: 100.9185,
  },

  social: {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    line: { type: String, default: "" },
  },

}, {
  timestamps: true
});




module.exports = mongoose.model("User", userSchema);
