const { ethers } = require("ethers");
const HashTokenABI = require("../abi/HashToken.json");

const rpcUrl = process.env.RPC_URL;
const vaultPrivateKey = process.env.VAULT_PRIVATE_KEY;
const hashTokenAddress = process.env.HASH_TOKEN_ADDRESS;
const vaultAddress = process.env.VAULT_ADDRESS;

if (!rpcUrl || !vaultPrivateKey || !hashTokenAddress || !vaultAddress) {
  throw new Error(
    "Missing one of RPC_URL, VAULT_PRIVATE_KEY, HASH_TOKEN_ADDRESS, VAULT_ADDRESS"
  );
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(vaultPrivateKey, provider);
const tokenContract = new ethers.Contract(hashTokenAddress, HashTokenABI, wallet);

/**
 * Mint `amount` tokens (in token units, e.g. decimals considered) to the vault.
 * You may want to convert amount to smallest unit before calling.
 */
async function mintHashTokens(amount) {
  // if your token uses 18 decimals:
  const decimals = await tokenContract.decimals();
  const scaled = ethers.parseUnits(amount.toString(), decimals);

  const tx = await tokenContract.mint(vaultAddress, scaled);
  const receipt = await tx.wait();
  console.log("Minted HASH tokens:", amount.toString(), "TxHash:", receipt.transactionHash);
  return receipt;
}

module.exports = {
  mintHashTokens,
};
