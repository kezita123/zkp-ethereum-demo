# Reproducibility Guide

## BRAINS 2026 ? Beyond Blind Trust: Three-Tier ZK-SNARK Framework

This guide enables reviewers to reproduce all results from the paper.

---

## Prerequisites

- **Python 3.9+** with pip
- **Node.js v18+** (v22 LTS recommended)
- **Circom 2.2+** ([install guide](https://docs.circom.io/getting-started/installation/))
- **Git**

---

## Step 1: Clone and Install
git clone https://github.com/kezita123/zkp-ethereum-demo.git
cd zkp-ethereum-demo
npm install
pip install -r requirements.txt


---

## Step 2: Run AI Classifier + Generate Commitments (Tier 2)

py healthcare_zkp.py


**Expected output:**
- Model training metrics printed to console
- model_metrics.json ? accuracy, precision, recall, F1, AUC-ROC
- zkp_results.csv ? per-patient predictions, probabilities, commitment hashes
- commitments_for_blockchain.json ? ready for on-chain anchoring
- circuits/inputs/input_PAT-*.json ? circuit input files

---

## Step 3: Run SSI Identity Layer (Tier 1)

py ssi_layer.py


**Expected output:**
- Hospital DID: did:indy:manipal:<uuid>
- Patient DID: did:indy:manipal:<uuid>
- Verification: VALID
- Signed credential with Ed25519Signature2020 proof

---

## Step 4: Compile ZK Circuit

circom circuits/diabetesClassifier.circom --r1cs --wasm --sym -o circuits/ -l "."


**Expected:** circuits/diabetesClassifier.r1cs created.

---

## Step 5: Generate ZK Proofs

npx snarkjs wtns calculate circuits/diabetesClassifier_js/diabetesClassifier.wasm circuits/inputs/input_PAT-1000.json circuits/proofs/witness_PAT-1000.wtns
npx snarkjs groth16 prove circuits/diabetesClassifier_final.zkey circuits/proofs/witness_PAT-1000.wtns circuits/proofs/proof_PAT-1000.json circuits/proofs/public_PAT-1000.json
npx snarkjs groth16 verify circuits/verification_key.json circuits/proofs/public_PAT-1000.json circuits/proofs/proof_PAT-1000.json


**Expected output:** [INFO] snarkJS: OK!

---

## Step 6: Start Local Blockchain

npx hardhat node


Leave this running in a separate terminal.

---

## Step 7: Deploy Smart Contract (Tier 3)

npx hardhat run scripts/deploy.js --network localhost


**Expected:** ProofStorage deployed to: 0x...

---

## Step 8: Anchor Proofs On-Chain

npx hardhat run scripts/storeProof_batch.js --network localhost


**Expected:** 10/10 proofs anchored with gas ~46,000 per proof.

---

## Paper Results Summary

| Metric | Value |
|--------|-------|
| Model Accuracy | 0.60 (test set) |
| AUC-ROC | 0.71 |
| Avg Gas per storeProof() | 46,033 |
| Proofs Anchored | 10/10 |
| ZK Circuit Constraints | 12 non-linear + 4 linear |
| Framework Tiers | 3 (SSI + ZKP + Blockchain) |
