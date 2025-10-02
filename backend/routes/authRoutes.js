const express = require("express");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");


const prisma = require("../prisma/client");

const JWT_SECRET = process.env.JWT_SECRET;

const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

router.post("/wallet-login", async (req, res) => {
  try {
    if (!JWT_SECRET) {
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

    const normalizedWallet = walletAddress.trim().toLowerCase();

    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedWallet }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: normalizedWallet }
      });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
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
