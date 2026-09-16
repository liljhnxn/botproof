import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { BotProof } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BotProof Contract", function () {
  let botProof: BotProof;
  let issuer: SignerWithAddress;
  let holder: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  const sampleDocHash = ethers.keccak256(ethers.toUtf8Bytes("Sample Academic Certificate"));
  const sampleProofType = "Certificate";
  const sampleMetadataURI = "ipfs://QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx";

  beforeEach(async function () {
    [issuer, holder, otherAccount] = await ethers.getSigners();
    const BotProofFactory = await ethers.getContractFactory("BotProof");
    botProof = (await BotProofFactory.deploy()) as BotProof;
    await botProof.waitForDeployment();
  });

  describe("1. Creation", function () {
    it("should create a valid proof and emit ProofCreated event", async function () {
      const tx = await botProof.connect(issuer).createProof(
        holder.address,
        sampleDocHash,
        sampleProofType,
        sampleMetadataURI
      );

      await expect(tx)
        .to.emit(botProof, "ProofCreated")
        .withArgs(1, issuer.address, holder.address, sampleDocHash, sampleProofType, sampleMetadataURI);

      const proof = await botProof.getProof(1);
      expect(proof.id).to.equal(1);
      expect(proof.issuer).to.equal(issuer.address);
      expect(proof.holder).to.equal(holder.address);
      expect(proof.documentHash).to.equal(sampleDocHash);
      expect(proof.proofType).to.equal(sampleProofType);
      expect(proof.metadataURI).to.equal(sampleMetadataURI);
      expect(proof.revoked).to.equal(false);
      expect(proof.issuedAt).to.be.gt(0);

      expect(await botProof.getProofCount()).to.equal(1);
    });

    it("should increment proof IDs predictably", async function () {
      await botProof.connect(issuer).createProof(holder.address, sampleDocHash, "Type 1", "");
      await botProof.connect(issuer).createProof(holder.address, sampleDocHash, "Type 2", "");
      await botProof.connect(otherAccount).createProof(holder.address, sampleDocHash, "Type 3", "");

      expect(await botProof.getProofCount()).to.equal(3);

      const proof1 = await botProof.getProof(1);
      const proof2 = await botProof.getProof(2);
      const proof3 = await botProof.getProof(3);

      expect(proof1.id).to.equal(1);
      expect(proof2.id).to.equal(2);
      expect(proof3.id).to.equal(3);
    });
  });

  describe("2. Validation", function () {
    it("should reject zero holder address", async function () {
      await expect(
        botProof.connect(issuer).createProof(ethers.ZeroAddress, sampleDocHash, sampleProofType, "")
      ).to.be.revertedWithCustomError(botProof, "ZeroAddress");
    });

    it("should reject zero document hash", async function () {
      await expect(
        botProof.connect(issuer).createProof(holder.address, ethers.ZeroHash, sampleProofType, "")
      ).to.be.revertedWithCustomError(botProof, "ZeroHash");
    });

    it("should reject empty proof type", async function () {
      await expect(
        botProof.connect(issuer).createProof(holder.address, sampleDocHash, "", "")
      ).to.be.revertedWithCustomError(botProof, "EmptyProofType");
    });

    it("should reject querying non-existent proof ID", async function () {
      await expect(botProof.getProof(0)).to.be.revertedWithCustomError(botProof, "ProofNotFound");
      await expect(botProof.getProof(999)).to.be.revertedWithCustomError(botProof, "ProofNotFound");
    });
  });

  describe("3. Verification", function () {
    beforeEach(async function () {
      await botProof.connect(issuer).createProof(
        holder.address,
        sampleDocHash,
        sampleProofType,
        sampleMetadataURI
      );
    });

    it("should return true when document hash matches and proof is active", async function () {
      const isValid = await botProof.verifyProof(1, sampleDocHash);
      expect(isValid).to.be.true;
    });

    it("should return false when document hash does not match", async function () {
      const fakeHash = ethers.keccak256(ethers.toUtf8Bytes("Tampered Certificate"));
      const isValid = await botProof.verifyProof(1, fakeHash);
      expect(isValid).to.be.false;
    });

    it("should return false for non-existent proof ID without reverting", async function () {
      const isValid = await botProof.verifyProof(999, sampleDocHash);
      expect(isValid).to.be.false;
    });

    it("should return false after proof has been revoked", async function () {
      await botProof.connect(issuer).revokeProof(1);
      const isValid = await botProof.verifyProof(1, sampleDocHash);
      expect(isValid).to.be.false;
    });
  });

  describe("4. Revocation", function () {
    beforeEach(async function () {
      await botProof.connect(issuer).createProof(
        holder.address,
        sampleDocHash,
        sampleProofType,
        sampleMetadataURI
      );
    });

    it("should allow only original issuer to revoke and emit ProofRevoked", async function () {
      const tx = await botProof.connect(issuer).revokeProof(1);
      await expect(tx)
        .to.emit(botProof, "ProofRevoked")
        .withArgs(1, issuer.address);

      const proof = await botProof.getProof(1);
      expect(proof.revoked).to.be.true;
    });

    it("should reject revocation from non-issuer", async function () {
      await expect(
        botProof.connect(otherAccount).revokeProof(1)
      ).to.be.revertedWithCustomError(botProof, "NotIssuer");

      await expect(
        botProof.connect(holder).revokeProof(1)
      ).to.be.revertedWithCustomError(botProof, "NotIssuer");
    });

    it("should reject double revocation", async function () {
      await botProof.connect(issuer).revokeProof(1);
      await expect(
        botProof.connect(issuer).revokeProof(1)
      ).to.be.revertedWithCustomError(botProof, "AlreadyRevoked");
    });

    it("should reject revoking non-existent proof", async function () {
      await expect(
        botProof.connect(issuer).revokeProof(999)
      ).to.be.revertedWithCustomError(botProof, "ProofNotFound");
    });

    it("should preserve proof history permanently even after revocation", async function () {
      await botProof.connect(issuer).revokeProof(1);
      const proof = await botProof.getProof(1);
      expect(proof.id).to.equal(1);
      expect(proof.issuer).to.equal(issuer.address);
      expect(proof.holder).to.equal(holder.address);
      expect(proof.documentHash).to.equal(sampleDocHash);
      expect(proof.revoked).to.be.true;
    });
  });

  describe("5. Immutability & Indexing", function () {
    it("should preserve original data without alteration", async function () {
      await botProof.connect(issuer).createProof(
        holder.address,
        sampleDocHash,
        sampleProofType,
        sampleMetadataURI
      );

      const proofBefore = await botProof.getProof(1);
      // Attempt another transaction that shouldn't mutate proof 1
      await botProof.connect(otherAccount).createProof(
        otherAccount.address,
        ethers.keccak256(ethers.toUtf8Bytes("Other Doc")),
        "Other Type",
        ""
      );

      const proofAfter = await botProof.getProof(1);
      expect(proofAfter.issuer).to.equal(proofBefore.issuer);
      expect(proofAfter.holder).to.equal(proofBefore.holder);
      expect(proofAfter.documentHash).to.equal(proofBefore.documentHash);
      expect(proofAfter.proofType).to.equal(proofBefore.proofType);
      expect(proofAfter.issuedAt).to.equal(proofBefore.issuedAt);
    });

    it("should return correct proofs for holder and issuer lists", async function () {
      await botProof.connect(issuer).createProof(holder.address, sampleDocHash, "Proof 1", "");
      await botProof.connect(issuer).createProof(holder.address, sampleDocHash, "Proof 2", "");
      await botProof.connect(otherAccount).createProof(holder.address, sampleDocHash, "Proof 3", "");
      await botProof.connect(issuer).createProof(otherAccount.address, sampleDocHash, "Proof 4", "");

      const holderProofIds = await botProof.getHolderProofs(holder.address);
      expect(holderProofIds.map(id => Number(id))).to.deep.equal([1, 2, 3]);

      const issuerProofIds = await botProof.getIssuerProofs(issuer.address);
      expect(issuerProofIds.map(id => Number(id))).to.deep.equal([1, 2, 4]);

      const otherIssuerProofIds = await botProof.getIssuerProofs(otherAccount.address);
      expect(otherIssuerProofIds.map(id => Number(id))).to.deep.equal([3]);
    });
  });
});
