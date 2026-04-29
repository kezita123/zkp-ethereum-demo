// test-medical.js
import { ethers } from "ethers";

const contractAddress = "0x47A65570404A4dE81d5957E5664C07A08b897DF7";
const abi = [
    "function addRecord(string memory _record) public",
    "function getRecord(uint256 _index) public view returns (string memory)",
    "function getCount() public view returns (uint256)"
];

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    console.log("Testing contract...\n");
    
    // Check current count
    try {
        const count = await contract.getCount();
        console.log(`Current record count: ${count}`);
    } catch (err) {
        console.log("Error getting count:", err.message);
    }
    
    // Try adding a very simple record
    console.log("\nTrying to add simple record...");
    try {
        const tx = await contract.addRecord("Test");
        await tx.wait();
        console.log("✅ Record added!");
    } catch (err) {
        console.log("Error:", err.message);
    }
}

main().catch(console.error);
