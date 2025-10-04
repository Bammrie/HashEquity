const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');
const { toNumber, toFixedAmount } = require('../utils/number');

const DAILY_MINT_SETTING_KEY = 'economy.dailyMint';

let scheduledTimeout = null;
let nextRunAt = null;

const startOfUtcDay = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const computeNextRunAt = (from = new Date()) => {
  const next = startOfUtcDay(from);
  if (next <= from) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
};

const loadLastSummary = async () => {
  const setting = await SystemSetting.findOne({ key: DAILY_MINT_SETTING_KEY }).lean();
  if (!setting || typeof setting.value !== 'object' || setting.value === null) {
    return null;
  }
  return setting.value;
};

const persistSummary = async (summary) => {
  await SystemSetting.findOneAndUpdate(
    { key: DAILY_MINT_SETTING_KEY },
    {
      $set: {
        value: summary,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

const executeDailyMint = async (trigger = 'scheduled') => {
  const startedAt = new Date();

  const users = await User.find({ unmintedHash: { $gt: 0 } })
    .select(['hashBalance', 'unmintedHash'])
    .lean();

  let mintedGross = 0;
  let distributedToPlayers = 0;
  let vaultTaxTotal = 0;

  const operations = [];

  for (const user of users) {
    const unminted = toFixedAmount(toNumber(user.unmintedHash));
    if (unminted <= 0) {
      continue;
    }

    const mintedAmount = toFixedAmount(unminted * 0.8);
    const vaultTax = toFixedAmount(unminted - mintedAmount);
    const updatedHashBalance = toFixedAmount(toNumber(user.hashBalance) + mintedAmount);

    mintedGross = toFixedAmount(mintedGross + unminted);
    distributedToPlayers = toFixedAmount(distributedToPlayers + mintedAmount);
    vaultTaxTotal = toFixedAmount(vaultTaxTotal + vaultTax);

    operations.push({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: {
            hashBalance: updatedHashBalance,
            unmintedHash: 0,
          },
        },
      },
    });
  }

  if (operations.length) {
    await User.bulkWrite(operations);
  }

  const completedAt = new Date();
  const summary = {
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    trigger,
    walletsProcessed: operations.length,
    mintedGross,
    distributedToPlayers,
    vaultTaxTotal,
  };

  await persistSummary(summary);

  const mintedLog = mintedGross.toFixed(10);
  const walletsLog = operations.length;
  console.log(
    `[DailyMint] ${trigger} run processed ${walletsLog} wallet(s) and minted ${mintedLog} HASH.`
  );

  return summary;
};

const scheduleNextRun = () => {
  if (scheduledTimeout) {
    clearTimeout(scheduledTimeout);
    scheduledTimeout = null;
  }

  const now = new Date();
  nextRunAt = computeNextRunAt(now);
  const delay = Math.max(0, nextRunAt.getTime() - now.getTime());

  scheduledTimeout = setTimeout(async () => {
    scheduledTimeout = null;
    try {
      await executeDailyMint('scheduled');
    } catch (error) {
      console.error('[DailyMint] Scheduled mint failed:', error);
    } finally {
      scheduleNextRun();
    }
  }, delay);

  if (typeof scheduledTimeout.unref === 'function') {
    scheduledTimeout.unref();
  }

  console.log(`[DailyMint] Next run scheduled for ${nextRunAt.toISOString()}`);
  return nextRunAt;
};

const maybeCatchUp = async () => {
  const lastSummary = await loadLastSummary();
  if (!lastSummary) {
    return executeDailyMint('initial');
  }

  const lastCompletedAt = lastSummary.completedAt ? new Date(lastSummary.completedAt) : null;
  if (!lastCompletedAt || Number.isNaN(lastCompletedAt.getTime())) {
    return executeDailyMint('recovery');
  }

  const now = new Date();
  const todayStart = startOfUtcDay(now);

  if (lastCompletedAt < todayStart) {
    return executeDailyMint('catch-up');
  }

  return lastSummary;
};

const initializeDailyMint = async () => {
  let lastSummary;
  try {
    lastSummary = await maybeCatchUp();
  } catch (error) {
    console.error('[DailyMint] Failed to complete catch-up run:', error);
    lastSummary = await loadLastSummary();
  }

  const scheduledFor = scheduleNextRun();

  return {
    lastSummary,
    nextRunAt: scheduledFor,
  };
};

const getNextRunAt = () => nextRunAt;

module.exports = {
  initializeDailyMint,
  executeDailyMint,
  getNextRunAt,
  DAILY_MINT_SETTING_KEY,
};
