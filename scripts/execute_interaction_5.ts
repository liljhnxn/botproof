import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: ".env.local" });
dotenv.config();

const RPC_URL = process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || "https://rpc.botchain.ai";
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_BOTCHAIN_CHAIN_ID) || 677;
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_BOTPROOF_CONTRACT_ADDRESS ||
  "0xc16BEc2A8068a3a4fc387b9e9c07459E90342C0B";

const artifactPath = path.join(
  process.cwd(),
  "artifacts",
  "contracts",
  "BotProof.sol",
  "BotProof.json"
);

const abi = JSON.parse(fs.readFileSync(artifactPath, "utf-8")).abi;

async function main() {
  console.log(`\n======================================================`);
  console.log(`BotProof - Executing 5th Contract Interaction (Mainnet)`);
  console.log(`Target Network: BotChain (Chain ID: ${CHAIN_ID})`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`======================================================\n`);

  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: "botchain",
  });

  const pk2 = process.env.TEST_WALLET_2_PK;
  if (!pk2) {
    console.error("Missing TEST_WALLET_2_PK in .env.local!");
    process.exit(1);
  }

  const wallet2 = new ethers.Wallet(pk2, provider);
  const contract2 = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet2);

  const bal2 = await provider.getBalance(wallet2.address);
  console.log(`Wallet 2 Address: ${wallet2.address}`);
  console.log(`Wallet 2 Balance: ${ethers.formatEther(bal2)} BOT`);

  // Check Proof #4 status
  const proof4 = await contract2.getProof(4);
  console.log(`\nProof #4 Details:`);
  console.log(`  Type: ${proof4.proofType}`);
  console.log(`  Issuer: ${proof4.issuer}`);
  console.log(`  Holder: ${proof4.holder}`);
  console.log(`  Currently Revoked: ${proof4.revoked}`);

  if (proof4.revoked) {
    console.log(`\n✓ Proof #4 is already revoked on-chain!`);
    return;
  }

  console.log(`\n[5/5] Executing revokeProof(4) from Issuer (Wallet 2)...`);
  const tx5 = await contract2.revokeProof(4);
  console.log(`  Tx sent: ${tx5.hash}`);
  console.log(`  Waiting for block confirmation...`);
  const receipt5 = await tx5.wait();
  console.log(`  ✓ Confirmed in block ${receipt5?.blockNumber}!`);
  console.log(`  Explorer Link: https://scan.botchain.ai/tx/${tx5.hash}`);

  const updatedProof4 = await contract2.getProof(4);
  console.log(`\nVerified On-Chain State: Proof #4 Revoked = ${updatedProof4.revoked}`);
  console.log(`\n======================================================`);
  console.log(`🎉 ALL 5 CONTRACT INTERACTIONS COMPLETED ON MAINNET!`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
