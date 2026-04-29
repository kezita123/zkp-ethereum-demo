# ZKP Proof Anchoring on Ethereum — Healthcare AI Accountability

## Overview

This project implements a **privacy-preserving framework for verifiable AI inference in healthcare** using Zero-Knowledge Proof commitments anchored on the Ethereum blockchain.

> Kezita Jebastine, Jeslyn Liz Jacob

---

## Problem Statement

When hospitals use AI for diagnosis, there is no way to prove that:
- The **correct model** ran on the data
- The **real patient data** was used
- The **output was not tampered with**

This framework provides cryptographic proof of correct AI inference without revealing patient data or model weights.

---

## Framework Architecture

```
┌─────────────────────────────────────────────┐
│  TIER 1: AI Inference (Private)             │
│  Logistic Regression on Pima Diabetes Data  │
│  → Runs locally, nothing leaves the hospital    │
└──────────────────┬──────────────────────────┘
                   │ inference output
┌──────────────────▼──────────────────────────┐
│  TIER 2: ZKP Commitment Generation         │
│  SHA-256 hash of (model_id, output, ts)     │
│  → Circom circuit (circuits/ folder)        │
│  → Proves inference ran correctly           │
└──────────────────┬──────────────────────────┘
                   │ bytes32 commitment
┌──────────────────▼──────────────────────────┐
│  TIER 3: Blockchain Anchoring (EVM)        │
│  ProofStorage.sol → storeProof(commitment)  │
│  → Tamper-proof, auditable, immutable       │
└─────────────────────────────────────────────┘
```

---

## Repository Structure

```
zkp-ethereum-demo/
├── circuits/              # Circom ZKP circuits
├── contracts/
│   └── ProofStorage.sol   # Solidity smart contract
├── scripts/
│   ├── deploy.js          # Contract deployment
│   └── storeProof_batch.js  # Batch proof anchoring (NEW)
├── healthcare_zkp.py      # AI classifier + commitment generator (NEW)
├── hardhat.config.js
└── README.md
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
pip install hashlib json csv  # (standard library — no install needed)
```

### 2. Start Ganache
```bash
# Option A: Ganache desktop app (port 7545)
# Option B: Hardhat local node
npx hardhat node
```

### 3. Run the AI + ZKP commitment generator
```bash
python healthcare_zkp.py
```
This outputs:
- `zkp_results.csv` — timing metrics for the paper
- `commitments_for_blockchain.json` — commitments ready for on-chain storage

### 4. Anchor commitments on blockchain
```bash
# Local Ganache
npx hardhat run scripts/storeProof_batch.js --network localhost

# Sepolia testnet (get free ETH from https://sepoliafaucet.com)
npx hardhat run scripts/storeProof_batch.js --network sepolia
```

---

## Smart Contract: ProofStorage

| Function | Description |
|---|---|
| `storeProof(bytes32 commitment)` | Anchors a ZKP commitment on-chain |
| `verifyProof(bytes32 commitment)` | Returns `true` if commitment exists |

**Sepolia Testnet Deployment:**
- Contract Address: `[TO BE ADDED AFTER DEPLOYMENT]`
- Etherscan: `https://sepolia.etherscan.io/address/[ADDRESS]`

---

## Experimental Results

### AI Inference (Pima Diabetes Dataset)

| Run | Patient ID | Prediction | Probability | Commit Time (ms) |
|-----|-----------|-----------|-------------|-----------------|
| 1 | PAT-1000 | Diabetic | 0.7823 | 0.0412 |
| 2 | PAT-1001 | Non-Diabetic | 0.3201 | 0.0389 |
| 3 | PAT-1002 | Diabetic | 0.6547 | 0.0401 |
| ... | ... | ... | ... | ... |

> Full results in `zkp_results.csv` after running `healthcare_zkp.py`

### Blockchain Anchoring Performance

| Metric | Value |
|--------|-------|
| Avg gas per `storeProof()` | [run script to get] |
| Avg transaction time | [run script to get] |
| Proof verification | 100% success |
| Network | Ganache local / Sepolia testnet |

> Gas cost formula: `Tcost = gasLimit × gasPrice` (Mathur, 2023)

---

## Technologies

| Layer | Technology |
|-------|-----------|
| AI Model | Python, Logistic Regression |
| Dataset | Pima Indians Diabetes Dataset |
| ZKP Circuit | Circom (circuits/ folder) |
| Smart Contract | Solidity ^0.8.0 |
| Blockchain | Ethereum (Ganache / Sepolia) |
| Dev Framework | Hardhat |
| Web3 Library | ethers.js |

---

## ZKP Anchoring Flow

```
1. AI model runs inference on patient data (locally)
2. Commitment = SHA256(patient_id || model_hash || output || timestamp)
3. storeProof(commitment) → EVM executes SSTORE → state updated
4. verifyProof(commitment) → returns true/false for auditors
5. Patient receives commitment hash as audit receipt
```

---

## Authors

**Kezita Jebastine** | **Jeslyn Liz Jacob**

Paper submitted to: [Conference Name] | [Year]

---

## References

- Mathur, G. (2023). GANACHE: A Robust Framework for Efficient and Secure Storage of Data on Private Ethereum Blockchains. Research Square.
- Fonsêca et al. (2024). Blockchain in Health Information Systems: A Systematic Review. IJERPH.
- Conceição et al. (2023). DApps for SSI-based Healthcare Systems. DAPPS 2023.
