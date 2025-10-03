const DEFAULT_ADMIN_WALLETS = [
  '0xCd0Bc675455ee5Fa8739F5c377fe4Ec1437Bc618',
];

const normalizeWallet = (wallet: string) => wallet.trim().toLowerCase();

const parseAdminWallets = () => {
  const raw = import.meta.env.VITE_ADMIN_WALLETS as string | undefined;
  if (!raw) {
    return DEFAULT_ADMIN_WALLETS.map(normalizeWallet);
  }

  const wallets = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map(normalizeWallet);

  if (!wallets.length) {
    return DEFAULT_ADMIN_WALLETS.map(normalizeWallet);
  }

  return Array.from(new Set(wallets));
};

const adminWallets = parseAdminWallets();

export const adminConfig = {
  wallets: adminWallets,
};

export const isAdminWallet = (wallet?: string | null) => {
  if (!wallet) {
    return false;
  }

  return adminWallets.includes(normalizeWallet(wallet));
};

