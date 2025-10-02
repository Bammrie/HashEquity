const mongoose = require('mongoose');

const POSTGRES_PREFIX = /^postgres(?:ql)?:\/\//i;
const MONGO_PREFIX = /^mongodb(\+srv)?:\/\//i;

const resolveMongoUri = () => {
  const { MONGO_URI, DATABASE_URL } = process.env;

  if (MONGO_URI && MONGO_URI.trim()) {
    return MONGO_URI.trim();
  }

  if (DATABASE_URL && DATABASE_URL.trim()) {
    return DATABASE_URL.trim();
  }

  return '';
};

const assertMongoUri = (uri) => {
  if (!uri) {
    throw new Error(
      'MongoDB connection string missing. Set MONGO_URI in Railway (or map DATABASE_URL to the same Mongo URI).'
    );
  }

  if (POSTGRES_PREFIX.test(uri)) {
    throw new Error(
      'Detected a Postgres connection string, but the backend now uses MongoDB. Provide a Mongo URI via MONGO_URI.'
    );
  }

  if (!MONGO_PREFIX.test(uri)) {
    throw new Error('Connection string must begin with mongodb:// or mongodb+srv://');
  }
};

const connectToDatabase = async () => {
  const mongoUri = resolveMongoUri();
  assertMongoUri(mongoUri);

  mongoose.set('strictQuery', false);
  await mongoose.connect(mongoUri);

  return mongoose.connection;
};

module.exports = {
  connectToDatabase,
};
