const express = require("express");

const http = require("http");

const cors = require("cors");

const mongoose = require("mongoose");

const dotenv = require("dotenv");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const { Server } = require("socket.io");

const User = require("./models/User");

const Message = require("./models/Message");

// Config
dotenv.config();

// App
const app = express();

// Middleware
app.use(cors());

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// HTTP Server
const server = http.createServer(app);

// Socket Server
const io = new Server(server, {

  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },

});

// Online Users
let onlineUsers = [];

// Home Route
app.get("/", (req, res) => {

  res.send("Backend Running");

});

// Get Messages
app.get("/messages", async (req, res) => {

  try {

    const messages = await Message.find();

    res.json(messages);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

});

// Register Route
app.post("/register", async (req, res) => {

  try {

    const { username, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {

      return res.status(400).json({
        message: "User already exists",
      });

    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({

      username,

      email,

      password: hashedPassword,

    });

    await user.save();

    res.json({
      message: "User registered successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message,
    });

  }

});

// Login Route
app.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        message: "User not found",
      });

    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        message: "Invalid credentials",
      });

    }

    // Generate JWT Token
    const token = jwt.sign(

      { id: user._id },

      process.env.JWT_SECRET,

      { expiresIn: "7d" }

    );

    res.json({

      token,

      user,

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message,
    });

  }

});

// Socket Connection
io.on("connection", (socket) => {

  console.log("User Connected");

  // Join User
  socket.on("join", (username) => {

    onlineUsers.push({

      id: socket.id,

      username,

    });

    io.emit("online_users", onlineUsers);

    console.log(username + " joined");

  });

  // Send Message
  socket.on("send_message", async (data) => {

  try {

    const newMessage = new Message({

      username: data.username,

      text: data.text || "",

      image: data.image || "",

    });

    await newMessage.save();

    io.emit("receive_message", data);

  } catch (error) {

    console.log(error);

  }

});

  // Typing Indicator
  socket.on("typing", (data) => {

    socket.broadcast.emit(
      "show_typing",
      data
    );

  });

  // Disconnect
  socket.on("disconnect", () => {

    onlineUsers = onlineUsers.filter(
      (user) => user.id !== socket.id
    );

    io.emit("online_users", onlineUsers);

    console.log("User Disconnected");

  });

});

// Server Listen
server.listen(process.env.PORT, () => {

  console.log(
    `Server running on port ${process.env.PORT}`
  );

});