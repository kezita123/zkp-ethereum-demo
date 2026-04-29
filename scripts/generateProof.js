// scripts/generateProof.js
import snarkjs from "snarkjs";
import fs from "fs";
import crypto from "crypto";

async function main() {
    console.log("🔐 Zero-Knowledge Proof Generator");
    console.log("================================\n");

    // Input: Prove you're over 18
    const age = 25;           // private - you don't reveal this
    const minAge = 18;        // public - everyone knows this

    console.log(`Proving that age (${age}) >= ${minAge} without revealing age...\n`);

    // For demonstration, we'll create a mock commitment
    const commitmentData = `age-${age}-minAge-${minAge}-timestamp-${Date.now()}`;
    const commitmentHash = crypto.createHash("sha256").update(commitmentData).digest("hex");
    
    console.log("✅ Mock ZK Proof Generated!");
    console.log(`📝 Commitment Hash (what gets stored on-chain): 0x${commitmentHash}`);
    console.log("\n⚠️ Note: Full ZK proof generation requires circuit compilation and trusted setup.");
    console.log("   The commitment hash above can be stored in your ProofStorage contract.");
}

main().catch(console.error);
