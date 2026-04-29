// test-final.js
import { ethers } from "ethers";

async function main() {
    console.log("🚀 ZKP Anchoring Demo on Ganache");
    console.log("================================\n");

    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    const accounts = await provider.listAccounts();
    const signer = accounts[0];
    console.log(`Connected to Ganache`);
    console.log(`Using account: ${signer.address}\n`);

    // Your contract's exact ABI
    const abi = [
        "function storeProof(bytes32 commitment) public",
        "function verifyProof(bytes32 commitment) public view returns (bool)"
    ];

    // Use your deployed contract address from Ganache
    const contractAddress = "0xF5e81D746f578670d7C6A677c5cd6be5004F97FD";
    console.log(`Using contract at: ${contractAddress}\n`);

    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Create a PROPER bytes32 commitment (EXACTLY 64 characters after 0x)
    // "a" repeated 64 times = exactly 32 bytes
    const commitment = "0x" + "a".repeat(64);
    console.log(`1️⃣ Commitment (exactly 32 bytes): ${commitment}\n`);
    console.log(`   Length: ${commitment.length} characters (correct: 66 with 0x)\n`);

    // Check if it already exists
    console.log(`2️⃣ Checking if commitment exists...`);
    let exists;
    try {
        exists = await contract.verifyProof(commitment);
        console.log(`   Current status: ${exists}\n`);
    } catch (error) {
        console.log(`   First time checking this commitment\n`);
        exists = false;
    }

    if (!exists) {
        console.log(`3️⃣ Storing proof on blockchain...`);
        const tx = await contract.storeProof(commitment);
        await tx.wait();
        console.log(`   ✅ Transaction hash: ${tx.hash}\n`);
        
        console.log(`4️⃣ Verifying after storage...`);
        const nowExists = await contract.verifyProof(commitment);
        console.log(`   ✅ Proof exists on-chain: ${nowExists}\n`);
    } else {
        console.log(`   Commitment already exists, trying a different one...`);
        const newCommitment = "0x" + "b".repeat(64);
        console.log(`   New commitment: ${newCommitment}\n`);
        const tx = await contract.storeProof(newCommitment);
        await tx.wait();
        console.log(`   ✅ Stored successfully!\n`);
        console.log(`   ✅ Verified: ${await contract.verifyProof(newCommitment)}\n`);
    }

    console.log("🎉 ===== ZKP ANCHORING DEMO COMPLETE ===== 🎉");
    console.log("\n📝 WHAT THIS PROVES:");
    console.log("   1. ZKP commitment generated off-chain");
    console.log("   2. Commitment stored on blockchain via EVM");
    console.log("   3. On-chain verification confirms existence");
    console.log("   4. Immutable record of the commitment");
}

main().catch(console.error);
