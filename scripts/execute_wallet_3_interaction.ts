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
  console.log(`BotProof - Wallet 3 On-Chain Contract Interaction (Mainnet)`);
  console.log(`Target Network: BotChain (Chain ID: ${CHAIN_ID})`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`======================================================\n`);

  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: "botchain",
  });

  const pk3 = process.env.TEST_WALLET_3_PK;
  if (!pk3) {
    console.error("Missing TEST_WALLET_3_PK in .env.local!");
    process.exit(1);
  }

  const wallet3 = new ethers.Wallet(pk3, provider);
  const contractInterface = new ethers.Interface(abi);

  const bal3 = await provider.getBalance(wallet3.address);
  console.log(`Wallet 3 Address: ${wallet3.address}`);
  console.log(`Wallet 3 Balance: ${ethers.formatEther(bal3)} BOT`);

  // Target proof to verify on-chain: Proof #1
  const proofId = 1;
  const hash1 = ethers.keccak256(ethers.toUtf8Bytes("Degree:Alice:CS:BotChainUniversity:2026"));
  console.log(`\nVerifying Proof #${proofId} on-chain with Document Hash: ${hash1}`);

  const callData = contractInterface.encodeFunctionData("verifyProof", [proofId, hash1]);

  console.log(`Broadcasting transaction from Wallet 3 to BotProof contract...`);
  const tx = await wallet3.sendTransaction({
    to: CONTRACT_ADDRESS,
    data: callData,
    gasLimit: 60000,
    gasPrice: ethers.parseUnits("20", "gwei"),
  });

  console.log(`  Tx sent: ${tx.hash}`);
  console.log(`  Waiting for block confirmation...`);
  const receipt = await tx.wait();
  console.log(`  ✓ Confirmed in block ${receipt?.blockNumber}!`);
  console.log(`  Gas Used: ${receipt?.gasUsed ? receipt.gasUsed.toString() : "0"} (~${ethers.formatEther((receipt?.gasUsed ?? 0n) * 20000000000n)} BOT)`);
  console.log(`  Explorer Link: https://scan.botchain.ai/tx/${tx.hash}`);

  const remainingBal = await provider.getBalance(wallet3.address);
  console.log(`\nWallet 3 Remaining Balance: ${ethers.formatEther(remainingBal)} BOT`);
  console.log(`\n======================================================`);
  console.log(`🎉 WALLET 3 CONTRACT INTERACTION COMPLETE ON MAINNET!`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
