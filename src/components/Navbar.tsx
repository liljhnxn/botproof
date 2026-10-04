"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./WalletButton";
import { Shield, Menu, X, PlusCircle, CheckCircle2, UserCheck, Layers, FileText, Globe, ExternalLink } from "lucide-react";
import { BOTCHAIN_WEBSITE_URL } from "@/lib/config";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Overview", icon: Layers },
    { href: "/create-proof", label: "Create Proof", icon: PlusCircle },
    { href: "/verify", label: "Verify", icon: CheckCircle2 },
    { href: "/dashboard", label: "My Proofs", icon: UserCheck },
    { href: "/issuer", label: "Issuer Portal", icon: Shield },
    { href: "/whitepaper.html", label: "Deck & Docs", icon: FileText },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname !== "/") return false;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080c14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Linked Mainnet (677) Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-botchain-500 to-cyan-400 p-[1px] shadow-glow-bot">
              <div className="w-full h-full bg-[#0a0f1d] rounded-xl flex items-center justify-center">
                <Shield className="text-botchain-400 group-hover:scale-110 transition-transform duration-300" size={20} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-wider text-white flex items-center gap-1.5">
                BOTPROOF
              </span>
              <span className="text-[10px] text-zinc-400 tracking-wider font-mono">
                Botchain Verification Protocol
              </span>
            </div>
          </Link>

          {/* Linked Mainnet (677) Badge */}
          <a
            href={BOTCHAIN_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="navbar-mainnet-badge"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-botchain-500/10 hover:bg-botchain-500/20 text-botchain-400 border border-botchain-500/30 transition-all hover:scale-105 shadow-sm group"
            title="Official BotChain Mainnet (Chain ID: 677) - Click to open botchain.ai"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-botchain-400 animate-pulse" />
            <span>Mainnet (677)</span>
            <ExternalLink size={9} className="opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? "bg-botchain-500/15 text-botchain-300 border border-botchain-500/30 shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={14} className={active ? "text-botchain-400" : "text-zinc-400"} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Area: Clickable botchain.ai button & Wallet */}
        <div className="flex items-center gap-3">
          {/* Clickable botchain.ai button */}
          <a
            href={BOTCHAIN_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="navbar-botchain-button"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-botchain-500/10 hover:bg-botchain-500/20 text-xs font-medium text-botchain-300 hover:text-white border border-botchain-500/30 transition-all hover:shadow-[0_0_15px_rgba(5,255,157,0.2)] group"
            title="Visit official BotChain website (botchain.ai)"
          >
            <Globe size={13} className="text-botchain-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">botchain.ai</span>
            <ExternalLink size={11} className="text-botchain-400 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>

          <WalletButton />

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0f1d] px-4 py-4 space-y-2">
          {/* Mobile botchain.ai button and links */}
          <div className="pb-2 border-b border-white/5 flex flex-col gap-2">
            <a
              href={BOTCHAIN_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold bg-botchain-500/10 text-botchain-300 border border-botchain-500/25 hover:bg-botchain-500/20 transition-all"
            >
              <span className="flex items-center gap-2">
                <Globe size={14} className="text-botchain-400" />
                <span>Official Website: botchain.ai</span>
              </span>
              <ExternalLink size={12} className="text-botchain-400" />
            </a>
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium bg-white/[0.03] text-zinc-300 border border-white/5 hover:bg-white/5 transition-all"
            >
              <span className="flex items-center gap-2">
                <Layers size={14} className="text-botchain-400" />
                <span>BotChain Explorer: scan.botchain.ai</span>
              </span>
              <ExternalLink size={12} className="text-zinc-400" />
            </a>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-botchain-500/15 text-botchain-300 border border-botchain-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={16} className={active ? "text-botchain-400" : "text-zinc-400"} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

