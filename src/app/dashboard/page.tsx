"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { BOTPROOF_ABI, BOTPROOF_ADDRESS } from "@/contracts/botproof";
import { publicClient, getContractAddress, ProofRecord } from "@/lib/contract";
import { ProofCard } from "@/components/ProofCard";
import { formatAddress } from "@/lib/format";
import Link from "next/link";
import {
  UserCheck,
  Award,
  Wallet,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";

export default function HolderDashboardPage() {
  const { address, isConnected } = useAccount();

  const [proofs, setProofs] = useState<ProofRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const contractAddress = getContractAddress();

  const fetchProofs = async () => {
    if (!address || !contractAddress) return;

    setLoading(true);
    try {
      const proofIds = (await publicClient.readContract({
        address: contractAddress,
        abi: BOTPROOF_ABI,
        functionName: "getHolderProofs",
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
      // Sort newest first
      resolved.sort((a, b) => Number(b.id - a.id));
      setProofs(resolved);
    } catch (err) {
      console.error("Failed to fetch holder proofs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchProofs();
    } else {
      setProofs([]);
    }
  }, [isConnected, address, contractAddress]);

  if (!isConnected) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-botchain-500/10 text-botchain-400 border border-botchain-500/20 flex items-center justify-center mx-auto shadow-glow-bot">
          <Wallet size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Connect Your Wallet</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Connect your wallet to view credentials, certificates, and proofs issued to your address on Botchain.
          </p>
        </div>
      </div>
    );
  }

  const validProofs = proofs.filter((p) => !p.revoked);
  const revokedProofs = proofs.filter((p) => p.revoked);

  const filteredProofs = proofs.filter(
    (p) =>
      p.proofType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString().includes(searchQuery) ||
      p.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 text-xs font-mono text-botchain-400 mb-1">
            <span className="flex items-center gap-1.5">
              <UserCheck size={14} />
              <span>Holder Identity</span>
            </span>
            <span className="text-zinc-600">•</span>
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-botchain-400 hover:text-botchain-300 transition-colors"
              title="Official BotChain Website"
            >
              <span>botchain.ai</span>
              <ExternalLink size={10} />
            </a>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Proofs & Credentials</h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Wallet: <span className="text-zinc-200">{address}</span>
          </p>
        </div>

        <button
          onClick={fetchProofs}
          disabled={loading}
          className="px-4 py-2 rounded-xl glass-panel text-xs text-zinc-300 hover:text-white flex items-center gap-2 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-botchain-400" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-1">
          <span className="text-xs text-zinc-400 font-mono uppercase">Total Proofs Received</span>
          <p className="text-3xl font-bold font-mono text-white">{proofs.length}</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-1">
          <span className="text-xs text-zinc-400 font-mono uppercase flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-botchain-400" />
            Valid & Active
          </span>
          <p className="text-3xl font-bold font-mono text-botchain-400">{validProofs.length}</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-1">
          <span className="text-xs text-zinc-400 font-mono uppercase flex items-center gap-1.5">
            <XCircle size={13} className="text-rose-400" />
            Revoked
          </span>
          <p className="text-3xl font-bold font-mono text-rose-400">{revokedProofs.length}</p>
        </div>
      </div>

      {/* Filter / Search */}
      {proofs.length > 0 && (
        <div className="max-w-md">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by proof type, ID, or issuer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono placeholder:text-zinc-500"
            />
          </div>
        </div>
      )}

      {/* Proofs Grid */}
      {loading ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-botchain-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Loading your proofs from Botchain...</p>
        </div>
      ) : filteredProofs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProofs.map((proof) => (
            <ProofCard key={proof.id.toString()} proof={proof} />
          ))}
        </div>
      ) : proofs.length > 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center text-xs text-zinc-400">
          No proofs match your search query.
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-500 flex items-center justify-center mx-auto">
            <Award size={24} />
          </div>
          <h3 className="text-base font-semibold text-white">No Proofs Found for Your Wallet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            You haven't received any digital proofs at this address yet. Share your wallet address with an authorized issuer to receive verifiable credentials.
          </p>
          <div className="pt-2">
            <Link
              href="/verify"
              className="glow-bot-btn px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <span>Explore Public Verification</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
