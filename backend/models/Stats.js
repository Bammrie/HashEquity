const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema(
  {
    objectId: { type: String, required: true, unique: true },
    name: { type: String },
    image: { type: String },
    destroyed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stats", statsSchema);
