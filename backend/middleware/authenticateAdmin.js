const jwt = require("jsonwebtoken");

const User = require("../models/User");

const { getJwtSecret } = require("../config/env");

const authenticateAdmin = async (req, res, next) => {
  try {
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const token = authHeader.slice("Bearer ".length).trim();

    const payload = jwt.verify(token, jwtSecret);
    if (!payload?.id) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    return res.status(500).json({ error: "Unable to authenticate admin" });
  }
};

module.exports = { authenticateAdmin };

