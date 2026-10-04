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
  console.log(`BotProof Multi-Wallet Contract Interaction (Mainnet)`);
  console.log(`Target Network: BotChain (Chain ID: ${CHAIN_ID})`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`RPC: ${RPC_URL}`);
  console.log(`======================================================\n`);

  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: "botchain",
  });

  const pk1 = process.env.TEST_WALLET_1_PK;
  const pk2 = process.env.TEST_WALLET_2_PK;
  const pk3 = process.env.TEST_WALLET_3_PK;

  if (!pk1 || !pk2 || !pk3) {
    console.error("Missing test wallet private keys in .env.local!");
    process.exit(1);
  }

  const wallet1 = new ethers.Wallet(pk1, provider);
  const wallet2 = new ethers.Wallet(pk2, provider);
  const wallet3 = new ethers.Wallet(pk3, provider);

  const contract1 = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet1);
  const contract2 = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet2);
  const contract3 = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet3);

  const readContract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
  const currentProofCount = Number(await readContract.getProofCount());
  console.log(`Current Total Proofs on Mainnet: ${currentProofCount}\n`);

  // Interaction 1 (Already complete if count >= 1)
  if (currentProofCount < 1) {
    console.log("------------------------------------------------------");
    console.log("[1/5] Wallet 1 -> createProof for Wallet 2");
    const hash1 = ethers.keccak256(ethers.toUtf8Bytes("Degree:Alice:CS:BotChainUniversity:2026"));
    const tx1 = await contract1.createProof(
      wallet2.address,
      hash1,
      "Academic Degree - Computer Science",
      "ipfs://bafkreihdegreeproofrecord001"
    );
    console.log(`  Tx sent: ${tx1.hash}`);
    const receipt1 = await tx1.wait();
    console.log(`  ✓ Confirmed in block ${receipt1.blockNumber}`);
    console.log(`  Explorer: https://scan.botchain.ai/tx/${tx1.hash}`);
  } else {
    console.log("✓ [1/5] Proof #1 already confirmed on Mainnet");
  }

  // Interaction 2 (Already complete if count >= 2)
  if (currentProofCount < 2) {
    console.log("\n------------------------------------------------------");
    console.log("[2/5] Wallet 1 -> createProof for Wallet 3");
    const hash2 = ethers.keccak256(ethers.toUtf8Bytes("Hackathon:Bob:1stPlace:BotChainAI:2026"));
    const tx2 = await contract1.createProof(
      wallet3.address,
      hash2,
      "Hackathon Winner - BotChain AI Global",
      "ipfs://bafkreihhackathonwinner002"
    );
    console.log(`  Tx sent: ${tx2.hash}`);
    const receipt2 = await tx2.wait();
    console.log(`  ✓ Confirmed in block ${receipt2.blockNumber}`);
    console.log(`  Explorer: https://scan.botchain.ai/tx/${tx2.hash}`);
  } else {
    console.log("✓ [2/5] Proof #2 already confirmed on Mainnet");
  }

  // Interaction 3 (Already complete if count >= 3)
  if (currentProofCount < 3) {
    console.log("\n------------------------------------------------------");
    console.log("[3/5] Wallet 2 -> createProof for Wallet 1");
    const hash3 = ethers.keccak256(ethers.toUtf8Bytes("Skill:Alice:Cert:SecurityAuditor:2026"));
    const tx3 = await contract2.createProof(
      wallet1.address,
      hash3,
      "Skill Certification - Smart Contract Security",
      "ipfs://bafkreihskillcertsec003"
    );
    console.log(`  Tx sent: ${tx3.hash}`);
    const receipt3 = await tx3.wait();
    console.log(`  ✓ Confirmed in block ${receipt3.blockNumber}`);
    console.log(`  Explorer: https://scan.botchain.ai/tx/${tx3.hash}`);
  } else {
    console.log("✓ [3/5] Proof #3 already confirmed on Mainnet");
  }

  // Interaction 4: Wallet 2 -> Wallet 3
  if (currentProofCount < 4) {
    console.log("\n------------------------------------------------------");
    console.log("[4/5] Wallet 2 -> createProof for Wallet 3");
    console.log("Proof Type: 'Product Authenticity - AI Agent License v1'");
    const bal2 = await provider.getBalance(wallet2.address);
    console.log(`  Wallet 2 Balance: ${ethers.formatEther(bal2)} BOT`);
    if (bal2 < ethers.parseEther("0.006")) {
      console.log(`  ⚠️ Wallet 2 needs ~0.005 more BOT to execute this transaction.`);
      return;
    }
    const hash4 = ethers.keccak256(ethers.toUtf8Bytes("License:Charlie:AIAgentLicense:Serial-9988"));
    const tx4 = await contract2.createProof(
      wallet3.address,
      hash4,
      "Product Authenticity - AI Agent License v1",
      "ipfs://bafkreihlicenseauth004"
    );
    console.log(`  Tx sent: ${tx4.hash}`);
    const receipt4 = await tx4.wait();
    console.log(`  ✓ Confirmed in block ${receipt4.blockNumber}`);
    console.log(`  Explorer: https://scan.botchain.ai/tx/${tx4.hash}`);
  } else {
    console.log("✓ [4/5] Proof #4 already confirmed on Mainnet");
  }

  // Interaction 5: Wallet 3 -> Wallet 2
  if (currentProofCount < 5) {
    console.log("\n------------------------------------------------------");
    console.log("[5/5] Wallet 3 -> createProof for Wallet 2");
    console.log("Proof Type: 'Membership Proof - BotChain DAO Genesis Member'");
    const bal3 = await provider.getBalance(wallet3.address);
    console.log(`  Wallet 3 Balance: ${ethers.formatEther(bal3)} BOT`);
    if (bal3 < ethers.parseEther("0.006")) {
      console.log(`  ⚠️ Wallet 3 needs ~0.006 more BOT to execute this transaction.`);
      return;
    }
    const hash5 = ethers.keccak256(ethers.toUtf8Bytes("DAO:Membership:GenesisCouncil:Wallet2:2026"));
    const tx5 = await contract3.createProof(
      wallet2.address,
      hash5,
      "Membership Proof - BotChain DAO Genesis Member",
      "ipfs://bafkreihdaomembership005"
    );
    console.log(`  Tx sent: ${tx5.hash}`);
    const receipt5 = await tx5.wait();
    console.log(`  ✓ Confirmed in block ${receipt5.blockNumber}`);
    console.log(`  Explorer: https://scan.botchain.ai/tx/${tx5.hash}`);
  } else {
    console.log("✓ [5/5] Proof #5 already confirmed on Mainnet");
  }

  console.log("\n======================================================");
  console.log("All requested Mainnet Contract Interactions Complete!");
  console.log("======================================================\n");
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
