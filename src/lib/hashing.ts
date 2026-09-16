/**
 * Client-side cryptographic hashing utilities using native Web Crypto API.
 * The file never leaves the user's browser, ensuring absolute privacy.
 */

export interface HashedDocument {
  hash: `0x${string}`;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

/**
 * Computes SHA-256 hash of an ArrayBuffer and converts to standard 0x-prefixed 32-byte hex string
 */
export async function hashBuffer(buffer: ArrayBuffer): Promise<`0x${string}`> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    throw new Error("Web Crypto API is not supported or not available in this environment.");
  }

  const digestBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(digestBuffer));
  const hexString = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `0x${hexString}` as `0x${string}`;
}

/**
 * Reads a File object and computes its SHA-256 hash
 */
export async function hashFile(file: File): Promise<HashedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const hash = await hashBuffer(arrayBuffer);

  return {
    hash,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    lastModified: file.lastModified,
  };
}

/**
 * Validates whether a given string is a valid bytes32 hex string
 */
export function isValidBytes32(str: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(str);
}
