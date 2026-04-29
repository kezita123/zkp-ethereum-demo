// deploy-sepolia.js
import { ethers } from "ethers";

async function main() {
    console.log("🚀 Deploying to Sepolia Testnet");
    console.log("================================\n");

    // Connect to Sepolia via Alchemy
    const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/jzrb-5oDgMdzw6MSljigJ");
    
    // Your private key (from Ganache - but this needs Sepolia ETH)
    const privateKey = "0x80fe9c39dc0e5fb5a197016553fac53ac8308cb2d56dd176adb3e83e8ddb6ac4";
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`📡 Deploying from: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);
    
    if (balance === 0n) {
        console.log("⚠️ WARNING: This account has no Sepolia ETH!");
        console.log("Go to: https://sepoliafaucet.com");
        console.log("Enter this address: " + wallet.address);
        console.log("Wait 2 minutes for ETH to arrive\n");
        return;
    }

    // Contract bytecode and ABI
    const abi = [
        "function storeProof(bytes32 commitment) public",
        "function verifyProof(bytes32 commitment) public view returns (bool)"
    ];
    
    const bytecode = "0x608060405234801561001057600080fd5b506101d2806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806310f99b7e1461003b57806355b837d114610057575b600080fd5b6100556004803603810190610050919061011d565b610087565b005b610071600480360381019061006c919061011d565b61011b565b60405161007e9190610165565b60405180910390f35b60008060001b8314156100cf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100c6906101ab565b60405180910390fd5b600080836040516100e09291906101e3565b9081526040519081900360200190205460ff1615610133576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161012a90610224565b60405180910390fd5b6001600080846040516101469291906101e3565b908152604051908190036020019020805460ff19169115159190911790555050565b60008060008360405161012e9291906101e3565b908152602001604051809103902060009054906101000a900460ff169050919050565b60006020820190506101a76000830184610180565b92915050565b600060208201905081810360008301526101c481610244565b9050919050565b6000819050919050565b6000819050919050565b60006101ef8385610247565b93506101fc838584610259565b82840190509392505050565b6000610215601f8361025c565b91506102208261028d565b602082019050919050565b6000602082019050818103600083015261023d81610208565b9050919050565b600081519050919050565b600081905092915050565b82818337600083830152505050565b6000602082019050919050565b6000610282601f8361026d565b915061028d826102dc565b602082019050919050565b7f50726f6f6620616c726561647920657869737473000000000000000000000000600082015250565b60006102c6601f8361026d565b91506102d1826102b6565b602082019050919050565b60008151905091905056fea2646970667358221220dd750a334ec6e32d7e5a9a547d1ecbfb06ec7cf247611fe6ae8c4f018dd6733f64736f6c634300081c0033";
    
    console.log("📦 Deploying contract...");
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log(`✅ Contract deployed to: ${contractAddress}`);
    console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    
    // Test the contract
    console.log("\n🧪 Testing contract...");
    const commitment = "0x" + "1".repeat(64);
    const tx = await contract.storeProof(commitment);
    await tx.wait();
    console.log(`✅ Proof stored! Tx: ${tx.hash}`);
    
    const exists = await contract.verifyProof(commitment);
    console.log(`✅ Verification result: ${exists}`);
    
    console.log("\n🎉 Deployment and testing complete!");
}

main().catch(console.error);
