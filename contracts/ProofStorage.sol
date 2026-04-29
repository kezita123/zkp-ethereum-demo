// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProofStorage {
    mapping(bytes32 => bool) public proofs;
    event ProofStored(address indexed user, bytes32 commitment);

    function storeProof(bytes32 _commitment) external {
        require(!proofs[_commitment], "Proof already exists");
        proofs[_commitment] = true;
        emit ProofStored(msg.sender, _commitment);
    }

    function verifyProof(bytes32 _commitment) external view returns (bool) {
        return proofs[_commitment];
    }
}