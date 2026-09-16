import hre from "hardhat";
const { ethers, network } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log(`\n========================================`);
  console.log(`Deploying BotProof Contract`);
  console.log(`Network: ${network.name} (Chain ID: ${(await ethers.provider.getNetwork()).chainId})`);
  console.log(`========================================\n`);

  const [deployer] = await ethers.getSigners();
  if (deployer) {
    console.log(`Deployer address: ${deployer.address}`);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Deployer balance: ${ethers.formatEther(balance)} BOT/ETH\n`);
  } else {
    console.log(`No signer available. Check private key configuration.`);
  }

  const BotProofFactory = await ethers.getContractFactory("BotProof");
  const botProof = await BotProofFactory.deploy();
  await botProof.waitForDeployment();

  const contractAddress = await botProof.getAddress();
  console.log(`\n🎉 BotProof deployed successfully!`);
  console.log(`Contract Address: ${contractAddress}`);

  // Write contract address & ABI to frontend directory
  const contractsDir = path.join(process.cwd(), "src", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const artifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "BotProof.sol",
    "BotProof.json"
  );

  let abi = [];
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    abi = artifact.abi;
    fs.writeFileSync(
      path.join(contractsDir, "BotProof.json"),
      JSON.stringify({ address: contractAddress, abi }, null, 2)
    );
  }

  // Generate botproof.ts with typed configuration
  const botProofTsContent = `// Automatically generated deployment configuration
export const BOTPROOF_ADDRESS = "${contractAddress}" as const;

export const BOTPROOF_ABI = ${JSON.stringify(abi, null, 2)} as const;
`;

  fs.writeFileSync(path.join(contractsDir, "botproof.ts"), botProofTsContent);
  console.log(`Saved contract config to src/contracts/botproof.ts and BotProof.json`);

  // Update .env.local
  const envPath = path.join(process.cwd(), ".env.local");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  const contractEnvKey = "NEXT_PUBLIC_BOTPROOF_CONTRACT_ADDRESS=";
  if (envContent.includes(contractEnvKey)) {
    envContent = envContent.replace(
      new RegExp(`${contractEnvKey}.*`),
      `${contractEnvKey}${contractAddress}`
    );
  } else {
    envContent += `\n${contractEnvKey}${contractAddress}\n`;
  }
  fs.writeFileSync(envPath, envContent.trim() + "\n");
  console.log(`Updated .env.local with contract address: ${contractAddress}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
