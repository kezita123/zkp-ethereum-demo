# Three-Tier ZK-SNARK Framework for Verifiable and GDPR-Compliant Clinical AI

## Overview

This project implements a privacy-preserving framework for verifiable AI inference in healthcare using Zero-Knowledge Proof commitments anchored on the Ethereum blockchain.

## Problem Statement

When hospitals use AI for diagnosis, there is no way to prove that:
- The correct model ran on the data
- The real patient data was used
- The output was not tampered with

This framework provides cryptographic proof of correct AI inference without revealing patient data or model weights.

---

## Framework Architecture

Tier 1: Identity Layer (SSI) — Hyperledger Indy/Aries
DIDs + Verifiable Credentials — Patient identity verified off-chain
|
v
Tier 2: AI Inference + ZKP — Logistic Regression + Groth16 zk-SNARK
diabetesClassifier.circom — Proves classification without revealing data
|
v
Tier 3: Blockchain Anchoring (EVM)
ProofStorage.sol — storeProof(commitment) — Tamper-proof, auditable, immutable

---

## Repository Structure

circuits/
  diabetesClassifier.circom — Groth16 zk-SNARK circuit
  README.md — Circuit documentation
contracts/
  ProofStorage.sol — Ownable + NatSpec + audit trail
scripts/
  deploy.js
  storeProof_batch.js
ssi_layer.py — Tier 1: DID + VC simulation
healthcare_zkp.py — Tier 2: AI classifier + ZKP
REPRODUCIBILITY.md — Step-by-step guide
requirements.txt
.env.example
.gitignore
LICENSE

---

## Quick Start

### Step 0: Generate DID + Verifiable Credential (Tier 1)
python ssi_layer.py

### Step 1: Install dependencies
npm install
pip install -r requirements.txt

### Step 2: Run AI + ZKP commitment generator (Tier 2)
python healthcare_zkp.py

This outputs:
- model_metrics.json — accuracy, precision, recall, F1, AUC-ROC
- zkp_results.csv — per-patient predictions and commitment hashes
- commitments_for_blockchain.json — ready for on-chain storage

### Step 3: Start local blockchain
npx hardhat node

### Step 4: Deploy contract + anchor proofs (Tier 3)
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/storeProof_batch.js --network localhost

---

## Smart Contract: ProofStorage

storeProof(bytes32) — Anchors a ZKP commitment on-chain (owner-only)
verifyProof(bytes32) — Returns true if commitment exists
getBatchProofs(address) — Returns all commitments for auditor queries

---

## Experimental Results

### AI Inference (Pima Diabetes Dataset)

Run 1: PAT-1000 — Diabetic — 0.9566 — ~1.7ms
Run 2: PAT-1001 — Non-Diabetic — 0.0866 — ~1.0ms
Run 3: PAT-1002 — Diabetic — 0.9995 — ~1.4ms

Full results in zkp_results.csv

### Model Metrics (Test Set)

Accuracy: 0.60
Precision: 0.75
Recall: 0.50
F1 Score: 0.60
AUC-ROC: 0.71

### Blockchain Anchoring Performance

Avg gas per storeProof(): 45,000
Avg gas per verifyProof(): 22,000
Avg transaction time: less than 1s on Ganache local
Proof verification: 100 percent success
Network: Ganache local / Sepolia testnet

---

## Technologies

SSI Layer: Python (ssi_layer.py) — W3C VC Data Model simulation
AI Model: Python, Logistic Regression (sklearn)
Dataset: Pima Indians Diabetes Dataset
ZKP Circuit: Circom 2.2.3 + snarkjs (Groth16 protocol)
Smart Contract: Solidity 0.8 + OpenZeppelin Ownable
Blockchain: Ethereum (Ganache / Sepolia)
Dev Framework: Hardhat
Web3 Library: ethers.js

---

## ZKP Anchoring Flow

Step 1: ssi_layer.py generates DID + Verifiable Credential for doctor/patient
Step 2: Credential verified, AI inference authorized
Step 3: Logistic Regression runs on Pima dataset locally
Step 4: diabetesClassifier.circom generates Groth16 zk-SNARK proof
Step 5: Commitment = SHA256(patient_id + model_hash + output + timestamp)
Step 6: storeProof(commitment) stores on-chain, state updated
Step 7: verifyProof(commitment) returns true/false for auditors

---

## Security Guarantees

Model substitution defense: Model version hash in commitment (healthcare_zkp.py)
Data tampering defense: ZK-SNARK proof of correct inference (diabetesClassifier.circom)
Replay attack defense: Timestamp in commitment payload (SHA-256 commitment)
Unauthorized storage defense: onlyOwner modifier (ProofStorage.sol)

---

## References

Mathur, G. (2023). GANACHE: A Robust Framework for Efficient and Secure Storage of Data on Private Ethereum Blockchains. Research Square.
Fonseca et al. (2024). Blockchain in Health Information Systems: A Systematic Review. IJERPH.
Conceicao et al. (2023). DApps for SSI-based Healthcare Systems. DAPPS 2023.
Groth, J. (2016). On the Size of Pairing-Based Non-interactive Arguments. EUROCRYPT 2016.
