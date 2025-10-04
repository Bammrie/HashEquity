#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

const { connectToDatabase } = require('../config/database');
const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');
const { DAILY_MINT_SETTING_KEY } = require('../services/dailyMint');

const logResult = (message) => {
  console.log(`[reset-economy] ${message}`);
};

const run = async () => {
  try {
    await connectToDatabase();
    logResult('Connected to MongoDB.');

    const updateResult = await User.updateMany(
      {},
      { $set: { hashBalance: 0, unmintedHash: 0, objectsDestroyed: 0 } }
    );

    const modifiedCount =
      typeof updateResult.modifiedCount === 'number'
        ? updateResult.modifiedCount
        : updateResult.nModified || 0;

    logResult(`Reset balances for ${modifiedCount} player(s).`);

    const clearedMintSummary = await SystemSetting.deleteOne({ key: DAILY_MINT_SETTING_KEY });
    if (clearedMintSummary.deletedCount) {
      logResult('Cleared stored daily mint summary.');
    } else {
      logResult('No stored daily mint summary found.');
    }
  } catch (error) {
    console.error('[reset-economy] Failed to reset economy:', error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logResult('MongoDB connection closed.');
    }
  }
};

run().catch((error) => {
  console.error('[reset-economy] Unexpected error:', error);
  process.exitCode = 1;
});
