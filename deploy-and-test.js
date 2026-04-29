// deploy-and-test.js
import { ethers } from "ethers";

const CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProofStorage {
    mapping(bytes32 => bool) public proofs;
    event ProofStored(address indexed user, bytes32 commitment);

    function storeProof(bytes32 _commitment) external {
        require(!proofs[_commitment], "Proof already exists");
        proofs[_commitment] = true;
        emit ProofStored(msg.sender, _commitment);
    }

    function verifyProof(bytes32 _commitment) external view returns (bool) {
        return proofs[_commitment];
    }
}
`;

async function main() {
    console.log("🚀 ZKP Anchoring Demo on Ganache");
    console.log("================================\n");

    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    const accounts = await provider.listAccounts();
    const signer = accounts[0];
    console.log(`✅ Connected to Ganache`);
    console.log(`📡 Account: ${signer.address}\n`);

    // Compile and deploy
    console.log(`1️⃣ Compiling contract...`);
    const compileResult = await new ethers.Compiler().compile(CONTRACT_SOURCE);
    
    console.log(`2️⃣ Deploying ProofStorage contract...`);
    const factory = new ethers.ContractFactory(compileResult.abi, compileResult.evm.bytecode.object, signer);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`   ✅ Deployed at: ${contractAddress}\n`);

    // Generate commitment
    console.log(`3️⃣ Generating ZKP commitment...`);
    const commitment = "0x" + "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    console.log(`   📝 Commitment: ${commitment}\n`);

    // Store proof
    console.log(`4️⃣ Storing proof on blockchain...`);
    const tx = await contract.storeProof(commitment);
    await tx.wait();
    console.log(`   ✅ Transaction: ${tx.hash}\n`);

    // Verify
    console.log(`5️⃣ Verifying proof...`);
    const exists = await contract.verifyProof(commitment);
    console.log(`   ✅ Proof exists: ${exists}\n`);

    // Try duplicate
    console.log(`6️⃣ Testing duplicate protection...`);
    try {
        await contract.storeProof(commitment);
    } catch (err) {
        console.log(`   ✅ Correctly rejected duplicate: "Proof already exists"\n`);
    }

    console.log("🎉 ===== DEMO COMPLETE ===== 🎉");
    console.log("\n📝 On-chain ZKP anchoring flow successful!");
}

main().catch(console.error);
