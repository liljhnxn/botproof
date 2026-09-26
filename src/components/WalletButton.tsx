"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from "wagmi";
import { BOTCHAIN_CHAIN_ID } from "@/lib/config";
import { formatAddress } from "@/lib/format";
import { Wallet, LogOut, AlertTriangle, ChevronDown, Check } from "lucide-react";

export const WalletButton: React.FC = () => {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: balance } = useBalance({
    address,
    chainId: BOTCHAIN_CHAIN_ID,
  });

  const isWrongNetwork = isConnected && chainId !== BOTCHAIN_CHAIN_ID;

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => {
            const connector = connectors[0];
            if (connector) connect({ connector });
          }}
          disabled={isPending}
          className="glow-bot-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
        >
          <Wallet size={15} />
          <span>{isPending ? "Connecting..." : "Connect Wallet"}</span>
        </button>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <button
        onClick={() => switchChain({ chainId: BOTCHAIN_CHAIN_ID })}
        className="px-3.5 py-2 rounded-xl text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all"
      >
        <AlertTriangle size={15} className="text-rose-400 shrink-0" />
        <span>Switch to Botchain</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="px-3 py-1.5 rounded-xl glass-panel border border-botchain-500/30 hover:border-botchain-400 text-xs font-medium text-white flex items-center gap-2.5 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-botchain-400 animate-pulse" />
          <span className="text-zinc-300 hidden sm:inline">
            {balance ? `${parseFloat(balance.formatted).toFixed(3)} ${balance.symbol}` : "Botchain"}
          </span>
        </div>
        <span className="font-mono bg-black/40 px-2 py-0.5 rounded border border-white/5 text-botchain-300">
          {formatAddress(address)}
        </span>
        <ChevronDown size={14} className="text-zinc-400" />
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-white/10 shadow-2xl p-2 z-50 text-xs">
            <div className="p-3 border-b border-white/5">
              <p className="text-zinc-500 text-[11px]">Connected Wallet</p>
              <p className="font-mono text-zinc-200 mt-0.5 break-all select-all text-xs">{address}</p>
              <div className="flex items-center gap-1 text-[11px] text-botchain-400 mt-2 font-medium">
                <Check size={12} />
                <span>BotChain Mainnet (968)</span>
              </div>
            </div>

            <button
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={14} />
              <span>Disconnect</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
