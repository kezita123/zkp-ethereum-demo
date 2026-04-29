# ZKP-Powered Healthcare AI Verifiable Inference

**Authors:** Kezita Jebastine, Jeslyn Liz Jacob

---

## Overview

This project implements a privacy-preserving framework for verifiable AI inference in healthcare using Zero-Knowledge Proofs anchored on the Ethereum blockchain.

---

## System Architecture

**Tier 1: AI Inference (Private)**
- Logistic Regression on Pima Diabetes Dataset
- Runs locally, patient data never leaves hospital

**Tier 2: ZKP Commitment Generation**
- SHA-256 hash of inference results
- Proves inference ran correctly without revealing data

**Tier 3: Blockchain Anchoring**
- ProofStorage.sol stores commitments on Ethereum
- Tamper-proof and auditable trail

---

## Quick Start

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- Ganache desktop app
- Git

### Step 1: Install Node Dependencies
npm install

### Step 2: Generate Healthcare AI Commitments
py healthcare_zkp.py

### Step 3: Start Ganache
Open Ganache desktop app -> Quick Start -> RPC at http://127.0.0.1:7545

### Step 4: Anchor Commitments on Blockchain
node standalone-batch.js

---

## Results

| Metric | Value |
|--------|-------|
| Contract Deployment Gas | ~158,653 |
| Avg Gas per storeProof | ~46,123 |
| Verification Success Rate | 100% |

---

## Repository Structure

- contracts/ProofStorage.sol - Smart contract
- healthcare_zkp.py - AI inference + ZKP generator
- standalone-batch.js - Blockchain anchoring script
- circuits/ageVerification.circom - ZKP circuit
- zkp_results.csv - Performance metrics
- blockchain_results.json - Gas cost data

---

## Technologies

- Python (AI inference)
- Solidity ^0.8.0
- Ethereum / Ganache
- Hardhat / ethers.js

---

## Links

GitHub Repository: https://github.com/kezita123/zkp-ethereum-demo
