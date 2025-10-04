const cron = require("node-cron");
const mongoose = require("mongoose");

const User = require("../models/User");
const { mintHashTokens } = require("../services/blockchain");

/**
 * Aggregator: sum unmintedHash over all users.
 */
async function getTotalUnminted() {
  const result = await User.aggregate([
    { $group: { _id: null, total: { $sum: "$unmintedHash" } } }
  ]);
  if (result.length === 0) return 0;
  return result[0].total;
}

/**
 * After minting on-chain, update DB: distribute 80% to players, 20% to vault
 * and reset unmintedHash to 0.
 */
async function settleBalances() {
  const users = await User.find({ unmintedHash: { $gt: 0 } });

  for (const user of users) {
    const unminted = user.unmintedHash;
    const mintedForUser = unminted * 0.8;
    // vault share is unminted * 0.2, but that can be tracked separately
    user.hashBalance += mintedForUser;
    user.unmintedHash = 0;
    await user.save();
  }
  console.log(`Settled balances for ${users.length} users.`);
}

/**
 * Runs once daily at midnight UTC
 */
function scheduleDailyMint(cronExpr = process.env.MINT_CRON_SCHEDULE || "0 0 * * *") {
  console.log("Scheduling daily mint cron with expression:", cronExpr);

  cron.schedule(cronExpr, async () => {
    console.log("Running daily mint job...");
    try {
      const totalUnminted = await getTotalUnminted();
      console.log("Total unminted HASH in DB:", totalUnminted);

      if (totalUnminted <= 0) {
        console.log("Nothing to mint today.");
        return;
      }

      await mintHashTokens(totalUnminted);
      await settleBalances();

      console.log("Daily mint completed successfully.");
    } catch (err) {
      console.error("Error during daily mint:", err);
    }
  });
}

module.exports = {
  scheduleDailyMint,
};
