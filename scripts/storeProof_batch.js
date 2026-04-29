// scripts/storeProof_batch.js
import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadCommitments() {
  const filePath = path.join(__dirname, "../commitments_for_blockchain.json");
  if (!fs.existsSync(filePath)) {
    console.log("⚠️ commitments_for_blockchain.json not found. Using test commitments.\n");
    return [
      { patient_id: "PAT-1000", commitment: "0x" + "a".repeat(64) },
      { patient_id: "PAT-1001", commitment: "0x" + "b".repeat(64) },
    ];
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log(`✅ Loaded ${data.length} commitments from healthcare_zkp.py\n`);
  return data;
}

async function main() {
  console.log("=".repeat(65));
  console.log("  ZKP Proof Anchoring — Batch Experiment");
  console.log("  Anchoring AI inference commitments on blockchain");
  console.log("=".repeat(65));

  // Get the contract factory using hre
  const ProofStorage = await hre.ethers.getContractFactory("ProofStorage");
  console.log("\n📦 Deploying ProofStorage contract...");
  const contract = await ProofStorage.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`✅ Contract deployed at: ${contractAddress}\n`);

  const commitments = loadCommitments();
  console.log(`🏥 Processing ${commitments.length} patient commitments...\n`);

  const results = [];

  console.log(`${"Run".padEnd(5)} ${"Patient".padEnd(12)} ${"Gas Used".padEnd(12)} ${"Verified".padEnd(10)}`);
  console.log("-".repeat(50));

  for (let i = 0; i < commitments.length; i++) {
    const { patient_id, commitment } = commitments[i];
    let commitHex = commitment.startsWith("0x") ? commitment : "0x" + commitment;
    const bytes32Commitment = commitHex.slice(0, 66).padEnd(66, "0");

    try {
      const tx = await contract.storeProof(bytes32Commitment);
      const receipt = await tx.wait();
      const verified = await contract.verifyProof(bytes32Commitment);
      const gasUsed = receipt.gasUsed.toString();

      console.log(`${String(i+1).padEnd(5)} ${patient_id.padEnd(12)} ${gasUsed.padEnd(12)} ${verified ? "✅ YES" : "❌ NO"}`);

      results.push({
        run: i + 1,
        patient_id,
        gas_used: gasUsed,
        verified,
        tx_hash: receipt.hash
      });
    } catch (err) {
      console.log(`${String(i+1).padEnd(5)} ${patient_id.padEnd(12)} ERROR`);
      results.push({ run: i + 1, patient_id, error: err.message });
    }
  }

  const successful = results.filter(r => r.verified);
  const gasValues = successful.map(r => parseInt(r.gas_used));
  const avgGas = gasValues.length ? Math.round(gasValues.reduce((a,b) => a+b, 0) / gasValues.length) : 0;

  console.log("\n" + "=".repeat(65));
  console.log("  RESULTS FOR PAPER TABLE");
  console.log("=".repeat(65));
  console.log(`  Contract address  : ${contractAddress}`);
  console.log(`  Proofs anchored   : ${successful.length}/${results.length}`);
  console.log(`  Avg gas per proof : ${avgGas} gas units`);
  console.log("=".repeat(65));

  const outputPath = path.join(__dirname, "../blockchain_results.json");
  fs.writeFileSync(outputPath, JSON.stringify({ 
    contract_address: contractAddress, 
    results,
    avg_gas: avgGas
  }, null, 2));
  console.log(`\n✅ Results saved to: blockchain_results.json`);
}

main().catch(console.error);
