const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    quantity: { type: Number, default: 1, min: 0 },
    description: { type: String, default: '' },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    unmintedHash: { type: Number, default: 0 },
    hashBalance: { type: Number, default: 0 },
    objectsDestroyed: { type: Number, default: 0 },
    inventory: { type: [inventoryItemSchema], default: [] },
    isAdmin: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
