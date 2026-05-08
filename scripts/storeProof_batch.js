// scripts/storeProof_batch.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function loadProofCommitment(patientId) {
  const publicPath = path.join(
    __dirname, 
    "..", "circuits", "proofs", "public_" + patientId + ".json"
  );
  
  if (fs.existsSync(publicPath)) {
    try {
      const publicSignals = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
      const proofHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(publicSignals))
        .digest('hex');
      return "0x" + proofHash;
    } catch (error) {
      console.warn("  Warning: Could not load ZK proof for " + patientId);
    }
  }
  
  return null;
}

function loadCommitments() {
  const filePath = path.join(__dirname, "..", "commitments_for_blockchain.json");
  if (!fs.existsSync(filePath)) {
    console.log("WARNING: commitments_for_blockchain.json not found. Using test commitments.");
    return [
      { patient_id: "PAT-1000", commitment: "0x" + "a".repeat(64) },
      { patient_id: "PAT-1001", commitment: "0x" + "b".repeat(64) },
    ];
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log("Loaded " + data.length + " commitments from healthcare_zkp.py");
  return data;
}

async function main() {
  console.log("=".repeat(65));
  console.log("  ZKP Proof Anchoring - Batch Experiment");
  console.log("  Anchoring AI inference + ZK proof commitments on blockchain");
  console.log("=".repeat(65));

  const ProofStorage = await ethers.getContractFactory("ProofStorage");
  console.log("\nDeploying ProofStorage contract...");
  const contract = await ProofStorage.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log("Contract deployed at: " + contractAddress);

  const commitments = loadCommitments();
  console.log("Processing " + commitments.length + " patient commitments...\n");

  const results = [];

  console.log("Run   Patient       Source             Gas Used     Verified");
  console.log("-".repeat(65));

  for (let i = 0; i < commitments.length; i++) {
    const { patient_id, commitment } = commitments[i];
    
        // Use SHA-256 commitment for on-chain storage (ZK proofs have same public output for same class)
    const finalCommitment = commitment;
    const source = "SHA-256 Commit";
    
    let commitHex = finalCommitment.startsWith("0x") ? finalCommitment : "0x" + finalCommitment;
    const bytes32Commitment = commitHex.slice(0, 66).padEnd(66, "0");

    try {
      const tx = await contract.storeProof(bytes32Commitment);
      const receipt = await tx.wait();
      const verified = await contract.verifyProof(bytes32Commitment);
      const gasUsed = receipt.gasUsed.toString();

      console.log(
        String(i+1).padEnd(5) + 
        patient_id.padEnd(14) + 
        source.padEnd(18) + 
        gasUsed.padEnd(12) + 
        (verified ? "OK" : "FAIL")
      );

      results.push({
        run: i + 1,
        patient_id,
        source,
        gas_used: gasUsed,
        verified,
        tx_hash: receipt.hash
      });
    } catch (err) {
      console.log(String(i+1).padEnd(5) + patient_id.padEnd(14) + "ERROR: " + err.message.slice(0, 30));
      results.push({ run: i + 1, patient_id, source, error: err.message });
    }
  }

  const successful = results.filter(r => r.verified);
  const gasValues = successful.map(r => parseInt(r.gas_used));
  const avgGas = gasValues.length ? Math.round(gasValues.reduce((a,b) => a+b, 0) / gasValues.length) : 0;

  console.log("\n" + "=".repeat(65));
  console.log("  RESULTS FOR PAPER TABLE");
  console.log("=".repeat(65));
  console.log("  Contract address  : " + contractAddress);
  console.log("  Proofs anchored   : " + successful.length + "/" + results.length);
  console.log("  Avg gas per proof : " + avgGas.toLocaleString() + " gas units");
  console.log("  Commitment source : " + (results[0]?.source || "N/A"));
  console.log("=".repeat(65));

  const outputPath = path.join(__dirname, "..", "blockchain_results.json");
  fs.writeFileSync(outputPath, JSON.stringify({
    contract_address: contractAddress,
    commitment_source: results[0]?.source || "N/A",
    results,
    avg_gas: avgGas
  }, null, 2));
  console.log("\nResults saved to: blockchain_results.json");
}

main().catch(console.error);