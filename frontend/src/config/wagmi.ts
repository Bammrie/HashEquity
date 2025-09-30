import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { appEnv } from './env';

const rpcUrl = appEnv.rpcUrl || polygon.rpcUrls.default.http[0];

export const wagmiConfig = getDefaultConfig({
  appName: 'HashEquity',
  projectId: 'HASH-EQUITY-DEMO',
  chains: [polygon],
  transports: {
    [polygon.id]: http(rpcUrl),
  },
});
