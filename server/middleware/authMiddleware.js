const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ─── Protect route: requires valid JWT ────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized — no token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ error: "User no longer exists." });
    }
    if (!req.user.isActive) {
      return res.status(403).json({ error: "Account has been deactivated." });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
};

// ─── Admin-only gate ──────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Access denied — admin only." });
};

module.exports = { protect, adminOnly };
