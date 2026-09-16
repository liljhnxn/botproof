import React from "react";
import { CheckCircle2, XCircle, Loader2, ArrowUpRight, ShieldCheck, Clock } from "lucide-react";
import { getExplorerTxUrl, formatHash } from "@/lib/format";

export type TxStep =
  | "idle"
  | "preparing"
  | "awaiting_wallet"
  | "pending"
  | "confirming"
  | "success"
  | "error";

interface TransactionStatusProps {
  step: TxStep;
  txHash?: string;
  errorMessage?: string;
  title?: string;
  onReset?: () => void;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  step,
  txHash,
  errorMessage,
  title = "Transaction Status",
  onReset,
}) => {
  if (step === "idle") return null;

  const stepDetails = {
    preparing: {
      label: "Preparing Transaction",
      desc: "Validating proof parameters and preparing data...",
      icon: <Clock className="text-cyan-400 animate-pulse" size={24} />,
    },
    awaiting_wallet: {
      label: "Awaiting Signature",
      desc: "Please confirm the transaction in your connected wallet...",
      icon: <Loader2 className="text-yellow-400 animate-spin" size={24} />,
    },
    pending: {
      label: "Submitting to Botchain",
      desc: "Broadcasting transaction to Botchain network...",
      icon: <Loader2 className="text-cyan-400 animate-spin" size={24} />,
    },
    confirming: {
      label: "Confirming on Botchain",
      desc: "Waiting for block confirmation on Botchain Testnet...",
      icon: <Loader2 className="text-botchain-400 animate-spin" size={24} />,
    },
    success: {
      label: "Transaction Confirmed!",
      desc: "The proof has been permanently anchored on Botchain.",
      icon: <CheckCircle2 className="text-botchain-400" size={28} />,
    },
    error: {
      label: "Transaction Failed",
      desc: errorMessage || "The transaction could not be completed.",
      icon: <XCircle className="text-rose-400" size={28} />,
    },
  };

  const current = stepDetails[step];

  return (
    <div className="rounded-2xl p-6 glass-panel border border-white/10 space-y-4 my-4">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
          {current.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-white">{current.label}</h4>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {step.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">{current.desc}</p>
        </div>
      </div>

      {txHash && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5 font-mono">
            <ShieldCheck size={14} className="text-botchain-400" />
            Tx: {formatHash(txHash, 10, 8)}
          </span>
          <a
            href={getExplorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-botchain-400 hover:text-botchain-300 font-medium transition-colors"
          >
            <span>View on Explorer</span>
            <ArrowUpRight size={13} />
          </a>
        </div>
      )}

      {step === "error" && onReset && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200 hover:text-white border border-white/10 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
