"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  FileCheck,
  Search,
  Lock,
  ArrowRight,
  Fingerprint,
  Layers,
  Award,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { getOnChainProofCount, getContractAddress } from "@/lib/contract";
import { formatAddress, getExplorerAddressUrl } from "@/lib/format";
import { BOTCHAIN_CHAIN_ID, BOTCHAIN_WEBSITE_URL } from "@/lib/config";

export default function HomePage() {
  const router = useRouter();
  const [searchId, setSearchId] = useState("");
  const [proofCount, setProofCount] = useState<number | null>(null);
  const contractAddress = getContractAddress();

  useEffect(() => {
    getOnChainProofCount().then((count) => {
      setProofCount(Number(count));
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    router.push(`/verify/${searchId.trim()}`);
  };

  const proofCategories = [
    { name: "Academic Certificates", desc: "Diplomas, course completions, & credentials" },
    { name: "Hackathon & Awards", desc: "Participation badges, placements, & honors" },
    { name: "Skill & Mastery", desc: "Technical competencies & verified skills" },
    { name: "Membership Proofs", desc: "DAO & organization affiliations" },
    { name: "Product Authenticity", desc: "Anti-counterfeiting & provenance records" },
    { name: "Document Integrity", desc: "Legal, auditing, and corporate documents" },
  ];

  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center pt-8 pb-12 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-botchain-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* KPI 3: Clickable botchain.ai badge alongside verified contract explorer link */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <a
            href={BOTCHAIN_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="hero-botchain-website-badge"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-botchain-500/10 hover:bg-botchain-500/20 border border-botchain-500/30 text-xs font-mono text-botchain-300 hover:text-white shadow-sm transition-all hover:scale-[1.02] group cursor-pointer"
            title="Official BotChain Website (https://botchain.ai)"
          >
            <span className="w-2 h-2 rounded-full bg-botchain-400 animate-pulse" />
            <span className="font-semibold text-white">botchain.ai</span>
            <span className="text-botchain-400">• Official Network</span>
            <ExternalLink size={12} className="text-botchain-400 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {contractAddress ? (
            <a
              href={getExplorerAddressUrl(contractAddress)}
              target="_blank"
              rel="noopener noreferrer"
              id="hero-contract-explorer-badge"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-botchain-500/30 text-xs font-mono text-zinc-300 hover:text-white shadow-sm transition-all hover:scale-[1.02] group cursor-pointer"
              title="Verified BotProof Contract on BotChain Explorer"
            >
              <ShieldCheck size={13} className="text-botchain-400" />
              <span>Verified Contract: {formatAddress(contractAddress)}</span>
              <ExternalLink size={12} className="text-zinc-400 group-hover:text-botchain-400 group-hover:translate-x-0.5 transition-all" />
            </a>
          ) : (
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              id="hero-contract-explorer-badge"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-botchain-500/30 text-xs font-mono text-zinc-300 hover:text-white shadow-sm transition-all hover:scale-[1.02] group cursor-pointer"
            >
              <ShieldCheck size={13} className="text-botchain-400" />
              <span>Explorer: scan.botchain.ai</span>
              <ExternalLink size={12} className="text-zinc-400 group-hover:text-botchain-400" />
            </a>
          )}
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight max-w-4xl text-white">
          Prove It. Verify It. <br />
          <span className="gradient-text-bot">Trust the Chain.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-300 max-w-2xl font-light leading-relaxed">
          Create tamper-evident digital proofs and verify authenticity directly from Botchain.
          Anchor cryptographic fingerprints without exposing private documents.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/create-proof"
            className="glow-bot-btn px-7 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-2.5 shadow-glow-bot"
          >
            <span>Create a Proof</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/verify"
            className="glass-panel px-7 py-3.5 rounded-2xl text-sm font-semibold text-white hover:bg-white/10 border border-white/10 hover:border-botchain-500/40 flex items-center gap-2.5 transition-all"
          >
            <Shield size={16} className="text-botchain-400" />
            <span>Verify a Proof</span>
          </Link>
        </div>

        {/* Quick Search */}
        <div className="mt-12 w-full max-w-xl">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              placeholder="Instant Lookup: Enter Proof ID (e.g. 1)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full glass-input rounded-2xl py-4 pl-5 pr-28 text-sm focus:outline-none placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 rounded-xl bg-botchain-500/20 hover:bg-botchain-500/30 text-botchain-300 text-xs font-semibold flex items-center gap-1.5 border border-botchain-500/30 transition-colors cursor-pointer"
            >
              <Search size={14} />
              <span>Verify</span>
            </button>
          </form>
        </div>
      </section>

      {/* Protocol Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col">
          <span className="text-xs font-mono uppercase text-zinc-400">Total Proofs Issued</span>
          <span className="text-3xl font-extrabold text-white mt-2 font-mono">
            {proofCount !== null ? proofCount : "..."}
          </span>
          <span className="text-[11px] text-botchain-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-botchain-400 animate-ping" />
            Live from Botchain
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col">
          <span className="text-xs font-mono uppercase text-zinc-400">Target Blockchain</span>
          <span className="text-xl font-bold text-white mt-2">BotChain Mainnet</span>
          <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
            <span className="text-zinc-400">Chain ID: {BOTCHAIN_CHAIN_ID}</span>
            <span className="text-zinc-600">•</span>
            <a
              href={BOTCHAIN_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-botchain-400 hover:text-botchain-300 flex items-center gap-1 transition-colors font-semibold"
              title="Official BotChain Website (botchain.ai)"
            >
              <span>botchain.ai</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col">
          <span className="text-xs font-mono uppercase text-zinc-400">Hashing Standard</span>
          <span className="text-xl font-bold text-white mt-2 font-mono">SHA-256</span>
          <span className="text-[11px] text-zinc-400 mt-1">Client-Side Web Crypto API</span>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col">
          <span className="text-xs font-mono uppercase text-zinc-400">Smart Contract</span>
          <span className="text-sm font-mono text-botchain-300 mt-2 truncate">
            {contractAddress ? formatAddress(contractAddress) : "Configured"}
          </span>
          {contractAddress ? (
            <a
              href={getExplorerAddressUrl(contractAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 mt-1 transition-colors"
            >
              <span>View Contract on Explorer</span>
              <ExternalLink size={11} />
            </a>
          ) : (
            <span className="text-[11px] text-zinc-500 mt-1">Botchain Contract</span>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white tracking-tight">How BotProof Works</h2>
          <p className="text-sm text-zinc-400 mt-2">
            A three-step cryptographic anchoring process that guarantees authenticity without sacrificing privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-8 border border-white/5 relative group hover:border-botchain-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-botchain-500/10 text-botchain-400 flex items-center justify-center font-mono font-bold text-lg mb-6 border border-botchain-500/20">
              01
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Create & Fingerprint</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload any document locally. BotProof calculates its mathematical SHA-256 hash strictly inside your browser. The file itself never leaves your device.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-8 border border-white/5 relative group hover:border-botchain-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold text-lg mb-6 border border-cyan-500/20">
              02
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Anchor on Botchain</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The issuer signs an on-chain transaction registering the cryptographic hash, holder address, proof type, and immutable timestamp on BotChain.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-8 border border-white/5 relative group hover:border-botchain-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-mono font-bold text-lg mb-6 border border-purple-500/20">
              03
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Verify Instantly</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Anyone can verify authenticity in seconds—by Proof ID, QR Code, or by uploading the original file to compare hashes. No wallet connection required.
            </p>
          </div>
        </div>
      </section>

      {/* Proof Types Supported */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white tracking-tight">Supported Proof Use Cases</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Built for institutions, DAOs, bootcamps, and individual creators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {proofCategories.map((cat, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/5 flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/5 text-botchain-400 shrink-0">
                <Award size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{cat.name}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Guarantee Banner */}
      <section className="rounded-3xl p-8 bg-gradient-to-r from-cyan-950/40 via-botchain-950/20 to-black/60 border border-cyan-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Lock size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Absolute Document Privacy Guarantee
              </h3>
              <p className="text-xs text-zinc-300 mt-1.5 max-w-2xl leading-relaxed">
                Never upload sensitive documents to third-party storage unless you understand where they are stored and who can access them. BotProof's blockchain record contains only a cryptographic hash. The underlying document is never broadcasted to the network.
              </p>
            </div>
          </div>
          <Link
            href="/create-proof"
            className="glow-bot-btn px-6 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap"
          >
            Issue a Proof
          </Link>
        </div>
      </section>

      {/* Bottom Infrastructure Banner (KPI 3 Verification) */}
      <section
        id="bottom-infrastructure-banner"
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0c1424] via-[#080d18] to-[#050811] border border-botchain-500/30 relative overflow-hidden shadow-[0_0_50px_rgba(5,255,157,0.06)]"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-botchain-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-botchain-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-botchain-400">
                BotChain Network Infrastructure
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-botchain-500/10 text-botchain-300 border border-botchain-500/20">
                Mainnet (Chain ID: {BOTCHAIN_CHAIN_ID})
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Anchored Directly to BotChain Mainnet
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              BotProof runs natively on BotChain. Every cryptographic proof and revocation is permanently recorded on-chain with instant client-side verifiability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Clickable Website: botchain.ai */}
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              id="banner-botchain-website"
              className="glow-bot-btn px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-glow-bot cursor-pointer"
              title="Official BotChain Website"
            >
              <Globe size={14} />
              <span>Website: botchain.ai</span>
              <ExternalLink size={13} />
            </a>

            {/* Clickable Explorer: scan.botchain.ai */}
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              id="banner-botchain-explorer"
              className="glass-panel px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white hover:border-botchain-500/40 flex items-center gap-2 transition-all border border-white/10 cursor-pointer"
              title="BotChain Block Explorer"
            >
              <Layers size={14} className="text-botchain-400" />
              <span>Explorer: scan.botchain.ai</span>
              <ExternalLink size={13} />
            </a>

            {contractAddress && (
              <a
                href={getExplorerAddressUrl(contractAddress)}
                target="_blank"
                rel="noopener noreferrer"
                id="banner-contract-explorer"
                className="glass-panel px-4 py-2.5 rounded-xl text-xs font-mono text-zinc-300 hover:text-botchain-300 hover:border-botchain-500/40 flex items-center gap-2 transition-all border border-white/10 cursor-pointer"
                title="View Smart Contract on Explorer"
              >
                <ShieldCheck size={14} className="text-botchain-400" />
                <span>Contract: {formatAddress(contractAddress)}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Live Infrastructure Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/5 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-zinc-500 block text-[10px] uppercase">Official Website</span>
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-botchain-400 hover:text-botchain-300 font-semibold flex items-center gap-1 mt-1 transition-colors"
            >
              <span>botchain.ai</span>
              <ExternalLink size={11} />
            </a>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-zinc-500 block text-[10px] uppercase">Block Explorer</span>
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 hover:text-white flex items-center gap-1 mt-1 transition-colors"
            >
              <span>scan.botchain.ai</span>
              <ExternalLink size={11} />
            </a>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-zinc-500 block text-[10px] uppercase">RPC Endpoint</span>
            <span className="text-zinc-300 mt-1 block truncate">rpc.botchain.ai</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-zinc-500 block text-[10px] uppercase">Network Status</span>
            <span className="text-botchain-400 mt-1 flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-botchain-400" />
              Mainnet Active (677)
            </span>
          </div>
        </div>
      </section>
    </div>

  );
}
