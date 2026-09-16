import React, { useState } from "react";
import { Copy, Check, ShieldCheck } from "lucide-react";
import { formatHash } from "@/lib/format";

interface HashDisplayProps {
  hash: string;
  label?: string;
  truncate?: boolean;
  className?: string;
}

export const HashDisplay: React.FC<HashDisplayProps> = ({
  hash,
  label = "SHA-256 Fingerprint",
  truncate = false,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl bg-black/40 border border-white/10 p-3.5 ${className}`}>
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck size={14} className="text-botchain-400" />
          {label}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-botchain-400" />
              <span className="text-botchain-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="font-mono text-xs text-botchain-300 break-all select-all">
        {truncate ? formatHash(hash, 16, 12) : hash}
      </div>
    </div>
  );
};
