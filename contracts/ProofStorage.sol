// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ProofStorage
/// @notice On-chain proof anchoring for verifiable clinical AI
/// @dev Tier 3 of the BRAINS 2026 three-tier framework
/// @author Kezita Jebastine, Jeslyn Liz Jacob
contract ProofStorage is Ownable {
/// @notice Constructor sets the deployer as the contract owner
    constructor() Ownable(msg.sender) {}
    /// @notice Maps commitment hash to storage status
    mapping(bytes32 => bool) public proofs;
    
    /// @notice Tracks all commitments per user for audit trail
    mapping(address => bytes32[]) public userProofs;
    
    /// @notice Emitted when a new proof commitment is anchored
    /// @param user The address that submitted the proof
    /// @param commitment The bytes32 commitment hash
    event ProofStored(address indexed user, bytes32 commitment);

    /// @notice Anchors a ZKP commitment on-chain (owner-only)
    /// @dev Only the contract owner (hospital/clinic) can store proofs
    /// @param _commitment The SHA-256 commitment hash of the proof
    function storeProof(bytes32 _commitment) external onlyOwner {
        require(!proofs[_commitment], "ProofStorage: commitment already exists");
        proofs[_commitment] = true;
        userProofs[msg.sender].push(_commitment);
        emit ProofStored(msg.sender, _commitment);
    }

    /// @notice Verifies if a proof commitment exists on-chain
    /// @dev Read-only function, callable by anyone (auditors, patients)
    /// @param _commitment The commitment hash to verify
    /// @return True if the commitment was previously anchored
    function verifyProof(bytes32 _commitment) external view returns (bool) {
        return proofs[_commitment];
    }

    /// @notice Returns all proof commitments for an address
    /// @dev Useful for auditors to retrieve the full audit trail
    /// @param _user The address to query
    /// @return Array of bytes32 commitment hashes
    function getBatchProofs(address _user) external view returns (bytes32[] memory) {
        return userProofs[_user];
    }

    /// @notice Returns the total number of proofs stored by an address
    /// @param _user The address to query
    /// @return Count of stored proofs
    function getProofCount(address _user) external view returns (uint256) {
        return userProofs[_user].length;
    }
}
