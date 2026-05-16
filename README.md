# Three-Tier ZK-SNARK Framework for Verifiable and GDPR-Compliant Clinical AI

**Conference:** BRAINS 2026, Florence, Italy

---

## Overview

Privacy-preserving framework for verifiable AI inference in healthcare using Zero-Knowledge Proofs anchored on Ethereum.

## Problem Statement

When hospitals use AI for diagnosis, there is no way to prove that:
- The **correct model** ran on the data
- The **real patient data** was used
- The **output was not tampered with**

This framework provides cryptographic proof of correct AI inference **without revealing patient data or model weights**.

---

## Framework Architecture

### Tier 1 — Identity Layer (SSI)
Hyperledger Indy / Aries — DIDs + Verifiable Credentials
→ Patient identity verified off-chain before inference

### Tier 2 — AI Inference + ZKP
Logistic Regression + Groth16 zk-SNARK (diabetesClassifier.circom)
→ Proves classification result without revealing score, features, or weights

### Tier 3 — Blockchain Anchoring (EVM)
ProofStorage.sol — storeProof() + verifyProof()
→ Tamper-proof, auditable, immutable on-chain record

---

## Repository Structure

- `circuits/` — diabetesClassifier.circom (Groth16 zk-SNARK) + README
- `contracts/` — ProofStorage.sol (Ownable + NatSpec + audit trail)
- `scripts/` — deploy.js, storeProof_batch.js
- `ssi_layer.py` — Tier 1: DID + Verifiable Credential simulation
- `healthcare_zkp.py` — Tier 2: AI classifier + ZKP commitment generator
- `REPRODUCIBILITY.md` — Step-by-step reproduction guide
- `requirements.txt` — Python dependencies
- `.env.example` — Environment variable template

---

## Quick Start

**Step 0 — Identity Verification (Tier 1)**
python ssi_layer.py

text

**Step 1 — Install Dependencies**
npm install
pip install -r requirements.txt

text

**Step 2 — Run AI + Generate Commitments (Tier 2)**
python healthcare_zkp.py

text
Outputs: `model_metrics.json`, `zkp_results.csv`, `commitments_for_blockchain.json`

**Step 3 — Start Blockchain**
npx hardhat node

text

**Step 4 — Deploy + Anchor Proofs (Tier 3)**
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/storeProof_batch.js --network localhost

text

---

## Smart Contract

**ProofStorage.sol** (OpenZeppelin Ownable)

- `storeProof(bytes32)` — Anchors a ZKP commitment on-chain (owner-only)
- `verifyProof(bytes32)` — Returns true if commitment exists (public)
- `getBatchProofs(address)` — Returns all commitments for auditor queries

---

## Experimental Results

### AI Inference (Pima Diabetes Dataset)
- PAT-1000: Diabetic, 0.9566 probability, ~1.7ms commit time
- PAT-1001: Non-Diabetic, 0.0866 probability, ~1.0ms commit time
- PAT-1002: Diabetic, 0.9995 probability, ~1.4ms commit time
- Full results in `zkp_results.csv`

### Model Metrics (sklearn LogisticRegression)
- **Accuracy:** 0.60
- **Precision:** 0.75
- **Recall:** 0.50
- **F1 Score:** 0.60
- **AUC-ROC:** 0.71

### Blockchain Performance
- **Avg gas per storeProof():** ~45,000
- **Avg gas per verifyProof():** ~22,000
- **Transaction time:** < 1s (Ganache local)
- **Verification success:** 100%

---

## Technology Stack

- **SSI Layer:** Python (ssi_layer.py) — W3C Verifiable Credentials Data Model
- **AI Model:** Python, Logistic Regression (sklearn)
- **Dataset:** Pima Indians Diabetes Dataset (UCI)
- **ZKP Circuit:** Circom 2.2.3 + snarkjs (Groth16 protocol)
- **Smart Contract:** Solidity 0.8 + OpenZeppelin Ownable
- **Blockchain:** Ethereum (Ganache local / Sepolia testnet)
- **Framework:** Hardhat + ethers.js

---

## ZKP Anchoring Flow

1. `ssi_layer.py` generates DID + Verifiable Credential for doctor/patient
2. Credential verified → AI inference authorized
3. Logistic Regression runs on Pima dataset locally
4. `diabetesClassifier.circom` generates Groth16 zk-SNARK proof
5. Commitment = SHA256(patient_id || model_hash || output || timestamp)
6. `storeProof(commitment)` → EVM executes SSTORE → state updated
7. `verifyProof(commitment)` → returns true/false for auditors

---

## Security Guarantees

- **Model Substitution** → Defeated by model version hash in commitment
- **Data Tampering** → Defeated by ZK-SNARK proof of correct inference
- **Replay Attacks** → Defeated by timestamp in commitment payload
- **Unauthorized Storage** → Defeated by onlyOwner modifier on storeProof()

---

## References

- Mathur, G. (2023). GANACHE: A Robust Framework for Efficient and Secure Storage of Data on Private Ethereum Blockchains. *Research Square*.
- Fonseca et al. (2024). Blockchain in Health Information Systems: A Systematic Review. *IJERPH*.
- Conceicao et al. (2023). DApps for SSI-based Healthcare Systems. *DAPPS 2023*.
- Groth, J. (2016). On the Size of Pairing-Based Non-interactive Arguments. *EUROCRYPT 2016*.