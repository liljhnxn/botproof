"use client";

import React, { useState } from "react";
import { DocumentUploader } from "@/components/DocumentUploader";
import { HashedDocument } from "@/lib/hashing";
import { getProofById, ProofRecord } from "@/lib/contract";
import { ProofStatus } from "@/components/ProofStatus";
import { formatAddress, formatTimestamp, formatHash } from "@/lib/format";
import { HashDisplay } from "@/components/HashDisplay";
import Link from "next/link";
import {
  Shield,
  Search,
  FileCheck2,
  FileX2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Hash,
  FileUp,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

export default function VerifyPage() {
  const [activeTab, setActiveTab] = useState<"id" | "document">("id");

  // Method 1: Verify by ID
  const [proofIdInput, setProofIdInput] = useState("");
  const [isSearchingId, setIsSearchingId] = useState(false);
  const [idQueryResult, setIdQueryResult] = useState<{
    searched: boolean;
    proof: ProofRecord | null;
  }>({ searched: false, proof: null });

  // Method 2: Verify by Document
  const [compareProofId, setCompareProofId] = useState("");
  const [uploadedDoc, setUploadedDoc] = useState<HashedDocument | null>(null);
  const [isComparingDoc, setIsComparingDoc] = useState(false);
  const [docCompareResult, setDocCompareResult] = useState<{
    searched: boolean;
    proof: ProofRecord | null;
    isMatch: boolean;
  }>({ searched: false, proof: null, isMatch: false });

  // Handle Verify by ID
  const handleVerifyById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofIdInput.trim()) return;

    setIsSearchingId(true);
    try {
      const idBigInt = BigInt(proofIdInput.trim());
      const proof = await getProofById(idBigInt);
      setIdQueryResult({ searched: true, proof });
    } catch (err) {
      console.error("Lookup failed:", err);
      setIdQueryResult({ searched: true, proof: null });
    } finally {
      setIsSearchingId(false);
    }
  };

  // Handle Verify by Document Upload
  const handleVerifyByDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedDoc || !compareProofId.trim()) return;

    setIsComparingDoc(true);
    try {
      const idBigInt = BigInt(compareProofId.trim());
      const proof = await getProofById(idBigInt);

      if (!proof) {
        setDocCompareResult({ searched: true, proof: null, isMatch: false });
      } else {
        const isMatch =
          proof.documentHash.toLowerCase() === uploadedDoc.hash.toLowerCase() && !proof.revoked;
        setDocCompareResult({ searched: true, proof, isMatch });
      }
    } catch (err) {
      console.error("Document verification error:", err);
      setDocCompareResult({ searched: true, proof: null, isMatch: false });
    } finally {
      setIsComparingDoc(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20">
            <Shield size={13} />
            <span>Wallet-less Public Verification</span>
          </div>
          <a
            href="https://botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-botchain-500/10 hover:bg-botchain-500/20 text-botchain-400 text-xs font-mono border border-botchain-500/25 transition-colors group cursor-pointer"
            title="Official BotChain Website (https://botchain.ai)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-botchain-400 animate-pulse" />
            <span>botchain.ai</span>
            <ExternalLink size={10} className="opacity-70 group-hover:opacity-100" />
          </a>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">VERIFY A PROOF</h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Check whether a digital document matches its original cryptographic record on Botchain.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-white/[0.03] p-1.5 border border-white/5 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("id")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "id"
              ? "bg-botchain-500/15 text-botchain-300 border border-botchain-500/30 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Search size={14} />
          <span>Verify by Proof ID</span>
        </button>

        <button
          onClick={() => setActiveTab("document")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "document"
              ? "bg-botchain-500/15 text-botchain-300 border border-botchain-500/30 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileUp size={14} />
          <span>Verify by Document</span>
        </button>
      </div>

      {/* TAB 1: VERIFY BY ID */}
      {activeTab === "id" && (
        <div className="space-y-6">
          <form onSubmit={handleVerifyById} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <label className="text-xs font-semibold text-zinc-300 block">
              Enter Proof Identifier
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="e.g. 1, 24, 108"
                value={proofIdInput}
                onChange={(e) => setProofIdInput(e.target.value)}
                className="flex-1 glass-input rounded-xl px-4 py-3 text-sm font-mono placeholder:text-zinc-600 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={isSearchingId || !proofIdInput.trim()}
                className="glow-bot-btn px-6 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {isSearchingId ? (
                  <span>Checking...</span>
                ) : (
                  <>
                    <Search size={14} />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              Directly queries BotChain for the on-chain proof record. No wallet needed.
            </p>
          </form>

          {/* Result for ID Query */}
          {idQueryResult.searched && (
            <div className="animate-fade-in">
              {idQueryResult.proof ? (
                <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-botchain-500/30 shadow-glow-bot space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs font-mono text-botchain-400 uppercase tracking-wider">
                        Blockchain Record Found
                      </span>
                      <h2 className="text-xl font-bold text-white mt-0.5">
                        Proof #{idQueryResult.proof.id.toString().padStart(3, "0")}
                      </h2>
                    </div>
                    <ProofStatus revoked={idQueryResult.proof.revoked} size="md" />
                  </div>

                  {idQueryResult.proof.revoked && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                      <span>
                        <strong>⚠ PROOF REVOKED:</strong> This proof was previously issued on Botchain but has been revoked by its issuer.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-zinc-500">Classification</span>
                      <p className="text-sm font-semibold text-white">
                        {idQueryResult.proof.proofType}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-zinc-500">Issued Timestamp</span>
                      <p className="text-sm font-medium text-zinc-200">
                        {formatTimestamp(idQueryResult.proof.issuedAt)}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-zinc-500">Issuer Address</span>
                      <p className="font-mono text-zinc-300 break-all">
                        {idQueryResult.proof.issuer}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-zinc-500">Holder Address</span>
                      <p className="font-mono text-zinc-300 break-all">
                        {idQueryResult.proof.holder}
                      </p>
                    </div>

                    <div className="sm:col-span-2 p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-zinc-500">Anchored Cryptographic Hash</span>
                      <p className="font-mono text-botchain-300 break-all select-all">
                        {idQueryResult.proof.documentHash}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link
                      href={`/verify/${idQueryResult.proof.id.toString()}`}
                      className="glow-bot-btn px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                    >
                      <span>Open Full Public Proof Card</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-3xl p-8 border border-white/10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center mx-auto">
                    <Search size={22} />
                  </div>
                  <h3 className="text-base font-semibold text-white">No Proof Found</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    No active record found for Proof ID #{proofIdInput} on BotChain. Please check the identifier.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VERIFY BY DOCUMENT */}
      {activeTab === "document" && (
        <div className="space-y-6">
          <form onSubmit={handleVerifyByDocument} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                1. Target Proof Identifier
              </label>
              <input
                type="number"
                min="1"
                placeholder="Enter Proof ID to compare against (e.g. 1)"
                value={compareProofId}
                onChange={(e) => setCompareProofId(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-3 text-xs sm:text-sm font-mono placeholder:text-zinc-600 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                2. Select Document to Test
              </label>
              <DocumentUploader
                onHashGenerated={(doc) => setUploadedDoc(doc)}
                isLoading={isComparingDoc}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isComparingDoc || !uploadedDoc || !compareProofId.trim()}
                className="glow-bot-btn px-6 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {isComparingDoc ? (
                  <span>Comparing Fingerprints...</span>
                ) : (
                  <>
                    <FileCheck2 size={15} />
                    <span>Compare Against Botchain Record</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Comparison Result */}
          {docCompareResult.searched && (
            <div className="animate-fade-in">
              {docCompareResult.isMatch ? (
                /* MATCH */
                <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-botchain-500/40 shadow-glow-bot space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-botchain-500/20 text-botchain-400 border border-botchain-500/30 shrink-0">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">✓ DOCUMENT VERIFIED</h2>
                      <p className="text-xs text-botchain-300 mt-1">
                        The uploaded document matches the cryptographic hash stored on Botchain.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-zinc-500">Proof Identifier</span>
                      <p className="text-base font-mono font-bold text-white">
                        #{docCompareResult.proof?.id.toString()}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-zinc-500">Proof Classification</span>
                      <p className="text-base font-semibold text-white">
                        {docCompareResult.proof?.proofType}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-zinc-500">Authorized Issuer</span>
                      <p className="font-mono text-zinc-300 break-all">
                        {docCompareResult.proof?.issuer}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-zinc-500">Anchoring Date</span>
                      <p className="text-zinc-200">
                        {formatTimestamp(docCompareResult.proof?.issuedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href={`/verify/${docCompareResult.proof?.id.toString()}`}
                      className="glow-bot-btn px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                    >
                      <span>View Public Certificate Page</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ) : (
                /* NO MATCH */
                <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-[0_0_25px_rgba(244,63,94,0.15)] space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                      <FileX2 size={32} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">✕ VERIFICATION FAILED</h2>
                      <p className="text-xs text-rose-300 mt-1">
                        This document does not match the cryptographic hash stored on-chain.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-zinc-500">Uploaded Document Hash</span>
                      <p className="font-mono text-rose-300 break-all">{uploadedDoc?.hash}</p>
                    </div>

                    {docCompareResult.proof && (
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <span className="text-zinc-500">On-Chain Proof #{compareProofId} Hash</span>
                        <p className="font-mono text-zinc-400 break-all">
                          {docCompareResult.proof.documentHash}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400">
                    <strong>Note:</strong> A verification failure does not necessarily mean the document is counterfeit or fraudulent. It indicates that the uploaded file's binary contents differ from the exact cryptographic fingerprint anchored in this proof record.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
