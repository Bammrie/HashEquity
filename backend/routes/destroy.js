const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    const user = await User.findById(decoded.id);

    user.unmintedHash += 1; // Each destroy = +1 unminted
    await user.save();

    res.json({ message: 'Object destroyed', unmintedHash: user.unmintedHash });
  } catch (err) {
    res.status(500).json({ message: 'Destroy failed', error: err.message });
  }
});

module.exports = router;
