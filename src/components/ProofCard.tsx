import React from "react";
import Link from "next/link";
import { ProofStatus } from "./ProofStatus";
import { formatAddress, formatTimestamp, formatHash } from "@/lib/format";
import { ArrowUpRight, Copy, Check, FileCheck, Hash } from "lucide-react";
import { useState } from "react";

export interface ProofCardData {
  id: bigint | number;
  issuer: string;
  holder: string;
  documentHash: string;
  proofType: string;
  metadataURI?: string;
  issuedAt: bigint | number;
  revoked: boolean;
}

interface ProofCardProps {
  proof: ProofCardData;
  showHolder?: boolean;
}

export const ProofCard: React.FC<ProofCardProps> = ({ proof, showHolder = false }) => {
  const [copied, setCopied] = useState(false);
  const proofIdStr = proof.id.toString();

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/verify/${proofIdStr}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between relative group border border-white/5 hover:border-botchain-500/30 transition-all duration-300">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <ProofStatus revoked={proof.revoked} size="sm" />
          <span className="text-xs font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
            #{proofIdStr.padStart(3, "0")}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-botchain-400 mb-1 tracking-wider uppercase">
            <FileCheck size={14} />
            <span>{proof.proofType || "Digital Proof"}</span>
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-botchain-300 transition-colors line-clamp-2">
            Proof #{proofIdStr}
          </h3>
        </div>

        <div className="space-y-2.5 text-xs text-zinc-400 border-t border-white/5 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Issued by:</span>
            <span className="font-mono text-zinc-300 bg-black/30 px-2 py-0.5 rounded">
              {formatAddress(proof.issuer)}
            </span>
          </div>

          {showHolder && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Recipient:</span>
              <span className="font-mono text-zinc-300 bg-black/30 px-2 py-0.5 rounded">
                {formatAddress(proof.holder)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Issued on:</span>
            <span className="text-zinc-300">{formatTimestamp(proof.issuedAt)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-500 flex items-center gap-1">
              <Hash size={12} /> Hash:
            </span>
            <span className="font-mono text-zinc-400">
              {formatHash(proof.documentHash, 6, 4)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2">
        <Link
          href={`/verify/${proofIdStr}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-botchain-500/20 text-xs font-medium text-white hover:text-botchain-300 border border-white/10 hover:border-botchain-500/30 transition-all"
        >
          <span>View Proof</span>
          <ArrowUpRight size={14} />
        </Link>
        <button
          onClick={handleCopyLink}
          title="Copy Verification URL"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-colors"
        >
          {copied ? <Check size={14} className="text-botchain-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
};
