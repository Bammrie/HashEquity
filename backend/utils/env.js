const readEnv = (key) => {
  const value = process.env[key];

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const getJwtSecret = () => readEnv('JWT_SECRET');

module.exports = {
  readEnv,
  getJwtSecret,
};
