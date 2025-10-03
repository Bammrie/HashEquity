const jwt = require('jsonwebtoken');

const { getJwtSecret } = require('../utils/env');

const { getJwtSecret } = require("../config/env");

function authMiddleware(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    return res.status(500).json({ error: 'JWT secret not configured' });
  }

  try {
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
}

module.exports = authMiddleware;
