const mongoose = require("mongoose");

const objectLogSchema = new mongoose.Schema({
  objectId: { type: Number, required: true },
  event: { type: String, enum: ["spawn", "destroy"], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ObjectLog", objectLogSchema);
