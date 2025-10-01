const prisma = require("../prisma/client");

const decimalToNumber = (value) => {
  if (!value) return 0;
  if (typeof value === "number") return value;
  return Number(value.toString());
};

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
    const stats = await prisma.objectStat.findMany({
      orderBy: [
        { destroyed: "desc" },
        { objectId: "asc" }
      ]
    });

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

    const user = await prisma.user.findUnique({
      where: { walletAddress: wallet }
    });

    res.json({
      hashBalance: decimalToNumber(user?.hashBalance),
      unmintedHash: decimalToNumber(user?.unmintedHash)
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

    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedWallet }
    });

    const numericReward = Number(reward) || 0;

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: normalizedWallet,
          unmintedHash: numericReward
        }
      });
    } else if (numericReward !== 0) {
      user = await prisma.user.update({
        where: { walletAddress: normalizedWallet },
        data: {
          unmintedHash: {
            increment: numericReward
          }
        }
      });
    }

    const statUpdates = {};
    if (objectName) statUpdates.name = objectName;
    if (objectImage) statUpdates.image = objectImage;

    await prisma.objectStat.upsert({
      where: { objectId },
      update: {
        destroyed: { increment: 1 },
        ...statUpdates
      },
      create: {
        objectId,
        destroyed: 1,
        ...statUpdates
      }
    });

    res.json({
      hashBalance: decimalToNumber(user?.hashBalance),
      unmintedHash: decimalToNumber(user?.unmintedHash)
    });
  } catch (err) {
    console.error("Destroy error:", err);
    res.status(500).json({ error: "Unable to record destroy" });
  }
};
