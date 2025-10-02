const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

const PORT = process.env.PORT || 8080;

const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;

if (!mongoUri) {
  console.error(
    "❌ MongoDB connection string missing. Set MONGO_URI in Railway (or map DATABASE_URL to the same Mongo URI)."
  );
  process.exit(1);
}

if (/^postgres(?:ql)?:\/\//i.test(mongoUri)) {
  console.error(
    "❌ Detected a Postgres connection string, but the backend now uses MongoDB. Please provide a Mongo URI via MONGO_URI."
  );
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
