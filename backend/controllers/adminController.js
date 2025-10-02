const User = require("../models/User");
const { ADMIN_WALLETS } = require("../config/admin");

const toNumber = (value) => {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const serializeUser = (user) => ({
  walletAddress: user.walletAddress,
  hashBalance: toNumber(user.hashBalance),
  unmintedHash: toNumber(user.unmintedHash),
  isAdmin: Boolean(user.isAdmin),
  updatedAt: user.updatedAt,
  createdAt: user.createdAt,
});

exports.getOverview = async (_req, res) => {
  try {
    const [totals] = await User.aggregate([
      {
        $group: {
          _id: null,
          hashBalanceTotal: { $sum: "$hashBalance" },
          unmintedHashTotal: { $sum: "$unmintedHash" },
        },
      },
    ]);

    const totalPlayers = await User.countDocuments();

    const topUsers = await User.find()
      .sort({ unmintedHash: -1, hashBalance: -1 })
      .limit(10)
      .lean();

    res.json({
      summary: {
        totalPlayers,
        hashBalanceTotal: toNumber(totals?.hashBalanceTotal),
        unmintedHashTotal: toNumber(totals?.unmintedHashTotal),
        adminWallets: ADMIN_WALLETS,
        generatedAt: new Date().toISOString(),
      },
      topUsers: topUsers.map(serializeUser),
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ error: "Unable to load admin overview" });
  }
};

