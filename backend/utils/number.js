const DEFAULT_DECIMALS = 10;

const toNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const toFixedAmount = (value, decimals = DEFAULT_DECIMALS) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  const factor = 10 ** decimals;
  return Math.round(numeric * factor) / factor;
};

module.exports = {
  toNumber,
  toFixedAmount,
  DEFAULT_DECIMALS,
};
