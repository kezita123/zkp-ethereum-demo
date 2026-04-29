// scripts/interact.js
// This script simulates the full ZKP anchoring flow

import { ethers } from "hardhat";

async function main() {
    console.log("🚀 ZKP Anchoring Demo");
    console.log("=====================\n");

    // Step 1: Generate a ZK proof (mock for demo)
    console.log("1️⃣ Generating ZK proof off-chain...");
    const commitment = "0x" + "1234567890123456789012345678901234567890123456789012345678901234";
    console.log(`   Commitment hash: ${commitment}\n`);

    // Step 2: Deploy contract (or use existing)
    console.log("2️⃣ Deploying ProofStorage contract...");
    const ProofStorage = await ethers.getContractFactory("ProofStorage");
    const proofStorage = await ProofStorage.deploy();
    await proofStorage.deployed();
    console.log(`   Contract deployed at: ${proofStorage.address}\n`);

    // Step 3: Store proof commitment on-chain
    console.log("3️⃣ Anchoring commitment on blockchain...");
    const tx = await proofStorage.storeProof(commitment);
    await tx.wait();
    console.log(`   ✅ Commitment stored in block!\n`);

    // Step 4: Verify it exists
    console.log("4️⃣ Verifying commitment exists...");
    const exists = await proofStorage.verifyProof(commitment);
    console.log(`   ✅ Proof exists on-chain: ${exists}\n`);

    console.log("🎉 Full ZKP anchoring flow complete!");
    console.log("   The commitment is now permanently stored on the blockchain.");
}

main().catch(console.error);
