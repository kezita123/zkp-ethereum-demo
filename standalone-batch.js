// standalone-batch.js
// Run with: node standalone-batch.js

import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Contract ABI
const abi = [
    "function storeProof(bytes32 commitment) external",
    "function verifyProof(bytes32 commitment) external view returns (bool)"
];

// Contract bytecode (compiled ProofStorage)
const bytecode = "0x608060405234801561001057600080fd5b506101d2806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806310f99b7e1461003b57806355b837d114610057575b600080fd5b6100556004803603810190610050919061011d565b610087565b005b610071600480360381019061006c919061011d565b61011b565b60405161007e9190610165565b60405180910390f35b60008060001b8314156100cf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100c6906101ab565b60405180910390fd5b600080836040516100e09291906101e3565b9081526040519081900360200190205460ff1615610133576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161012a90610224565b60405180910390fd5b6001600080846040516101469291906101e3565b908152604051908190036020019020805460ff19169115159190911790555050565b60008060008360405161012e9291906101e3565b908152602001604051809103902060009054906101000a900460ff169050919050565b60006020820190506101a76000830184610180565b92915050565b600060208201905081810360008301526101c481610244565b9050919050565b6000819050919050565b6000819050919050565b60006101ef8385610247565b93506101fc838584610259565b82840190509392505050565b6000610215601f8361025c565b91506102208261028d565b602082019050919050565b6000602082019050818103600083015261023d81610208565b9050919050565b600081519050919050565b600081905092915050565b82818337600083830152505050565b6000602082019050919050565b6000610282601f8361026d565b915061028d826102dc565b602082019050919050565b7f50726f6f6620616c726561647920657869737473000000000000000000000000600082015250565b60006102c6601f8361026d565b91506102d1826102b6565b602082019050919050565b60008151905091905056fea2646970667358221220dd750a334ec6e32d7e5a9a547d1ecbfb06ec7cf247611fe6ae8c4f018dd6733f64736f6c634300081c0033";

function loadCommitments() {
  const filePath = path.join(__dirname, "commitments_for_blockchain.json");
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

  // Connect to Ganache
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
  const signer = await provider.getSigner(0);
  console.log(`\n✅ Connected to Ganache`);
  console.log(`📡 Account: ${await signer.getAddress()}\n`);

  // Deploy contract
  console.log("📦 Deploying ProofStorage contract...");
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy();
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
      console.log(`${String(i+1).padEnd(5)} ${patient_id.padEnd(12)} ERROR: ${err.message.slice(0, 40)}`);
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

  const outputPath = path.join(__dirname, "blockchain_results.json");
  fs.writeFileSync(outputPath, JSON.stringify({ 
    contract_address: contractAddress, 
    results,
    avg_gas: avgGas
  }, null, 2));
  console.log(`\n✅ Results saved to: blockchain_results.json`);
}

main().catch(console.error);
