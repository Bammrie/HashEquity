const envSources = {
  backendUrl: ['VITE_BACKEND_URL', 'VITE_API_BASE_URL'] as const,
  chainId: ['VITE_CHAIN_ID'] as const,
  rpcUrl: ['VITE_RPC_URL'] as const,
  hashTokenAddress: ['VITE_HASH_TOKEN_ADDRESS'] as const,
  nftContractAddress: ['VITE_NFT_CONTRACT_ADDRESS'] as const,
} as const;

type EnvKeys = keyof typeof envSources;

type EnvConfig = {
  [K in EnvKeys]: string;
};

const env = import.meta.env as Record<string, string | undefined>;

const readEnv = (keys: readonly string[]): string => {
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    const value = env[key];

    if (value) {
      if (index > 0) {
        console.warn(
          `Environment variable ${key} is deprecated; please use ${keys[0]} instead.`
        );
      }
      return value;
    }
  }

  console.warn(`Missing environment variable: ${keys[0]}`);
  return '';
};

const config = {} as Record<EnvKeys, string>;

(Object.keys(envSources) as EnvKeys[]).forEach((name) => {
  config[name] = readEnv(envSources[name]);
});

export const appEnv: EnvConfig = {
  backendUrl: config.backendUrl,
  chainId: config.chainId || '137',
  rpcUrl: config.rpcUrl,
  hashTokenAddress: config.hashTokenAddress,
  nftContractAddress: config.nftContractAddress,
};
