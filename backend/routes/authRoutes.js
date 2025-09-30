const express = require("express");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const User = require("../models/User");

const router = express.Router();

router.post("/wallet-login", async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({ error: "Missing walletAddress or signature" });
    }

    const message = "Login to HashEquity";

    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const normalizedWallet = walletAddress.trim().toLowerCase();

    let user = await User.findOne({ walletAddress: normalizedWallet });
    if (!user) {
      user = await User.create({ walletAddress: normalizedWallet });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({
      message: "Wallet login successful",
      token,
      walletAddress: normalizedWallet
    });
  } catch (err) {
    console.error("Wallet login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
