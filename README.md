# 🚀 BOTPROOF — Decentralized Proof & Verification Protocol

> **Prove It. Verify It. Trust the Chain.**

A decentralized verification protocol for creating, managing, and verifying tamper-evident digital proofs directly on **BotChain Mainnet**.

BotProof allows universities, academies, hackathons, DAO governance councils, and corporate issuers to issue cryptographic credentials and authenticity certificates without ever exposing or storing private documents on the blockchain. Anyone with the original document or a Proof ID can verify authenticity in seconds without connecting a wallet.

---

## 📑 Table of Contents

- [Overview](#overview)
- [The Problem vs The Solution](#the-problem-vs-the-solution)
- [Protocol Architecture](#protocol-architecture)
- [Core User Roles](#core-user-roles)
- [Document Hashing & Privacy Guarantee](#document-hashing--privacy-guarantee)
- [Smart Contract Specification](#smart-contract-specification)
- [Tech Stack](#tech-stack)
- [Botchain Mainnet Configuration](#botchain-mainnet-configuration)
- [Installation & Setup](#installation--setup)
- [Running Hardhat Tests](#running-hardhat-tests)
- [Deployment Guide](#deployment-guide)
- [Verification Workflows](#verification-workflows)
- [Important Disclaimer](#important-disclaimer)
- [Future Roadmap](#future-roadmap)
- [Security & Privacy Principles](#security--privacy-principles)

---

## 💡 Overview

Digital certificates and verification systems today suffer from two main problems:
1. **Centralized silos**: When the issuing portal closes or an API breaks, credentials become unverifiable.
2. **Privacy breaches**: Storing sensitive PDFs or personally identifiable information (PII) on public distributed ledgers exposes user data permanently.

**BotProof solves both:** It anchors a 32-byte cryptographic SHA-256 fingerprint on Botchain. The actual document remains 100% on the user's local device, preserving confidentiality while providing mathematical certainty of authenticity.

---

## ⚖️ The Problem vs The Solution

| Traditional Digital Verification | BotProof Protocol |
| :--- | :--- |
| Centralized databases subject to tampering or downtime | Immutable on-chain records anchored on BotChain Mainnet |
| Private documents uploaded to external servers | Client-side SHA-256 calculation via Web Crypto API |
| Verifiers forced to create accounts or pay fees | Wallet-less public verification accessible to anyone |
| Revocations hidden or manipulated silently | On-chain revocation logs with permanent cryptographic audit trails |
| Slow manual checks | Instant verification via URL or QR Code |

---

## 🏗️ Protocol Architecture

```text
                  BOTPROOF ARCHITECTURE

          ┌──────────────────────────────────┐
          │     Document (PDF / Image)       │
          └────────────────┬─────────────────┘
                           ↓
     Browser Client-Side Web Crypto API (SHA-256)
                           ↓
             0x-prefixed bytes32 Hash
                           ↓
          ┌──────────────────────────────────┐
          │     BotProof Smart Contract      │
          │    BotChain Mainnet (ID: 677)    │
          └────────────────┬─────────────────┘
                           ↓
             Proof Record (Immutable)
             [ID, Issuer, Holder, Hash, ...]
                           ↓
          ┌──────────────────────────────────┐
          │   Verification Hub / QR Code     │
          │         /verify/[id]             │
          └────────────────┬─────────────────┘
                           ↓
           Public Verification (Wallet-less)
              ✓ MATCH  or  ✕ NO MATCH
```

---

## 👥 Core User Roles

### 1. Issuer
- Authorized entity (e.g., *Botchain Academy*, university, certifier).
- Connects wallet, uploads document to generate its SHA-256 fingerprint, inputs holder address, and executes `createProof()`.
- Possesses exclusive authority to revoke issued proofs via `revokeProof()`.

### 2. Holder
- Recipient wallet (e.g., student, employee, participant).
- Connects wallet to view credentials in **My Proofs Dashboard** (`/dashboard`).
- Can share their public verification link (`/verify/[id]`) or QR code.

### 3. Verifier
- Any individual, company, or third-party entity.
- **Does NOT need to connect a wallet.**
- Can verify either:
  1. By entering the **Proof ID** (`/verify/[id]`).
  2. By uploading their copy of the document to mathematically compare its hash against the on-chain record.

---

## 🔒 Document Hashing & Privacy Guarantee

> **Your document is never uploaded to the blockchain.**

BotProof executes all cryptographic operations inside the user's browser using the native **Web Crypto API**:

```typescript
const digestBuffer = await window.crypto.subtle.digest("SHA-256", fileArrayBuffer);
```

- No servers receive the file.
- The smart contract records only the resulting `bytes32` hash fingerprint.
- Even if the blockchain is public, no one can reconstruct the original document from its SHA-256 hash.

---

## 📜 Smart Contract Specification

Located at [`contracts/BotProof.sol`](file:///contracts/BotProof.sol):

### Proof Structure
```solidity
struct Proof {
    uint256 id;
    address issuer;
    address holder;
    bytes32 documentHash;
    string proofType;
    string metadataURI;
    uint256 issuedAt;
    bool revoked;
}
```

### Core Functions
- `createProof(address holder, bytes32 documentHash, string calldata proofType, string calldata metadataURI) external returns (uint256)`:
  Anchors a new proof. Validates non-zero addresses and hashes. Emits `ProofCreated`.
- `revokeProof(uint256 proofId) external`:
  Revokes an active proof. Only the original `issuer` can invoke. Emits `ProofRevoked`.
- `verifyProof(uint256 proofId, bytes32 documentHash) external view returns (bool)`:
  Returns `true` only if the proof exists, hash matches, and proof is not revoked.
- `getProof(uint256 proofId) external view returns (Proof memory)`:
  Retrieves full on-chain proof record.
- `getProofCount() external view returns (uint256)`:
  Returns total proofs anchored.
- `getHolderProofs(address holder) external view returns (uint256[] memory)`:
  Returns all proof IDs assigned to a holder address.
- `getIssuerProofs(address issuer) external view returns (uint256[] memory)`:
  Returns all proof IDs issued by an address.

---

## 💻 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom Web3 dark theme, glassmorphic UI, responsive layouts)
- **Web3 & Wallet**: [wagmi v2](https://wagmi.sh/), [viem v2](https://viem.sh/), [@tanstack/react-query](https://tanstack.com/query)
- **Smart Contracts**: [Solidity ^0.8.24](https://soliditylang.org/), [Hardhat](https://hardhat.org/)
- **QR Codes**: [qrcode.react](https://github.com/zpao/qrcode.react)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🌐 Botchain Mainnet Configuration

| Parameter | Value |
| :--- | :--- |
| **Network Name** | BotChain Mainnet |
| **Chain ID** | `677` |
| **RPC URL** | `https://rpc.botchain.ai` |
| **Block Explorer** | `https://scan.botchain.ai` |
| **Native Currency** | BOT (18 Decimals) |

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=677
NEXT_PUBLIC_BOTCHAIN_RPC_URL=https://rpc.botchain.ai
NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL=https://scan.botchain.ai

NEXT_PUBLIC_BOTPROOF_CONTRACT_ADDRESS=
DEPLOYER_PRIVATE_KEY=
```

---

## 🛠️ Installation & Setup

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. **Compile Smart Contracts**:
   ```bash
   npx hardhat compile
   ```

---

## 🧪 Running Hardhat Tests

The test suite covers creation, parameter validation, cryptographic verification, access-controlled revocation, and immutability:

```bash
npx hardhat test
```

Expected output:
```text
  BotProof Contract
    1. Creation
      ✔ should create a valid proof and emit ProofCreated event
      ✔ should increment proof IDs predictably
    2. Validation
      ✔ should reject zero holder address
      ✔ should reject zero document hash
      ✔ should reject empty proof type
      ✔ should reject querying non-existent proof ID
    3. Verification
      ✔ should return true when document hash matches and proof is active
      ✔ should return false when document hash does not match
      ✔ should return false for non-existent proof ID without reverting
      ✔ should return false after proof has been revoked
    4. Revocation
      ✔ should allow only original issuer to revoke and emit ProofRevoked
      ✔ should reject revocation from non-issuer
      ✔ should reject double revocation
      ✔ should reject revoking non-existent proof
      ✔ should preserve proof history permanently even after revocation
    5. Immutability & Indexing
      ✔ should preserve original data without alteration
      ✔ should return correct proofs for holder and issuer lists
```

---

## 🚀 Deployment Guide

### Deploying to Botchain Mainnet
1. Add your funded deployer private key to `.env.local`:
   ```env
   DEPLOYER_PRIVATE_KEY=0x...
   ```
2. Run deployment script:
   ```bash
   npx hardhat run scripts/deploy.ts --network botchain
   ```
3. The script automatically updates `src/contracts/botproof.ts` and `.env.local` with the new contract address.

### Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔍 Verification Workflows

### Method 1: Verification by Proof ID
1. Navigate to `/verify`.
2. Enter the numeric Proof ID (e.g. `1`).
3. View on-chain details, including issuer, holder, timestamp, and status.

### Method 2: Verification by Document Upload
1. Navigate to `/verify`.
2. Switch to **Verify by Document** tab.
3. Upload the document file. The browser computes `SHA-256(document)`.
4. Enter the targeted Proof ID.
5. BotProof compares both hashes and returns:
   - `✓ DOCUMENT VERIFIED`: Hashes match exactly.
   - `✕ VERIFICATION FAILED`: Hashes do not match.

---

## ⚠️ Important Disclaimer

> **BotProof does not prove that the underlying claims in a document are true.**  
> It proves that the document matches the cryptographic record created by the issuer and shows whether that proof has been revoked.

This distinction is crucial: The protocol mathematically guarantees that a document was not tampered with after being anchored by the issuer; it does not replace real-world due diligence regarding an issuer's accreditation.

---

## 🗺️ Future Roadmap

```text
Phase 1 (Completed)
✓ Client-side document hashing via Web Crypto API
✓ On-chain proof creation on BotChain Mainnet
✓ Read-only wallet-less verification hub
✓ Issuer revocation mechanism
✓ QR Code generation and export

Phase 2
□ BotNS identity resolution (e.g. john.bot)
□ Public issuer verification badges
□ Decentralized IPFS/Arweave metadata anchoring

Phase 3
□ W3C Verifiable Credentials compliance
□ Delegated multi-sig issuers
□ Expiring credentials support

Phase 4
□ Cross-platform verification SDK
□ Mobile verification application
□ Enterprise audit suite
```

---

## 🛡️ Security & Privacy Principles

1. **Never store private documents on-chain.**
2. **Never store passwords, emails, or personal contact info on-chain.**
3. **Always compute cryptographic hashes client-side in the browser.**
4. **Proofs are immutable after creation.**
5. **Only the original issuer wallet can revoke a proof.**
6. **Revocations are permanent and transparent—no history erasing.**
7. **Read-only verification is free and requires zero wallet connection.**
