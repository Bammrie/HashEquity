const readEnv = (key) => {
  const value = process.env[key];
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  return trimmed;
};

const getJwtSecret = () => readEnv('JWT_SECRET');

module.exports = {
  getJwtSecret,
};
