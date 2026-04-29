// scripts/deploy.js
async function main() {
    const ProofStorage = await ethers.getContractFactory("ProofStorage");
    const proofStorage = await ProofStorage.deploy();
    await proofStorage.deployed();
    console.log("✅ ProofStorage deployed to:", proofStorage.address);
}
main().catch(console.error);
