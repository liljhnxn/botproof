"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProofById, ProofRecord, getContractAddress } from "@/lib/contract";
import { ProofStatus } from "@/components/ProofStatus";
import { QRCodeDisplay } from "@/components/QRCode";
import { DocumentUploader } from "@/components/DocumentUploader";
import { HashedDocument } from "@/lib/hashing";
import {
  formatAddress,
  formatTimestamp,
  formatHash,
  getExplorerAddressUrl,
} from "@/lib/format";
import { BOTCHAIN_CHAIN_ID } from "@/lib/config";
import Link from "next/link";
import {
  Shield,
  FileCheck,
  ExternalLink,
  Calendar,
  Layers,
  Award,
  Hash,
  Copy,
  Check,
  AlertTriangle,
  FileX,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function PublicProofPage() {
  const params = useParams();
  const idStr = params?.id as string;

  const [proof, setProof] = useState<ProofRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testDoc, setTestDoc] = useState<HashedDocument | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const contractAddress = getContractAddress();

  useEffect(() => {
    if (!idStr) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    try {
      const proofId = BigInt(idStr);
      getProofById(proofId)
        .then((result) => {
          if (!isMounted) return;
          if (result) {
            setProof(result);
          } else {
            setError(`Proof #${idStr} was not found on BotChain.`);
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error("Failed to query proof:", err);
          setError(`Unable to retrieve proof #${idStr} from Botchain RPC.`);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } catch (e) {
      setError("Invalid proof identifier format.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [idStr]);

  const handleCopyHash = () => {
    if (!proof?.documentHash) return;
    navigator.clipboard.writeText(proof.documentHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isDocMatch =
    testDoc && proof
      ? testDoc.hash.toLowerCase() === proof.documentHash.toLowerCase() && !proof.revoked
      : null;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/verify"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Verification Hub</span>
        </Link>
        <span className="text-[11px] font-mono text-zinc-500">
          BotChain (Chain ID: {BOTCHAIN_CHAIN_ID})
        </span>
      </div>

      {loading ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-botchain-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-medium text-white">
            Querying proof #{idStr} on Botchain...
          </p>
          <p className="text-xs text-zinc-400">Verifying cryptographic hash on-chain</p>
        </div>
      ) : error || !proof ? (
        <div className="glass-panel rounded-3xl p-10 text-center space-y-4 border border-rose-500/20">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <FileX size={28} />
          </div>
          <h2 className="text-xl font-bold text-white">Record Not Found</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">{error}</p>
          <div className="pt-2">
            <Link
              href="/verify"
              className="glow-bot-btn px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <span>Search Other Proofs</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Main Verified Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Ambient Corner Glow */}
            <div
              className={`absolute top-0 right-0 w-80 h-80 blur-3xl pointer-events-none -z-10 ${
                proof.revoked ? "bg-rose-500/15" : "bg-botchain-500/15"
              }`}
            />

            {/* Top Bar: Brand & Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <Shield size={24} className={proof.revoked ? "text-rose-400" : "text-botchain-400"} />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                    BOTPROOF VERIFICATION PROTOCOL
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {proof.proofType || "Digital Credential"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                  #{proof.id.toString().padStart(3, "0")}
                </span>
                <ProofStatus revoked={proof.revoked} size="lg" />
              </div>
            </div>

            {/* Revoked Warning Banner */}
            {proof.revoked && (
              <div className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-3">
                <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-200">⚠ REVOKED PROOF</p>
                  <p className="mt-0.5 text-zinc-300">
                    This proof was previously issued on Botchain but has been revoked by its authorized issuer. It is no longer valid.
                  </p>
                </div>
              </div>
            )}

            {/* Proof Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Award size={14} className="text-botchain-400" />
                  Authorized Issuer
                </span>
                <p className="font-mono text-zinc-200 break-all select-all text-xs">
                  {proof.issuer}
                </p>
                {contractAddress && (
                  <a
                    href={getExplorerAddressUrl(proof.issuer)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-zinc-500 hover:text-botchain-400 inline-flex items-center gap-1 transition-colors pt-1"
                  >
                    <span>View Issuer on Explorer</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Shield size={14} className="text-botchain-400" />
                  Recipient (Holder)
                </span>
                <p className="font-mono text-zinc-200 break-all select-all text-xs">
                  {proof.holder}
                </p>
                {contractAddress && (
                  <a
                    href={getExplorerAddressUrl(proof.holder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-zinc-500 hover:text-botchain-400 inline-flex items-center gap-1 transition-colors pt-1"
                  >
                    <span>View Holder on Explorer</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Calendar size={14} className="text-botchain-400" />
                  Issuance Date
                </span>
                <p className="text-sm font-medium text-zinc-200">
                  {formatTimestamp(proof.issuedAt)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Layers size={14} className="text-botchain-400" />
                  Anchor Blockchain
                </span>
                <p className="text-sm font-medium text-white">
                  BotChain Mainnet (968)
                </p>
              </div>

              {/* Document Hash Box */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-black/50 border border-botchain-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                    <Hash size={14} className="text-botchain-400" />
                    Cryptographic Fingerprint (SHA-256)
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedHash ? (
                      <>
                        <Check size={12} className="text-botchain-400" />
                        <span className="text-botchain-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Hash</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-xs sm:text-sm text-botchain-300 break-all select-all">
                  {proof.documentHash}
                </p>
              </div>

              {/* Metadata URI if available */}
              {proof.metadataURI && (
                <div className="md:col-span-2 p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-zinc-500">Public Metadata URI</span>
                  <p className="font-mono text-xs text-zinc-300 break-all">{proof.metadataURI}</p>
                </div>
              )}
            </div>

            {/* Contract info bar */}
            {contractAddress && (
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                <span className="font-mono">
                  Contract: {formatAddress(contractAddress)}
                </span>
                <a
                  href={getExplorerAddressUrl(contractAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-botchain-400 hover:text-botchain-300 font-medium transition-colors"
                >
                  <span>Verify on Botchain Explorer</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          {/* Verification QR Code & Instant Document Verification Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Code Section */}
            {typeof window !== "undefined" && (
              <QRCodeDisplay
                url={`${window.location.origin}/verify/${proof.id.toString()}`}
                proofId={proof.id.toString()}
                title="Scan to Verify Credential"
              />
            )}

            {/* Instant Document Match Test */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <FileCheck size={16} className="text-botchain-400" />
                  <span>Verify Your Copy of This Document</span>
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Select your local copy to instantly verify whether its SHA-256 fingerprint matches this exact on-chain proof.
                </p>

                <DocumentUploader onHashGenerated={(doc) => setTestDoc(doc)} />
              </div>

              {testDoc && (
                <div className="pt-2">
                  {isDocMatch ? (
                    <div className="p-3.5 rounded-xl bg-botchain-500/10 border border-botchain-500/30 text-xs text-botchain-300 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-botchain-400 shrink-0" />
                      <span>
                        <strong>✓ EXACT MATCH:</strong> Your local file matches the cryptographic fingerprint on Botchain.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-rose-400 shrink-0" />
                      <span>
                        <strong>✕ NO MATCH:</strong> The uploaded file differs from the hash recorded in proof #{proof.id.toString()}.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
