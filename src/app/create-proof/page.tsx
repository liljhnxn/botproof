"use client";

import React, { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { isAddress, decodeEventLog } from "viem";
import { BOTCHAIN_CHAIN_ID } from "@/lib/config";
import { BOTPROOF_ABI, BOTPROOF_ADDRESS } from "@/contracts/botproof";
import { getContractAddress } from "@/lib/contract";
import { DocumentUploader } from "@/components/DocumentUploader";
import { HashedDocument } from "@/lib/hashing";
import { TransactionStatus, TxStep } from "@/components/TransactionStatus";
import { QRCodeDisplay } from "@/components/QRCode";
import { ProofStatus } from "@/components/ProofStatus";
import { formatAddress, formatTimestamp, getExplorerTxUrl } from "@/lib/format";
import Link from "next/link";
import {
  FileCheck,
  Award,
  Wallet,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const PROOF_TYPES = [
  "Certificate",
  "Achievement",
  "Skill",
  "Hackathon",
  "Course Completion",
  "Membership",
  "Product Authenticity",
  "Other",
];

export default function CreateProofPage() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Form State
  const [holderAddress, setHolderAddress] = useState("");
  const [proofType, setProofType] = useState("Certificate");
  const [customProofType, setCustomProofType] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [hashedDoc, setHashedDoc] = useState<HashedDocument | null>(null);

  // Errors & UI state
  const [formError, setFormError] = useState<string | null>(null);
  const [txStep, setTxStep] = useState<TxStep>("idle");
  const [txErrorMessage, setTxErrorMessage] = useState<string | undefined>(undefined);
  const [createdProofId, setCreatedProofId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    data: txHash,
    writeContractAsync,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle receipt decoding when transaction is confirmed
  React.useEffect(() => {
    if (isConfirming) {
      setTxStep("confirming");
    } else if (isConfirmed && receipt) {
      setTxStep("success");
      // Extract proofId from receipt logs
      try {
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: BOTPROOF_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "ProofCreated") {
              const args = decoded.args as any;
              setCreatedProofId(args.proofId.toString());
              break;
            }
          } catch (e) {
            // Not a matching event log
          }
        }
      } catch (err) {
        console.error("Failed to decode event log:", err);
      }
    }
  }, [isConfirming, isConfirmed, receipt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setTxErrorMessage(undefined);

    if (!isConnected) {
      setFormError("Please connect your wallet first.");
      return;
    }

    if (chainId !== BOTCHAIN_CHAIN_ID) {
      setFormError("You must switch to BotChain (Chain ID 968) before submitting.");
      return;
    }

    if (!isAddress(holderAddress)) {
      setFormError("Please enter a valid recipient/holder Ethereum/Botchain address (0x...).");
      return;
    }

    if (!hashedDoc || !hashedDoc.hash) {
      setFormError("Please upload and hash a document first.");
      return;
    }

    const selectedType = proofType === "Other" ? customProofType.trim() : proofType;
    if (!selectedType) {
      setFormError("Please specify a proof type.");
      return;
    }

    const contractAddr = getContractAddress();
    if (!contractAddr) {
      setFormError("BotProof contract address is not configured. Please check deployment.");
      return;
    }

    try {
      setTxStep("awaiting_wallet");

      const hash = await writeContractAsync({
        address: contractAddr,
        abi: BOTPROOF_ABI,
        functionName: "createProof",
        args: [
          holderAddress as `0x${string}`,
          hashedDoc.hash,
          selectedType,
          metadataURI.trim(),
        ],
      });

      setTxStep("pending");
    } catch (err: any) {
      console.error("Proof creation failed:", err);
      setTxStep("error");
      const message =
        err?.shortMessage ||
        err?.message ||
        "Transaction was rejected or failed. Check console for details.";
      setTxErrorMessage(message);
    }
  };

  const handleResetForm = () => {
    setHolderAddress("");
    setProofType("Certificate");
    setCustomProofType("");
    setMetadataURI("");
    setHashedDoc(null);
    setFormError(null);
    setTxStep("idle");
    setCreatedProofId(null);
    resetWrite();
  };

  const isWrongNetwork = isConnected && chainId !== BOTCHAIN_CHAIN_ID;

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-botchain-500/10 text-botchain-400 text-xs font-mono border border-botchain-500/20">
          <Sparkles size={13} />
          <span>On-Chain Attestation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Create a Proof</h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Anchor a cryptographic document fingerprint permanently to the recipient's wallet on Botchain.
        </p>
      </div>

      {/* Network Warning */}
      {isWrongNetwork && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Wrong Network Detected</p>
            <p className="text-zinc-400">Please switch your wallet network to BotChain (Chain ID 968).</p>
          </div>
          <button
            type="button"
            onClick={() => switchChain({ chainId: BOTCHAIN_CHAIN_ID })}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold border border-amber-500/40 transition-colors whitespace-nowrap"
          >
            Switch to Botchain
          </button>
        </div>
      )}

      {/* Success State View */}
      {txStep === "success" && (
        <div className="glass-panel rounded-3xl p-8 border border-botchain-500/30 shadow-glow-bot space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-botchain-500/20 text-botchain-400 border border-botchain-500/30">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Proof Created Successfully!</h2>
                <p className="text-xs text-zinc-400">Permanently recorded on BotChain</p>
              </div>
            </div>
            <ProofStatus revoked={false} size="md" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-zinc-500">Proof Identifier</span>
              <p className="text-lg font-mono font-bold text-botchain-300">
                #{createdProofId ? createdProofId.padStart(3, "0") : "Confirmed"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-zinc-500">Proof Type</span>
              <p className="text-base font-semibold text-white">
                {proofType === "Other" ? customProofType : proofType}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-zinc-500">Recipient (Holder)</span>
              <p className="font-mono text-zinc-300 break-all">{holderAddress}</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-zinc-500">Issuer</span>
              <p className="font-mono text-zinc-300 break-all">{address}</p>
            </div>

            <div className="sm:col-span-2 p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-zinc-500">Document SHA-256 Hash</span>
              <p className="font-mono text-botchain-400 break-all">{hashedDoc?.hash}</p>
            </div>
          </div>

          {/* QR Code & Direct Verification */}
          {createdProofId && typeof window !== "undefined" && (
            <div className="pt-2">
              <QRCodeDisplay
                url={`${window.location.origin}/verify/${createdProofId}`}
                proofId={createdProofId}
                title="Scan to Verify on Botchain"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
            {createdProofId && (
              <Link
                href={`/verify/${createdProofId}`}
                className="glow-bot-btn px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <span>View Public Proof Page</span>
                <ArrowRight size={14} />
              </Link>
            )}

            {txHash && (
              <a
                href={getExplorerTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl glass-panel text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 border border-white/10 hover:border-white/20 transition-all"
              >
                <span>Explorer Record</span>
                <ExternalLink size={13} />
              </a>
            )}

            <button
              onClick={handleResetForm}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors ml-auto"
            >
              <RotateCcw size={13} />
              <span>Issue Another</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Creation Form (visible when not successful) */}
      {txStep !== "success" && (
        <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          {/* Step 1: Document Upload & Hashing */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-botchain-500/20 text-botchain-400 flex items-center justify-center text-[11px] font-mono">
                1
              </span>
              <span>Upload Document to Fingerprint</span>
            </label>
            <DocumentUploader
              onHashGenerated={(doc) => setHashedDoc(doc)}
              isLoading={txStep === "awaiting_wallet" || txStep === "pending" || txStep === "confirming"}
            />
          </div>

          {/* Step 2: Recipient Address */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-botchain-500/20 text-botchain-400 flex items-center justify-center text-[11px] font-mono">
                2
              </span>
              <span>Holder Wallet Address</span>
            </label>
            <input
              type="text"
              placeholder="0x... (Recipient's Botchain / EVM address)"
              value={holderAddress}
              onChange={(e) => setHolderAddress(e.target.value.trim())}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs sm:text-sm font-mono placeholder:text-zinc-600 focus:outline-none"
              required
            />
            <p className="text-[11px] text-zinc-500">
              The wallet address authorized to claim or showcase this proof.
            </p>
          </div>

          {/* Step 3: Proof Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-botchain-500/20 text-botchain-400 flex items-center justify-center text-[11px] font-mono">
                3
              </span>
              <span>Proof Classification</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PROOF_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProofType(type)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                    proofType === type
                      ? "bg-botchain-500/15 border-botchain-500/40 text-botchain-300 shadow-sm"
                      : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {proofType === "Other" && (
              <input
                type="text"
                placeholder="Specify custom proof type..."
                value={customProofType}
                onChange={(e) => setCustomProofType(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs mt-2"
                required
              />
            )}
          </div>

          {/* Step 4: Public Metadata URI (Optional) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-botchain-500/20 text-botchain-400 flex items-center justify-center text-[11px] font-mono">
                  4
                </span>
                <span>Public Metadata URI (Optional)</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-normal">ipfs:// or https://</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ipfs://Qm... or https://metadata.example.com/item.json"
              value={metadataURI}
              onChange={(e) => setMetadataURI(e.target.value.trim())}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-mono placeholder:text-zinc-600 focus:outline-none"
            />
            <p className="text-[11px] text-zinc-500">
              Optional public JSON metadata link for title, description, or badge imagery.
            </p>
          </div>

          {/* Error Banner */}
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {formError}
            </div>
          )}

          {/* Transaction Status Progress */}
          <TransactionStatus
            step={txStep}
            txHash={txHash}
            errorMessage={txErrorMessage}
            onReset={() => setTxStep("idle")}
          />

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={
                !isConnected ||
                isWrongNetwork ||
                !hashedDoc ||
                txStep === "awaiting_wallet" ||
                txStep === "pending" ||
                txStep === "confirming"
              }
              className="glow-bot-btn px-6 py-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg cursor-pointer"
            >
              <span>Anchor Proof on Botchain</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
