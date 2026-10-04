import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { BOTCHAIN_CHAIN_ID, BOTCHAIN_EXPLORER_URL, BOTCHAIN_WEBSITE_URL } from "@/lib/config";
import { ShieldCheck, ArrowUpRight, Globe } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "BOTPROOF — Decentralized Proof & Verification Protocol",
  description:
    "Prove It. Verify It. Trust the Chain. A decentralized verification protocol for creating and verifying tamper-evident digital proofs on Botchain.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "BOTPROOF — Decentralized Proof & Verification Protocol",
    description: "Prove It. Verify It. Trust the Chain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col bg-[#04060c] text-slate-100`}>
        <Web3Provider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-white/5 bg-[#030509]/90 pt-12 pb-8 text-xs text-zinc-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/5">
                {/* Col 1: Protocol Brand & Status */}
                <div className="space-y-3 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-botchain-400" />
                    <span className="font-bold tracking-wider text-white text-sm">BOTPROOF PROTOCOL</span>
                    <a
                      href={BOTCHAIN_WEBSITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-botchain-500/10 hover:bg-botchain-500/20 text-botchain-400 border border-botchain-500/30 transition-colors inline-flex items-center gap-1"
                      title="Visit official BotChain website"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-botchain-400 animate-pulse" />
                      <span>Mainnet (677)</span>
                      <ArrowUpRight size={10} />
                    </a>
                  </div>
                  <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                    Decentralized document fingerprinting and proof verification protocol natively deployed on BotChain Mainnet. Cryptographic certainty without third-party document exposure.
                  </p>
                </div>

                {/* Col 2: Protocol Applications */}
                <div className="space-y-2.5">
                  <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] font-mono">
                    Protocol &amp; Hub
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <Link href="/verify" className="hover:text-botchain-300 transition-colors">
                        Verify Proof
                      </Link>
                    </li>
                    <li>
                      <Link href="/create-proof" className="hover:text-botchain-300 transition-colors">
                        Issue Proof
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard" className="hover:text-botchain-300 transition-colors">
                        My Proofs
                      </Link>
                    </li>
                    <li>
                      <Link href="/issuer" className="hover:text-botchain-300 transition-colors">
                        Issuer Portal
                      </Link>
                    </li>
                    <li>
                      <Link href="/whitepaper.html" className="hover:text-botchain-300 transition-colors">
                        Whitepaper &amp; Deck
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Col 3: Network & Explorer (KPI 3 Verification) */}
                <div className="space-y-2.5">
                  <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                    <Globe size={13} className="text-botchain-400" />
                    <span>Network &amp; Explorer</span>
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <a
                        href={BOTCHAIN_WEBSITE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        id="footer-botchain-official"
                        className="inline-flex items-center gap-1 text-botchain-400 hover:text-botchain-300 font-semibold transition-colors group"
                        title="Official BotChain Website (https://botchain.ai)"
                      >
                        <span>BotChain Official (botchain.ai)</span>
                        <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    </li>
                    <li>
                      <a
                        href={BOTCHAIN_EXPLORER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        id="footer-botchain-explorer"
                        className="inline-flex items-center gap-1 text-zinc-300 hover:text-white transition-colors group"
                        title="BotChain Block Explorer (https://scan.botchain.ai)"
                      >
                        <span>BotChain Explorer (scan.botchain.ai)</span>
                        <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://rpc.botchain.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        <span>RPC: rpc.botchain.ai</span>
                      </a>
                    </li>
                    <li className="text-[11px] font-mono text-zinc-400">
                      Chain ID: {BOTCHAIN_CHAIN_ID} (Mainnet)
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Copyright & Disclaimer */}
              <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
                <p>
                  BotProof Protocol © {new Date().getFullYear()} • Anchored on BotChain Mainnet
                </p>
                <p className="max-w-xl text-center md:text-right">
                  BotProof does not prove that the underlying claims in a document are true. It proves that the document matches the cryptographic record created by the issuer and shows whether that proof has been revoked.
                </p>
              </div>
            </div>
          </footer>

        </Web3Provider>
      </body>
    </html>
  );
}
