// Load environment variables
require("dotenv").config();

// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Import configuration
const config = require("./config.json");
const { authenticateToken } = require("./utilities");

// Import models
const User = require("./models/userModel");
const Note = require("./models/noteModel");

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

// Connect to MongoDB
mongoose
  .connect(config.connectionString)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
app.get("/", (req, res) => {
  res.json({ data: "Hello" });
});

//* Create Accout
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full name is required" });
  }
  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }
  const userExist = await User.findOne({ email: email });
  if (userExist) {
    return res.json({
      error: true,
      message: "User already exist",
    });
  }
  const user = new User({
    fullName,
    email,
    password,
  });
  await user.save();
  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });
  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration successful",
  });
});

//* Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const userData = await User.findOne({ email: email });
  if (!userData) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  if (userData.email == email && userData.password == password) {
    const user = { user: userData };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });
    return res.json({
      error: false,
      message: "Login successful",
      email,
      accessToken,
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "Invalid credentials",
    });
  }
});

//* Add Note
app.post("/add-note", authenticateToken, async (req, res) => {
  
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
