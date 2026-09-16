import { BOTCHAIN_EXPLORER_URL } from "./config";

/**
 * Formats an Ethereum/Botchain address to short display format (e.g. 0x7A3...91B)
 */
export function formatAddress(address?: string | null): string {
  if (!address) return "—";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Formats a 32-byte hex hash to short display format (e.g. 83a1...9f20)
 */
export function formatHash(hash?: string | null, startChars: number = 8, endChars: number = 6): string {
  if (!hash) return "—";
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Formats a Unix timestamp (seconds or BigInt) to a formatted date string (e.g. 16 Sep 2026)
 */
export function formatTimestamp(timestamp?: number | bigint | null): string {
  if (!timestamp) return "—";
  const num = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  const date = new Date(num * 1000);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats bytes to human-readable size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Safely constructs explorer URL for transactions or addresses
 */
export function getExplorerTxUrl(txHash: string): string {
  const baseUrl = BOTCHAIN_EXPLORER_URL.replace(/\/$/, "");
  return `${baseUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  const baseUrl = BOTCHAIN_EXPLORER_URL.replace(/\/$/, "");
  return `${baseUrl}/address/${address}`;
}
