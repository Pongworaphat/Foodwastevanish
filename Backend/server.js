require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express(); 
app.use(cors());
app.use(express.json());
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("Backend running"));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

app.use("/uploads", express.static("uploads"));
