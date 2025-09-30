# HashEquity Frontend

This package contains the React + Vite implementation of the HashEquity gameplay console as defined in `AGENTS.md`. It focuses on the ten-object core loop, wallet connectivity, vault telemetry, and configurable economy controls.

## Stack

- [React 18](https://react.dev/) rendered through [Vite](https://vitejs.dev/)
- [Zustand](https://github.com/pmndrs/zustand) for deterministic client state
- [RainbowKit](https://www.rainbowkit.com/) and [wagmi](https://wagmi.sh/) for wallet connectivity
- [TanStack Query](https://tanstack.com/query/latest) for data orchestration (ready for backend integration)
- TypeScript for type-safety

## Project Structure

```
src/
├─ App.tsx                # Layout wiring the game board, economy, and telemetry panels
├─ components/            # Modular UI components for the loop, mini-games, telemetry, and wallet
├─ config/                # Environment variable helpers and chain configuration
├─ state/gameStore.ts     # Deterministic spawn table, vault logic, and mint/trade mechanics
└─ styles/global.css      # Shared styling tokens
```

The spawn table matches the specification (sum = 1.0) and feeds deterministic objects into the arena to avoid client-side randomness that affects payouts. Each of the ten objects is rendered with its corresponding sprite from `/images/ObjectX-Y.png`, floats through a gamified background, and carries the canonical ID derived from the filename digits. Mini-game rewards follow a fixed payout sequence to respect the "no random client RNG" rule.

## Getting Started

```bash
pnpm install
pnpm dev
```

By default the app connects to Polygon (chain ID 137). Configure the environment via a `.env` file:

```
VITE_CHAIN_ID=137
VITE_RPC_URL=https://polygon-rpc.com
VITE_HASH_TOKEN_ADDRESS=0x...
VITE_NFT_CONTRACT_ADDRESS=0x...
VITE_BACKEND_URL=https://api.hashequity.com
VITE_ADMIN_PASSCODE=<frontend gate for admin vault controls>
```

## Available Scripts

- `pnpm dev` – start the local development server
- `pnpm build` – type-check and build the production bundle
- `pnpm preview` – preview the built bundle

## Next Steps

- Wire the `tradeInForHash`, `runScheduledMint`, and spawn telemetry to backend endpoints once available (admin-only minting runs remain server-authoritative)
- Implement admin spawn table editor using the exported `spawnTableSpec`
- Replace placeholder WalletConnect project ID with a production key before launch
