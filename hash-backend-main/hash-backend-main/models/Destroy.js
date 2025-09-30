const mongoose = require("mongoose");

const destroySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  objectId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Destroy", destroySchema);
