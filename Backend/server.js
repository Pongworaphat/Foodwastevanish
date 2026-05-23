require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const chatRoutes = require("./routes/chat");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const donationRoutes = require("./routes/donation");

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => res.send("Backend running"));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong"
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

const helmet = require("helmet");
const morgan = require("morgan");

app.use(helmet());
app.use(morgan("dev"));


