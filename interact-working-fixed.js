// interact-working-fixed.js
import { ethers } from "ethers";

// Use LOWERCASE to bypass checksum validation
const contractAddress = "0xff1a949d743da0a98b0ac54914129517cd550da8";

const abi = [
    "function add(string memory _item) public",
    "function get(uint256 _index) public view returns (string memory)",
    "function count() public view returns (uint256)"
];

async function main() {
    console.log("🔗 Connecting to your working contract...\n");
    
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    console.log(`📡 Account: ${await signer.getAddress()}`);
    console.log(`📝 Contract: ${contractAddress}\n`);
    
    // Check current count
    let count = await contract.count();
    console.log(`📊 Current records: ${count}\n`);
    
    // Add medical records
    console.log("🏥 Adding medical records...");
    
    const tx1 = await contract.add("Patient: John Doe, Diagnosis: Type 2 Diabetes, Risk: High");
    await tx1.wait();
    console.log("   ✅ Record 1 added");
    
    const tx2 = await contract.add("Patient: Jane Smith, Diagnosis: Hypertension, Risk: Medium");
    await tx2.wait();
    console.log("   ✅ Record 2 added");
    
    const tx3 = await contract.add("Patient: Bob Wilson, Diagnosis: Healthy, Risk: Low");
    await tx3.wait();
    console.log("   ✅ Record 3 added\n");
    
    count = await contract.count();
    console.log(`📊 Total records now: ${count}\n`);
    
    console.log("📋 Medical Records on Blockchain:");
    console.log("================================");
    for (let i = 0; i < count; i++) {
        const record = await contract.get(i);
        console.log(`${i + 1}. ${record}`);
    }
    
    console.log("\n🎉 SUCCESS! Medical records stored on blockchain!");
}

main().catch(console.error);
