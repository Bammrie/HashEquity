.md

## Project: HashEquity.com
A Web3 game and token ecosystem powered by the HASH token on the Polygon (MATIC) network.

---

## 🚀 Overview

**HashEquity** is a real-time, interactive Web3 game where users earn HASH tokens by destroying objects on screen. The game rewards players with *Unminted HASH*, which can be minted daily or traded for lower returns. The site includes a dynamic token economy, NFT reward system, a smart contract-driven admin vault (HashVault), and live global stats for transparency and competition. Operations tooling lives off the main site—players never see admin dashboards in production.

---

## 🎮 Core Game Loop

- Players connect their Web3 wallets to log in.
- Game shows **10 active clickable objects** at all times.
- Clicking an object:
  - Removes it
  - Rewards Unminted HASH (based on the object's type)
  - Spawns a new object
- Some objects may trigger:
  - Mini-games (slot machine, plinko, etc.)
  - Random bonuses or penalties
- Object logic is modular and expandable.

---

## 🪙 Tokenomics: HASH

- **Token Chain**: Polygon (MATIC)
- **Ticker**: HASH
- **Circulating Supply at Launch**: 0
- **Minting Authority**: One admin address (HashVault)
- **Transaction Fees**: None on internal balances, gas fees apply on withdrawals

### HASH Balance Types

| Balance Type     | Description                                         |
|------------------|-----------------------------------------------------|
| `Unminted HASH`  | Earned by gameplay. Can be minted daily or traded. |
| `HASH`           | Actual on-chain token. Withdrawable.                |

### Minting Rules

- Every day at **00:00 UTC**, a backend service:
  - Sums all users' `Unminted HASH`
  - Mints that total supply to the **HashVault address**
  - Distributes 80% to users’ `HASH` balances
  - Sends 20% to the HashVault's balance as a tax
  - Resets all users' `Unminted HASH` to 0

### Trade Feature

- Users can trade their `Unminted HASH` for 50% of its value in `HASH`
- Tokens come from the HashVault's `HASH` balance
- Traded Unminted HASH gets added to the Vault's unminted balance

---

## 🔐 Operations & Access Control

Admin wallet verification continues to exist for backend services and separate ops tools, but the production player-facing site must not surface any admin dashboards or controls.

## 🗄️ Database & Persistence

- **Database**: MongoDB Atlas
- **Connection**: Use `MONGO_URI` and enforce `dbName` via `MONGO_DB_NAME` environment variable.
- **ORM**: Mongoose (Node.js)

### Schemas

**User**
- `walletAddress` (string, unique, required)
- `unmintedHash` (number, default 0)
- `hashBalance` (number, default 0)
- `isAdmin` (boolean, default false)
- `createdAt` / `updatedAt` (timestamps)

**Stats**
- `objectId` (string, required)
- `name` (string, optional)
- `image` (string, optional)
- `destroyed` (number, default 0)
- `createdAt` / `updatedAt` (timestamps)

### Persistence Rules
- When a wallet connects, backend **upserts** a `User` document keyed by `walletAddress`.
- Gameplay events increment `unmintedHash` in the `User` record.
- Daily mint process:
  - Reads all `unmintedHash`
  - Credits `hashBalance` and Vault according to tokenomics
  - Resets `unmintedHash` to 0
- Trade-ins update both `hashBalance` and Vault records.

### Debugging & Error Handling
- Backend is permitted to:
  - Add `console.error` or structured logging for all DB operations
  - Fail gracefully if MongoDB is unavailable
  - Insert test documents during deployment for verification
 
 ## 🔗 On-Chain Token Integration: HASH

### Purpose
The backend is responsible for bridging in-game balances with the deployed HASH ERC-20 on Polygon. The game database remains the source of truth for player activity, while the ERC-20 supply reflects the aggregated daily mint.

### Architecture
- **Database (MongoDB):** Tracks `User.hashBalance` and `User.unmintedHash` for each wallet.
- **Cron Job (`cron/dailyMint.js`):** Runs daily at 00:00 UTC.
  1. Aggregate all `unmintedHash` from the database.
  2. Call `mintHashTokens(totalUnminted)` via ethers.js.
  3. Distribute:
     - 80% credited to each player’s `hashBalance`.
     - 20% allocated to `Vault` (tracked in DB + on-chain).
  4. Reset all users’ `unmintedHash = 0`.

### Files & Responsibilities
- `abi/HashToken.json` → ERC-20 ABI for HASH token contract.
- `services/blockchain.js` → Wraps ethers.js with provider, signer (from `VAULT_PRIVATE_KEY`), and contract instance.
- `cron/dailyMint.js` → Schedules and executes the daily mint workflow.
- `controllers/gameController.js` → Retains business logic for ad-hoc settlement (`/mint`, `/trade`).

### Environment Variables
- `HASH_TOKEN_ADDRESS` → deployed ERC-20 address.
- `VAULT_ADDRESS` → Vault wallet address.
- `VAULT_PRIVATE_KEY` → Vault signer key (DO NOT commit).
- `RPC_URL` → Polygon RPC endpoint.
- `MINT_CRON_SCHEDULE` → default `0 0 * * *`.

### Agent Rules
- Always pull `totalUnminted` from the DB before minting.
- Do not hard-code contract addresses or keys—read from environment.
- If ABI changes, update `abi/HashToken.json` and bump this spec.
- Ensure cron job writes to logs: total minted, vault tax, DB update results.
- Mint failures must not silently zero user balances; retry logic is required.

