# AGENTSHASH.md

## 🎯 Purpose  
This file defines how backend agents (e.g., Codex) should interact with the **HASH token** on Polygon to handle daily minting and balance updates for HashEquity.

---

## 🔑 Environment Variables  
These are already set in Railway and must be used by the backend services:

- `HASH_TOKEN_ADDRESS` → `0xCd0Bc675455ee5Fa8739F5c377fe4Ec1437Bc618`  
- `RPC_URL` → `https://polygon-rpc.com`  
- `VAULT_ADDRESS` → (Vault wallet address, also Polygon address)  
- `MINT_CRON_SCHEDULE` → `"0 0 * * *"` (daily midnight UTC)  
- `MONGO_URI` → (MongoDB connection string)  
- `MONGO_DB_NAME` → (Mongo database name)

---

## 📄 ABI  
- Use `backend/contracts/HashToken.json`.  
- Load with:

```js
const { ethers } = require("ethers");
const HashToken = require("./contracts/HashToken.json");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.HASH_TOKEN_ADDRESS, HashToken.abi, signer);

⚙️ Daily Minting Flow
Aggregation
Query all users in Mongo.
Sum unmintedHash.
Mint to Vault
Call contract:
await contract.mint(process.env.VAULT_ADDRESS, totalUnminted);


Distribute 80/20
Credit each user’s hashBalance with 80% of their unmintedHash.
Credit 20% to Vault’s on-chain balance.
Reset Unminted
After minting, set all users’ unmintedHash to 0.

🔄 Trade Flow

Player chooses to trade their unmintedHash.
Backend debits Mongo unmintedHash.
Backend credits hashBalance with 50% of traded value.
Burned unmintedHash is credited to Vault’s balance.

🔐 Access Control

Only signer wallet with MINTER_ROLE may call mint().
Default recipient for all minted supply = VAULT_ADDRESS.
Admin keys are never exposed in frontend.

✅ Agent Responsibilities

Run cron job according to MINT_CRON_SCHEDULE.
Handle Mongo <-> Contract sync (balances consistent across sessions).
Retry failed mint transactions with queueing system.
Log all settlements and trades for transparency.
