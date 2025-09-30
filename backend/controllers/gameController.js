const Stats = require("../models/Stats");
const User = require("../models/User");

const normalizeWallet = (wallet = "") => wallet.trim().toLowerCase();

const humanizeObjectId = (objectId = "") =>
  objectId
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

exports.getStats = async (_req, res) => {
  try {
    const stats = await Stats.find().sort({ destroyed: -1, objectId: 1 });

    const formatted = stats.map((stat) => ({
      objectId: stat.objectId,
      name: stat.name || humanizeObjectId(stat.objectId),
      image: stat.image || "",
      destroyed: stat.destroyed || 0
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ error: "Unable to load game stats" });
  }
};

exports.getBalances = async (req, res) => {
  try {
    const wallet = normalizeWallet(req.query.wallet);
    if (!wallet) {
      return res.status(400).json({ error: "Missing wallet query parameter" });
    }

    const user = await User.findOne({ walletAddress: wallet });

    res.json({
      hashBalance: user?.hashBalance || 0,
      unmintedHash: user?.unmintedHash || 0
    });
  } catch (err) {
    console.error("Balance fetch error:", err);
    res.status(500).json({ error: "Unable to load balances" });
  }
};

exports.destroyObject = async (req, res) => {
  try {
    const { wallet, objectId, reward = 0, objectName, objectImage } = req.body;

    if (!wallet || !objectId) {
      return res.status(400).json({ error: "Missing wallet or objectId" });
    }

    const normalizedWallet = normalizeWallet(wallet);

    let user = await User.findOne({ walletAddress: normalizedWallet });
    if (!user) {
      user = await User.create({ walletAddress: normalizedWallet });
    }

    const numericReward = Number(reward) || 0;
    if (numericReward !== 0) {
      user.unmintedHash += numericReward;
      await user.save();
    }

    const update = {
      $inc: { destroyed: 1 },
      $setOnInsert: { objectId }
    };

    if (objectName || objectImage) {
      update.$set = {};
      if (objectName) update.$set.name = objectName;
      if (objectImage) update.$set.image = objectImage;
    }

    await Stats.findOneAndUpdate({ objectId }, update, {
      new: true,
      upsert: true
    });

    res.json({
      hashBalance: user.hashBalance,
      unmintedHash: user.unmintedHash
    });
  } catch (err) {
    console.error("Destroy error:", err);
    res.status(500).json({ error: "Unable to record destroy" });
  }
};
