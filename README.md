# Three-Tier ZK-SNARK Framework for Verifiable and GDPR-Compliant Clinical AI

## Overview

This project implements a **privacy-preserving framework for verifiable AI inference in healthcare** using Zero-Knowledge Proof commitments anchored on the Ethereum blockchain.

## Problem Statement

When hospitals use AI for diagnosis, there is no way to prove that:
- The **correct model** ran on the data
- The **real patient data** was used
- The **output was not tampered with**

This framework provides cryptographic proof of correct AI inference without revealing patient data or model weights.

---

## Framework Architecture
┌─────────────────────────────────────────────┐
│ TIER 1: Identity Layer (SSI) │
│ Hyperledger Indy / Aries │
│ DIDs + Verifiable Credentials │
│ → Patient identity verified off-chain │
└──────────────────┬──────────────────────────┘
│ verified identity
┌──────────────────▼──────────────────────────┐
│ TIER 2: AI Inference + ZKP │
│ Logistic Regression + Groth16 zk-SNARK │
│ → diabetesClassifier.circom │
│ → Proves classification without revealing │
│ the score, features, or weights │
└──────────────────┬──────────────────────────┘
│ bytes32 commitment
┌──────────────────▼──────────────────────────┐
│ TIER 3: Blockchain Anchoring (EVM) │
│ ProofStorage.sol → storeProof(commitment) │
│ → Tamper-proof, auditable, immutable │
└─────────────────────────────────────────────┘


---

## Repository Structure
zkp-ethereum-demo/
├── circuits/
│ ├── diabetesClassifier.circom # Groth16 zk-SNARK circuit
│ └── README.md # Circuit documentation
├── contracts/
│ └── ProofStorage.sol # Ownable + NatSpec + audit trail
├── scripts/
│ ├── deploy.js
│ └── storeProof_batch.js
├── ssi_layer.py # Tier 1: DID + VC simulation
├── healthcare_zkp.py # Tier 2: AI classifier + ZKP
├── REPRODUCIBILITY.md # Step-by-step guide
├── requirements.txt
├── .env.example
├── .gitignore
└── LICENSE



---

## Quick Start

### Step 0: Generate DID + Verifiable Credential (Tier 1)
```bash
python ssi_layer.py
Step 1: Install dependencies
bash
npm install
pip install -r requirements.txt

Step 2: Run AI + ZKP commitment generator (Tier 2)
bash
python healthcare_zkp.py
This outputs:

model_metrics.json — accuracy, precision, recall, F1, AUC-ROC

zkp_results.csv — per-patient predictions and commitment hashes

commitments_for_blockchain.json — ready for on-chain storage

Step 3: Start local blockchain
bash
npx hardhat node

Step 4: Deploy contract + anchor proofs (Tier 3)
bash
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/storeProof_batch.js --network localhost

Smart Contract: ProofStorage

Function	                                  Description
storeProof(bytes32)	         Anchors a ZKP commitment on-chain (owner-only)
verifyProof(bytes32)	         Returns true if commitment exists
getBatchProofs(address)	 Returns all commitments for auditor queries

Experimental Results

AI Inference (Pima Diabetes Dataset)

Run    Patient ID	Prediction	      Probability	Commit Time (ms)
1	    PAT-1000	Diabetic	       0.9566	          ~1.7
2	    PAT-1001	Non-Diabetic    0.0866	          ~1.0
3	    PAT-1002	Diabetic	        0.9995	          ~1.4
...	      ...	                  ...	                           ...	                       ...
Full results in zkp_results.csv

Model Metrics (Test Set)

Metric	         Value
Accuracy	 0.60
Precision	 0.75
Recall	         0.50
F1 Score	 0.60
AUC-ROC	 0.71

Blockchain Anchoring Performance

Metric	                                            Value
Avg gas per storeProof()	~45,000
Avg gas per verifyProof()	~22,000
Avg transaction time	        < 1s on Ganache local
Proof verification	                 100% success
Network	                                 Ganache local / Sepolia testnet

Technologies

Layer	                        Technology
SSI Layer	                 Python (ssi_layer.py) — W3C VC Data Model
AI Model	                 Python, Logistic Regression (sklearn)
Dataset	                         Pima Indians Diabetes Dataset
ZKP Circuit	                 Circom 2.2.3 + snarkjs (Groth16)
Smart Contract	         Solidity 0.8 + OpenZeppelin Ownable
Blockchain	                 Ethereum (Ganache / Sepolia)
Dev Framework	Hardhat
Web3 Library	        ethers.js


ZKP Anchoring Flow
1.ssi_layer.py generates DID + Verifiable Credential for doctor/patient
2.Credential verified, AI inference authorized
3.Logistic Regression runs on Pima dataset locally
4.diabetesClassifier.circom generates Groth16 zk-SNARK proof
5.Commitment = SHA256(patient_id || model_hash || output || timestamp)
6.storeProof(commitment) stores on-chain, state updated
7.verifyProof(commitment) returns true/false for auditors

Security Guarantees

Threat	                                  Defense	                                                           Component
Model substitution	          Model version hash in commitment	   healthcare_zkp.py
Data tampering	          ZK-SNARK proof of correct inference	   diabetesClassifier.circom
Replay attacks	                  Timestamp in commitment payload	   SHA-256 commitment
Unauthorized storage	   onlyOwner modifier	                                   ProofStorage.sol

References
Mathur, G. (2023). GANACHE: A Robust Framework for Efficient and Secure Storage of Data on Private Ethereum Blockchains. Research Square.
Fonseca et al. (2024). Blockchain in Health Information Systems: A Systematic Review. IJERPH.
Conceicao et al. (2023). DApps for SSI-based Healthcare Systems. DAPPS 2023.
Groth, J. (2016). On the Size of Pairing-Based Non-interactive Arguments. EUROCRYPT 2016.