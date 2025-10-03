const express = require('express');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

const User = require('../models/User');
const { getJwtSecret } = require('../utils/env');
const { normalizeWallet, isAdminWallet } = require('../config/admin');

const router = express.Router();
const LOGIN_MESSAGE = 'Login to HashEquity';

router.post('/wallet-login', async (req, res) => {
  try {
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT secret not configured' });
    }

    const { walletAddress, signature } = req.body || {};

    if (!walletAddress || !signature) {
      return res.status(400).json({ error: 'Missing walletAddress or signature' });
    }

    let recoveredAddress;
    try {
      recoveredAddress = ethers.verifyMessage(LOGIN_MESSAGE, signature);
    } catch (verificationError) {
      console.error('Wallet login verification error:', verificationError);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const normalizedWallet = normalizeWallet(walletAddress);
    const admin = isAdminWallet(normalizedWallet);

    const user = await User.findOneAndUpdate(
      { walletAddress: normalizedWallet },
      {
        $setOnInsert: { walletAddress: normalizedWallet, isAdmin: admin },
        $set: { isAdmin: admin },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const token = jwt.sign({ id: user.id, isAdmin: admin }, jwtSecret, {
      expiresIn: '1d',
    });

    res.json({
      message: 'Wallet login successful',
      token,
      walletAddress: normalizedWallet,
      isAdmin: admin,
    });
  } catch (err) {
    console.error('Wallet login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
