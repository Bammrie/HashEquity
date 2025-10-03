const mongoose = require('mongoose');

const POSTGRES_PREFIX = /^postgres(?:ql)?:\/\//i;
const MONGO_PREFIX = /^mongodb(\+srv)?:\/\//i;

const resolveMongoUri = () => {
  const { MONGO_URI, MONGODB_URI, MONGO_URL, MONGODB_URL, DATABASE_URL } = process.env;

  const candidates = [MONGO_URI, MONGODB_URI, MONGO_URL, MONGODB_URL, DATABASE_URL];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return '';
};

const resolveMongoDbName = () => {
  const { MONGO_DB_NAME } = process.env;

  if (typeof MONGO_DB_NAME !== 'string') {
    return undefined;
  }

  const trimmed = MONGO_DB_NAME.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed;
};

const assertMongoUri = (uri) => {
  if (!uri) {
    throw new Error(
      'MongoDB connection string missing. Set MONGO_URI (or MONGO_URL/MONGODB_URI) in Railway, or map DATABASE_URL to the Mongo instance.'
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

  const dbName = resolveMongoDbName();

  mongoose.set('strictQuery', false);
  await mongoose.connect(mongoUri, dbName ? { dbName } : undefined);

  return mongoose.connection;
};

module.exports = {
  connectToDatabase,
};
