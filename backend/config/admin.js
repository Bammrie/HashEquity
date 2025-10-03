const DEFAULT_ADMIN_WALLETS = [
  "0xCd0Bc675455ee5Fa8739F5c377fe4Ec1437Bc618"
];

const normalizeWallet = (wallet = "") => wallet.trim().toLowerCase();

const loadAdminWallets = () => {
  const fromEnv = process.env.ADMIN_WALLETS;
  if (!fromEnv) {
    return DEFAULT_ADMIN_WALLETS.map(normalizeWallet);
  }

  const parsed = fromEnv
    .split(",")
    .map(normalizeWallet)
    .filter(Boolean);

  if (!parsed.length) {
    return DEFAULT_ADMIN_WALLETS.map(normalizeWallet);
  }

  return Array.from(new Set(parsed));
};

const ADMIN_WALLETS = loadAdminWallets();

const isAdminWallet = (wallet) => {
  if (!wallet) {
    return false;
  }

  return ADMIN_WALLETS.includes(normalizeWallet(wallet));
};

module.exports = {
  ADMIN_WALLETS,
  isAdminWallet,
  normalizeWallet,
};

