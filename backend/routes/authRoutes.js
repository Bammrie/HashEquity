const express = require("express");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");

const User = require("../models/User");
const { isAdminWallet, normalizeWallet } = require("../config/admin");

const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

router.post("/wallet-login", async (req, res) => {
  try {
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({ error: "Missing walletAddress or signature" });
    }

    const message = "Login to HashEquity";

    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const normalizedWallet = normalizeWallet(walletAddress);
    const adminStatus = isAdminWallet(normalizedWallet);

    const user = await User.findOneAndUpdate(
      { walletAddress: normalizedWallet },
      {
        $setOnInsert: { walletAddress: normalizedWallet },
        $set: { isAdmin: adminStatus },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({
      message: "Wallet login successful",
      token,
      walletAddress: normalizedWallet,
      isAdmin: user.isAdmin
    });
  } catch (err) {
    console.error("Wallet login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
