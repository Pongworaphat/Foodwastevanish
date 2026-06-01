require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const donationRoutes = require("./routes/donation");
const feedbackRoutes = require("./routes/feedback");


const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use("/api/user", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);

app.get("/", (req, res) => res.send("Backend running"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

const notificationRoutes =
  require("./routes/notification");

app.use(
  "/api/notifications",
  notificationRoutes
);


app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));