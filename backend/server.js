const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./prisma/client");
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

const PORT = process.env.PORT || 8080;

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");

    const server = app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );

    const shutdown = async () => {
      await prisma.$disconnect();
      server.close(() => process.exit(0));
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
}

start();
