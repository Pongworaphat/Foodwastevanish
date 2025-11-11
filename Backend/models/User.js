const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  phone: { type: String, default: "", trim: true },
  about: { type: String, default: "", maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("User", userSchema);
