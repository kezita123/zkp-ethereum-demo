# ZKP Proof Anchoring on Ethereum

## Overview
This project demonstrates anchoring Zero-Knowledge Proof (ZKP) commitments on the Ethereum blockchain using a Solidity smart contract.

## Smart Contract: ProofStorage
- `storeProof(bytes32 _commitment)` - Anchors a ZKP commitment on-chain
- `verifyProof(bytes32 _commitment)` - Verifies if a commitment exists

## Deployment
Tested on:
- Ganache local network (port 7545)
- Remix VM

## ZKP Anchoring Flow
1. Generate ZK proof off-chain
2. Hash the proof → commitment
3. Call `storeProof(commitment)`
4. EVM executes SSTORE → state updated
5. Later verify with `verifyProof(commitment)`

## Technologies
- Solidity ^0.8.0
- Hardhat
- Ganache / Remix

## Author
[Your Name]
