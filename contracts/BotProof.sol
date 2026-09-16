// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BotProof
 * @dev Decentralized Proof & Verification Protocol for creating and verifying tamper-evident digital proofs on Botchain.
 * Stores cryptographic hashes and metadata anchored on-chain without storing private documents directly.
 */
contract BotProof {
    // Custom Errors
    error ZeroAddress();
    error ZeroHash();
    error EmptyProofType();
    error ProofNotFound(uint256 proofId);
    error NotIssuer(address caller, address actualIssuer);
    error AlreadyRevoked(uint256 proofId);

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

    // State Variables
    uint256 private _proofCount;
    mapping(uint256 => Proof) private _proofs;
    mapping(address => uint256[]) private _holderProofs;
    mapping(address => uint256[]) private _issuerProofs;

    // Events
    event ProofCreated(
        uint256 indexed proofId,
        address indexed issuer,
        address indexed holder,
        bytes32 documentHash,
        string proofType,
        string metadataURI
    );

    event ProofRevoked(
        uint256 indexed proofId,
        address indexed issuer
    );

    /**
     * @notice Creates a new tamper-evident proof anchored to a document hash
     * @param holder Address of the recipient/holder of the proof
     * @param documentHash Cryptographic SHA-256 hash of the original document
     * @param proofType Category or title of the proof (e.g., Certificate, Achievement, Skill)
     * @param metadataURI Optional URI containing public metadata
     * @return proofId The unique identifier assigned to the created proof
     */
    function createProof(
        address holder,
        bytes32 documentHash,
        string calldata proofType,
        string calldata metadataURI
    ) external returns (uint256) {
        if (holder == address(0)) revert ZeroAddress();
        if (documentHash == bytes32(0)) revert ZeroHash();
        if (bytes(proofType).length == 0) revert EmptyProofType();

        unchecked {
            _proofCount++;
        }
        uint256 proofId = _proofCount;

        Proof storage newProof = _proofs[proofId];
        newProof.id = proofId;
        newProof.issuer = msg.sender;
        newProof.holder = holder;
        newProof.documentHash = documentHash;
        newProof.proofType = proofType;
        newProof.metadataURI = metadataURI;
        newProof.issuedAt = block.timestamp;
        newProof.revoked = false;

        _holderProofs[holder].push(proofId);
        _issuerProofs[msg.sender].push(proofId);

        emit ProofCreated(
            proofId,
            msg.sender,
            holder,
            documentHash,
            proofType,
            metadataURI
        );

        return proofId;
    }

    /**
     * @notice Revokes a previously issued proof. Only the original issuer can revoke.
     * @param proofId Unique identifier of the proof to revoke
     */
    function revokeProof(uint256 proofId) external {
        if (proofId == 0 || proofId > _proofCount) {
            revert ProofNotFound(proofId);
        }

        Proof storage proof = _proofs[proofId];
        if (proof.issuer != msg.sender) {
            revert NotIssuer(msg.sender, proof.issuer);
        }
        if (proof.revoked) {
            revert AlreadyRevoked(proofId);
        }

        proof.revoked = true;

        emit ProofRevoked(proofId, msg.sender);
    }

    /**
     * @notice Verifies whether a document matches an existing, unrevoked proof
     * @param proofId Unique identifier of the proof
     * @param documentHash Cryptographic hash to verify against the on-chain record
     * @return bool True if proof exists, matches the document hash, and is not revoked
     */
    function verifyProof(
        uint256 proofId,
        bytes32 documentHash
    ) external view returns (bool) {
        if (proofId == 0 || proofId > _proofCount) {
            return false;
        }

        Proof storage proof = _proofs[proofId];
        if (proof.revoked) {
            return false;
        }

        return proof.documentHash == documentHash;
    }

    /**
     * @notice Retrieves full proof details by ID
     * @param proofId Unique identifier of the proof
     * @return Proof struct containing all proof attributes
     */
    function getProof(uint256 proofId) external view returns (Proof memory) {
        if (proofId == 0 || proofId > _proofCount) {
            revert ProofNotFound(proofId);
        }
        return _proofs[proofId];
    }

    /**
     * @notice Returns total number of proofs issued
     * @return Total count of proofs
     */
    function getProofCount() external view returns (uint256) {
        return _proofCount;
    }

    /**
     * @notice Returns an array of proof IDs issued to a specific holder
     * @param holder Address of the holder
     * @return Array of proof IDs
     */
    function getHolderProofs(address holder) external view returns (uint256[] memory) {
        return _holderProofs[holder];
    }

    /**
     * @notice Returns an array of proof IDs created by a specific issuer
     * @param issuer Address of the issuer
     * @return Array of proof IDs
     */
    function getIssuerProofs(address issuer) external view returns (uint256[] memory) {
        return _issuerProofs[issuer];
    }
}
