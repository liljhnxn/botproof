import { createPublicClient, http } from "viem";
import { botchainTestnet, BOTCHAIN_RPC_URL } from "./config";
import { BOTPROOF_ABI, BOTPROOF_ADDRESS } from "@/contracts/botproof";

/**
 * Public client for read-only queries.
 * Allows wallet-less verification without requiring the user to connect MetaMask.
 */
export const publicClient = createPublicClient({
  chain: botchainTestnet,
  transport: http(BOTCHAIN_RPC_URL),
});

export interface ProofRecord {
  id: bigint;
  issuer: `0x${string}`;
  holder: `0x${string}`;
  documentHash: `0x${string}`;
  proofType: string;
  metadataURI: string;
  issuedAt: bigint;
  revoked: boolean;
}

/**
 * Get current configured contract address, prioritizing environment variable
 */
export function getContractAddress(): `0x${string}` {
  const addr = (process.env.NEXT_PUBLIC_BOTPROOF_CONTRACT_ADDRESS || BOTPROOF_ADDRESS || "") as `0x${string}`;
  return addr;
}

/**
 * Read-only proof fetching by ID
 */
export async function getProofById(proofId: bigint): Promise<ProofRecord | null> {
  const address = getContractAddress();
  if (!address) return null;

  try {
    const proof = (await publicClient.readContract({
      address,
      abi: BOTPROOF_ABI,
      functionName: "getProof",
      args: [proofId],
    })) as ProofRecord;

    return proof;
  } catch (error) {
    console.error("Error fetching proof by ID:", error);
    return null;
  }
}

/**
 * Read-only proof verification
 */
export async function verifyProofHash(
  proofId: bigint,
  documentHash: `0x${string}`
): Promise<boolean> {
  const address = getContractAddress();
  if (!address) return false;

  try {
    const isValid = (await publicClient.readContract({
      address,
      abi: BOTPROOF_ABI,
      functionName: "verifyProof",
      args: [proofId, documentHash],
    })) as boolean;

    return isValid;
  } catch (error) {
    console.error("Error verifying proof hash:", error);
    return false;
  }
}

/**
 * Read-only total proof count
 */
export async function getOnChainProofCount(): Promise<bigint> {
  const address = getContractAddress();
  if (!address) return BigInt(0);

  try {
    const count = (await publicClient.readContract({
      address,
      abi: BOTPROOF_ABI,
      functionName: "getProofCount",
    })) as bigint;

    return count;
  } catch (error) {
    console.error("Error fetching proof count:", error);
    return BigInt(0);
  }
}
