const Stats = require("../models/Stats");
const User = require("../models/User");
const { normalizeWallet } = require("../config/admin");
const { toNumber, toFixedAmount } = require("../utils/number");

const humanizeObjectId = (objectId = "") =>
  objectId
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

const serializeInventory = (inventory = []) => {
  if (!Array.isArray(inventory)) {
    return [];
  }

  return inventory
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const quantity = Math.max(0, Math.floor(toNumber(item.quantity)));
      if (!item.itemId || quantity <= 0) {
        return null;
      }

      const description = typeof item.description === "string" ? item.description : "";
      const lastUpdatedAt = item.lastUpdatedAt instanceof Date
        ? item.lastUpdatedAt.toISOString()
        : item.lastUpdatedAt || new Date().toISOString();

      return {
        itemId: item.itemId,
        name: item.name || item.itemId,
        image: item.image || "",
        quantity,
        description,
        lastUpdatedAt,
      };
    })
    .filter(Boolean);
};

const normalizeDestroyReward = (reward) => {
  if (reward === undefined || reward === null) {
    return { type: "none" };
  }

  if (typeof reward === "number" || typeof reward === "string") {
    const value = toNumber(reward);
    return { type: "unminted_hash", value };
  }

  if (typeof reward === "object") {
    const { type } = reward;
    if (type === "unminted_hash") {
      return { type, value: toNumber(reward.value) };
    }

    if (type === "item") {
      const itemId = typeof reward.itemId === "string" ? reward.itemId.trim() : "";
      if (!itemId) {
        return { type: "none" };
      }

      const name =
        typeof reward.name === "string" && reward.name.trim()
          ? reward.name.trim()
          : itemId;
      const image = typeof reward.image === "string" ? reward.image : "";
      const description =
        typeof reward.description === "string" && reward.description.trim()
          ? reward.description.trim()
          : "";

      return {
        type: "item",
        itemId,
        name,
        image,
        description,
      };
    }
  }

  return { type: "none" };
};

exports.getStats = async (_req, res) => {
  try {
    const stats = await Stats.find().sort({ destroyed: -1, objectId: 1 });

    const formatted = stats.map((stat) => ({
      objectId: stat.objectId,
      name: stat.name || humanizeObjectId(stat.objectId),
      image: stat.image || "",
      destroyed: toNumber(stat.destroyed)
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

    const user = await User.findOneAndUpdate(
      { walletAddress: wallet },
      { $setOnInsert: { walletAddress: wallet } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      hashBalance: toNumber(user?.hashBalance),
      unmintedHash: toNumber(user?.unmintedHash),
      objectsDestroyed: toNumber(user?.objectsDestroyed),
      inventory: serializeInventory(user?.inventory)
    });
  } catch (err) {
    console.error("Balance fetch error:", err);
    res.status(500).json({ error: "Unable to load balances" });
  }
};

exports.destroyObject = async (req, res) => {
  try {
    const { wallet, objectId, reward: rewardPayload = 0, objectName, objectImage } = req.body;

    if (!wallet || !objectId) {
      return res.status(400).json({ error: "Missing wallet or objectId" });
    }

    const normalizedWallet = normalizeWallet(wallet);

    if (!normalizedWallet) {
      return res.status(400).json({ error: "Missing wallet" });
    }

    const rewardDetails = normalizeDestroyReward(rewardPayload);

    const userUpdate = {
      $setOnInsert: { walletAddress: normalizedWallet },
      $inc: { objectsDestroyed: 1 }
    };

    if (rewardDetails.type === "unminted_hash" && rewardDetails.value !== 0) {
      userUpdate.$inc.unmintedHash = rewardDetails.value;
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: normalizedWallet },
      userUpdate,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (rewardDetails.type === "item" && user) {
      const now = new Date();
      const existing = user.inventory.find((entry) => entry.itemId === rewardDetails.itemId);

      if (existing) {
        const currentQuantity = Math.max(0, Math.floor(toNumber(existing.quantity)));
        existing.quantity = currentQuantity + 1;
        existing.lastUpdatedAt = now;
        existing.name = rewardDetails.name;
        if (rewardDetails.image) {
          existing.image = rewardDetails.image;
        }
        if (rewardDetails.description) {
          existing.description = rewardDetails.description;
        }
      } else {
        user.inventory.push({
          itemId: rewardDetails.itemId,
          name: rewardDetails.name,
          image: rewardDetails.image,
          quantity: 1,
          description: rewardDetails.description,
          lastUpdatedAt: now,
        });
      }

      user.markModified("inventory");
      await user.save();
    }

    const statUpdates = {};
    if (objectName) statUpdates.name = objectName;
    if (objectImage) statUpdates.image = objectImage;

    const statsUpdate = {
      $inc: { destroyed: 1 },
      $setOnInsert: { objectId }
    };

    if (Object.keys(statUpdates).length) {
      statsUpdate.$set = statUpdates;
    }

    await Stats.findOneAndUpdate({ objectId }, statsUpdate, {
      new: true,
      upsert: true
    });

    res.json({
      hashBalance: toNumber(user?.hashBalance),
      unmintedHash: toNumber(user?.unmintedHash),
      objectsDestroyed: toNumber(user?.objectsDestroyed),
      inventory: serializeInventory(user?.inventory)
    });
  } catch (err) {
    console.error("Destroy error:", err);
    res.status(500).json({ error: "Unable to record destroy" });
  }
};

exports.tradeInForHash = async (req, res) => {
  try {
    const { wallet, amount } = req.body || {};
    const normalizedWallet = normalizeWallet(wallet);

    if (!normalizedWallet) {
      return res.status(400).json({ error: "Missing wallet" });
    }

    const tradeAmount = toFixedAmount(amount);
    if (tradeAmount <= 0) {
      return res.status(400).json({ error: "Trade amount must be greater than zero" });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: normalizedWallet },
      { $setOnInsert: { walletAddress: normalizedWallet } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const currentUnminted = toNumber(user?.unmintedHash);

    if (tradeAmount > currentUnminted) {
      return res.status(400).json({ error: "Insufficient unminted HASH" });
    }

    const mintedAmount = toFixedAmount(tradeAmount * 0.5);
    const updatedUnminted = toFixedAmount(currentUnminted - tradeAmount);
    const updatedHashBalance = toFixedAmount(toNumber(user.hashBalance) + mintedAmount);

    user.unmintedHash = updatedUnminted;
    user.hashBalance = updatedHashBalance;

    await user.save();

    res.json({
      hashBalance: updatedHashBalance,
      unmintedHash: updatedUnminted,
      tradedAmount: tradeAmount,
      mintedAmount,
      objectsDestroyed: toNumber(user?.objectsDestroyed),
      inventory: serializeInventory(user?.inventory)
    });
  } catch (err) {
    console.error("Trade-in error:", err);
    res.status(500).json({ error: "Unable to trade unminted HASH" });
  }
};

exports.getLeaderboard = async (_req, res) => {
  try {
    const users = await User.find()
      .select(["walletAddress", "objectsDestroyed"])
      .sort({ objectsDestroyed: -1, walletAddress: 1 })
      .limit(LEADERBOARD_LIMIT)
      .lean();

    const leaderboard = users.map((user) => ({
      walletAddress: user.walletAddress,
      objectsDestroyed: toNumber(user.objectsDestroyed)
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    res.status(500).json({ error: "Unable to load leaderboard" });
  }
};
