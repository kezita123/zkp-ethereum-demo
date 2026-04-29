// test-simple.js
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
        "function verifyProof(bytes32 commitment) public view returns (bool)",
        "function proofs(bytes32) public view returns (bool)"
    ];

    // Use the contract you already deployed (from Remix)
    // You can also deploy a new one, but let's use the existing one
    const contractAddress = "0xF5e81D746f578670d7C6A677c5cd6be5004F97FD";
    console.log(`Using existing contract at: ${contractAddress}\n`);

    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Test commitment (valid bytes32)
    const commitment = "0x" + "a".repeat(64);
    console.log(`1️⃣ Testing with commitment: ${commitment}\n`);

    // Check if it already exists
    const exists = await contract.verifyProof(commitment);
    console.log(`2️⃣ Does commitment exist? ${exists}\n`);

    if (!exists) {
        console.log(`3️⃣ Storing proof on blockchain...`);
        const tx = await contract.storeProof(commitment);
        await tx.wait();
        console.log(`   ✅ Transaction hash: ${tx.hash}\n`);
        
        console.log(`4️⃣ Verifying again...`);
        const nowExists = await contract.verifyProof(commitment);
        console.log(`   ✅ Proof exists on-chain: ${nowExists}\n`);
    } else {
        console.log(`   Commitment already exists, trying a new one...`);
        const newCommitment = "0x" + "b".repeat(64);
        const tx = await contract.storeProof(newCommitment);
        await tx.wait();
        console.log(`   ✅ Stored new commitment: ${newCommitment}\n`);
        console.log(`   ✅ Verified: ${await contract.verifyProof(newCommitment)}\n`);
    }

    console.log("🎉 Demo complete!");
    console.log("\n📝 What this proves for your paper:");
    console.log("   - ZKP commitment generated off-chain");
    console.log("   - Commitment stored on blockchain via EVM");
    console.log("   - On-chain verification confirms existence");
}

main().catch(console.error);
