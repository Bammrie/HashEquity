const requiredEnvVars = {
  backendUrl: 'VITE_BACKEND_URL',
  chainId: 'VITE_CHAIN_ID',
  rpcUrl: 'VITE_RPC_URL',
  hashTokenAddress: 'VITE_HASH_TOKEN_ADDRESS',
  nftContractAddress: 'VITE_NFT_CONTRACT_ADDRESS',
} as const;

type EnvKeys = keyof typeof requiredEnvVars;

type EnvConfig = {
  [K in EnvKeys]: string;
};

const readEnv = (key: string): string => {
  const value = import.meta.env[key as keyof ImportMetaEnv];
  if (!value) {
    console.warn(`Missing environment variable: ${key}`);
    return '';
  }
  return value;
};

const config = Object.entries(requiredEnvVars).reduce((acc, [name, key]) => {
  const value = readEnv(key);
  return { ...acc, [name]: value };
}, {} as Record<string, string>);

export const appEnv: EnvConfig = {
  backendUrl: config.backendUrl,
  chainId: config.chainId || '137',
  rpcUrl: config.rpcUrl,
  hashTokenAddress: config.hashTokenAddress,
  nftContractAddress: config.nftContractAddress,
};
