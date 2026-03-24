const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helper: sign JWT ─────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
// ─── @access Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(". ") });
    }
    console.error("Register error:", error);
    return res.status(500).json({ error: "Server error during registration." });
  }
};

// ─── @route  POST /api/auth/login ─────────────────────────────────────────────
// ─── @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account has been deactivated." });
    }

    const token = signToken(user._id);
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error during login." });
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// ─── @access Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found." });

    return res.status(200).json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ error: "Server error." });
  }
};

module.exports = { register, login, getMe };
