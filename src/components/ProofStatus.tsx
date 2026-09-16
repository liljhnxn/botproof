import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface ProofStatusProps {
  revoked?: boolean;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const ProofStatus: React.FC<ProofStatusProps> = ({
  revoked = false,
  size = "md",
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: "text-xs px-2.5 py-1 gap-1.5",
    md: "text-sm px-3.5 py-1.5 gap-2",
    lg: "text-base px-4 py-2 gap-2.5 font-semibold",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  if (revoked) {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium border transition-all ${sizeClasses[size]} bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]`}
      >
        {showIcon && <XCircle size={iconSizes[size]} className="text-rose-400 shrink-0" />}
        <span>REVOKED</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border transition-all ${sizeClasses[size]} bg-botchain-500/10 text-botchain-400 border-botchain-500/30 shadow-[0_0_12px_rgba(5,255,157,0.2)]`}
    >
      {showIcon && <CheckCircle2 size={iconSizes[size]} className="text-botchain-400 shrink-0" />}
      <span>VERIFIED</span>
    </span>
  );
};
