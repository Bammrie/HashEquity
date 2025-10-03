const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const { connectToDatabase } = require('./config/database');
const gameRoutes = require('./routes/gameRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { initializeDailyMint } = require('./services/dailyMint');

const app = express();
app.use(express.json());

const corsOrigins = process.env.CORS_ALLOWED_ORIGINS || process.env.SOCKET_CORS_ORIGIN;
const parseCorsOrigins = () => {
  if (!corsOrigins) {
    return null;
  }

  const explicitOrigins = corsOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const localOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'];

  const deduped = new Set([...explicitOrigins, ...localOrigins]);
  return Array.from(deduped);
};

const resolvedOrigins = parseCorsOrigins();

const corsOptions = resolvedOrigins
  ? {
      origin: resolvedOrigins,
      credentials: true,
    }
  : {
      origin: true,
      credentials: true,
    };

app.use(cors(corsOptions));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 8080;

let server;

const startServer = async () => {
  try {
    await connectToDatabase();
    console.log('✅ MongoDB connected');

    await initializeDailyMint();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection error:', error.message || error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Closing server.`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  process.exit(0);
};

startServer();

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    shutdown(signal).catch((error) => {
      console.error('Error during shutdown:', error);
      process.exit(1);
    });
  });
});

module.exports = app;
