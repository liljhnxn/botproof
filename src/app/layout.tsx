import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { BOTCHAIN_CHAIN_ID, BOTCHAIN_EXPLORER_URL } from "@/lib/config";
import { ShieldCheck, ArrowUpRight } from "lucide-react";

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
          <footer className="border-t border-white/5 bg-[#030509]/80 py-8 text-xs text-zinc-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-botchain-400" />
                <span className="font-semibold text-zinc-300">BOTPROOF PROTOCOL</span>
                <span>• BotChain Mainnet (Chain ID: {BOTCHAIN_CHAIN_ID})</span>
              </div>

              <div className="flex items-center gap-6">
                <Link href="/verify" className="hover:text-zinc-300 transition-colors">
                  Verify Proof
                </Link>
                <Link href="/create-proof" className="hover:text-zinc-300 transition-colors">
                  Issue Proof
                </Link>
                <Link href="/whitepaper.html" className="hover:text-zinc-300 transition-colors">
                  Whitepaper &amp; Deck
                </Link>
                <a
                  href={BOTCHAIN_EXPLORER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-botchain-400 hover:text-botchain-300 transition-colors"
                >
                  <span>Block Explorer</span>
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 pt-4 border-t border-white/5 text-[11px] text-zinc-600 text-center md:text-left">
              BotProof does not prove that the underlying claims in a document are true. It proves that the document matches the cryptographic record created by the issuer and shows whether that proof has been revoked.
            </div>
          </footer>
        </Web3Provider>
      </body>
    </html>
  );
}
