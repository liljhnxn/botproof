"use client";

import React, { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { BOTPROOF_ABI } from "@/contracts/botproof";
import { publicClient, getContractAddress, ProofRecord } from "@/lib/contract";
import { ProofStatus } from "@/components/ProofStatus";
import { formatAddress, formatTimestamp, formatHash, getExplorerTxUrl } from "@/lib/format";
import { BOTCHAIN_CHAIN_ID } from "@/lib/config";
import Link from "next/link";
import {
  Shield,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Wallet,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

export default function IssuerDashboardPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [proofs, setProofs] = useState<ProofRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<bigint | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const contractAddress = getContractAddress();

  const {
    data: revokeTxHash,
    writeContractAsync,
    isPending: isRevokePending,
  } = useWriteContract();

  const {
    isLoading: isRevokeConfirming,
    isSuccess: isRevokeConfirmed,
  } = useWaitForTransactionReceipt({
    hash: revokeTxHash,
  });

  const fetchIssuerProofs = async () => {
    if (!address || !contractAddress) return;

    setLoading(true);
    try {
      const proofIds = (await publicClient.readContract({
        address: contractAddress,
        abi: BOTPROOF_ABI,
        functionName: "getIssuerProofs",
        args: [address],
      })) as bigint[];

      const proofPromises = proofIds.map((id) =>
        publicClient.readContract({
          address: contractAddress,
          abi: BOTPROOF_ABI,
          functionName: "getProof",
          args: [id],
        }) as Promise<ProofRecord>
      );

      const resolved = await Promise.all(proofPromises);
      resolved.sort((a, b) => Number(b.id - a.id));
      setProofs(resolved);
    } catch (err) {
      console.error("Failed to fetch issuer proofs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchIssuerProofs();
    } else {
      setProofs([]);
    }
  }, [isConnected, address, contractAddress]);

  // Refetch when revocation transaction confirms
  useEffect(() => {
    if (isRevokeConfirmed) {
      fetchIssuerProofs();
      setRevokingId(null);
    }
  }, [isRevokeConfirmed]);

  const handleRevokeProof = async (proofId: bigint) => {
    if (chainId !== BOTCHAIN_CHAIN_ID) {
      setRevokeError("Please switch to BotChain (Chain ID 968).");
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to revoke Proof #${proofId.toString()}? This action is permanent and recorded on-chain.`
    );
    if (!confirm) return;

    setRevokingId(proofId);
    setRevokeError(null);

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: BOTPROOF_ABI,
        functionName: "revokeProof",
        args: [proofId],
      });
    } catch (err: any) {
      console.error("Revocation failed:", err);
      setRevokeError(err?.shortMessage || err?.message || "Revocation failed.");
      setRevokingId(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-botchain-500/10 text-botchain-400 border border-botchain-500/20 flex items-center justify-center mx-auto shadow-glow-bot">
          <Shield size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Issuer Portal</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Connect your wallet to manage, monitor, and revoke credentials issued by your organization on Botchain.
          </p>
        </div>
      </div>
    );
  }

  const activeCount = proofs.filter((p) => !p.revoked).length;
  const revokedCount = proofs.filter((p) => p.revoked).length;

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-botchain-400 mb-1">
            <Shield size={14} />
            <span>Authorized Issuer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Issuer Dashboard</h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Issuer: <span className="text-zinc-200">{address}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchIssuerProofs}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl glass-panel text-xs text-zinc-300 hover:text-white flex items-center gap-2 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-botchain-400" : ""} />
            <span>Refresh</span>
          </button>

          <Link
            href="/create-proof"
            className="glow-bot-btn px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <PlusCircle size={15} />
            <span>Issue New Proof</span>
          </Link>
        </div>
      </div>

      {/* Metrics Calculated Directly from Blockchain Data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-1">
          <span className="text-xs text-zinc-400 font-mono uppercase">Proofs Issued</span>
          <p className="text-4xl font-bold font-mono text-white">{proofs.length}</p>
          <span className="text-[11px] text-zinc-500">Total historical issuances</span>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-1">
          <span className="text-xs text-zinc-400 font-mono uppercase flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-botchain-400" />
            Active Proofs
          </span>
          <p className="text-4xl font-bold font-mono text-botchain-400">{activeCount}</p>
          <span className="text-[11px] text-zinc-500">Currently valid & verifiable</span>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-1">
          <span className="text-xs text-zinc-400 font-mono uppercase flex items-center gap-1.5">
            <XCircle size={14} className="text-rose-400" />
            Revoked
          </span>
          <p className="text-4xl font-bold font-mono text-rose-400">{revokedCount}</p>
          <span className="text-[11px] text-zinc-500">Permanently invalidated</span>
        </div>
      </div>

      {/* Revocation Status Notice */}
      {(isRevokePending || isRevokeConfirming) && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-3">
          <RefreshCw size={18} className="animate-spin text-cyan-400 shrink-0" />
          <div>
            <p className="font-semibold">Submitting Revocation Transaction...</p>
            <p className="text-zinc-400">Please confirm and await block confirmation on Botchain.</p>
          </div>
        </div>
      )}

      {revokeError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {revokeError}
        </div>
      )}

      {/* Issued Proofs Table / List */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Issued Credentials Log</h2>
          <span className="text-xs font-mono text-zinc-500">{proofs.length} total records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400">
            <div className="w-8 h-8 border-2 border-botchain-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Fetching on-chain records from Botchain...
          </div>
        ) : proofs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 border-b border-white/5 text-zinc-400 font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">TYPE</th>
                  <th className="py-3 px-6">RECIPIENT (HOLDER)</th>
                  <th className="py-3 px-6">FINGERPRINT (HASH)</th>
                  <th className="py-3 px-6">ISSUED DATE</th>
                  <th className="py-3 px-6">STATUS</th>
                  <th className="py-3 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {proofs.map((proof) => (
                  <tr key={proof.id.toString()} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono text-zinc-300">
                      #{proof.id.toString().padStart(3, "0")}
                    </td>
                    <td className="py-4 px-6 font-medium text-white">{proof.proofType}</td>
                    <td className="py-4 px-6 font-mono text-zinc-400">
                      {formatAddress(proof.holder)}
                    </td>
                    <td className="py-4 px-6 font-mono text-zinc-400">
                      {formatHash(proof.documentHash, 6, 4)}
                    </td>
                    <td className="py-4 px-6 text-zinc-400">
                      {formatTimestamp(proof.issuedAt)}
                    </td>
                    <td className="py-4 px-6">
                      <ProofStatus revoked={proof.revoked} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/verify/${proof.id.toString()}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                      >
                        <span>View</span>
                        <ArrowUpRight size={12} />
                      </Link>

                      {!proof.revoked && (
                        <button
                          onClick={() => handleRevokeProof(proof.id)}
                          disabled={revokingId === proof.id}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors disabled:opacity-50"
                        >
                          {revokingId === proof.id ? "Revoking..." : "Revoke"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <p className="text-xs text-zinc-400">
              You have not issued any proofs from this wallet yet.
            </p>
            <Link
              href="/create-proof"
              className="glow-bot-btn px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <PlusCircle size={14} />
              <span>Issue Your First Proof</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
