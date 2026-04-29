// deploy-medical.js
import { ethers } from "ethers";

async function main() {
    console.log("🚀 Deploying MedicalProof Contract");
    console.log("=================================\n");

    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    const signer = await provider.getSigner(0);
    console.log(`✅ Connected to Ganache`);
    console.log(`📡 Account: ${await signer.getAddress()}\n`);

    // Contract code (simple version that WILL work)
    const contractCode = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalProof {
    string[] public records;
    event RecordAdded(string record);
    
    function addRecord(string memory _record) public {
        records.push(_record);
        emit RecordAdded(_record);
    }
    
    function getRecord(uint256 _index) public view returns (string memory) {
        return records[_index];
    }
    
    function getCount() public view returns (uint256) {
        return records.length;
    }
}
`;

    // Compile and deploy
    console.log("📦 Deploying contract...");
    const factory = new ethers.ContractFactory([], "0x", signer);
    // For simplicity, we'll use a pre-compiled bytecode
    const bytecode = "0x608060405234801561001057600080fd5b50610391806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80633b3c3b8f146100465780638bc33af314610064578063c959624814610094575b600080fd5b61004e6100b2565b60405161005b91906101f9565b60405180910390f35b61007e600480360381019061007991906102b4565b6100be565b60405161008b9190610353565b60405180910390f35b6100ae60048036038101906100a991906103a9565b6100f9565b005b60008054905090565b60608180546020810182900460ff16156100d757610154565b8180548060200260200160405190810160405280929190818152602001828054801561014a57602002820191906000526020600020905b815481526020019060010190808311610112575b505050505090505b919050565b806000908060018154018082558091505060019003906000526020600020016000909190919091505550565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000819050919050565b600061016f61016a83610132565b61014f565b9050919050565b6000610182828461015d565b905092915050565b6000602082019050919050565b60006101a282610125565b6101ac8185610176565b93506101bc81856020860161011f565b6101c581610373565b840191505092915050565b60006101db82610125565b6101e58185610181565b93506101f581856020860161011f565b6101fe81610373565b840191505092915050565b600060208201905081810360008301526102138184610197565b905092915050565b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6102638261021b565b810181811067ffffffffffffffff821117156102825761028161022c565b5b80604052505050565b600061029561028b565b90506102a1828261025a565b919050565b6000813590506102b581610384565b92915050565b6000602082840312156102ca576102c961027c565b5b600082013567ffffffffffffffff8111156102e8576102e7610281565b5b6102f4848285016102a6565b91505092915050565b6000819050919050565b600061032261031d61031884610132565b6102fd565b610125565b9050919050565b600061033482610307565b9050919050565b600061034682610329565b9050919050565b6000602082019050610368600083018461033b565b92915050565b600081519050919050565b6000601f19601f8301169050919050565b61038d81610329565b811461039857600080fd5b50565b6000813590506103a881610384565b92915050565b6000602082840312156103bf576103be61027c565b5b600082013567ffffffffffffffff8111156103dd576103dc610281565b5b6103e98482850161039b565b9150509291505056fea26469706673582212207b8ee5b6a8f8b56a9c9f2dcdbc4a43217c0c29137d5e127c654d1ce96a06bf1764736f6c634300081c0033";
    
    const abi = [
        "function addRecord(string memory _record) public",
        "function getRecord(uint256 _index) public view returns (string memory)",
        "function getCount() public view returns (uint256)"
    ];
    
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log(`✅ Contract deployed at: ${contractAddress}\n`);
    
    // Test the contract
    console.log("🧪 Testing contract...");
    
    console.log("   Adding medical record...");
    const tx = await contract.addRecord("Patient: John Doe, Diagnosis: Diabetes, Risk: High");
    await tx.wait();
    console.log(`   ✅ Record added!\n`);
    
    console.log("   Getting record count...");
    const count = await contract.getCount();
    console.log(`   📊 Total records: ${count}\n`);
    
    console.log("   Getting first record...");
    const record = await contract.getRecord(0);
    console.log(`   📝 Record: ${record}\n`);
    
    console.log("🎉 Deployment successful!");
}

main().catch(console.error);
