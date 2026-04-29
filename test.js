import { ethers } from "ethers";

async function test() {
    console.log("Testing connection to Sepolia...");
    // Free public RPC endpoint (rate limited but works for testing)
    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
    const block = await provider.getBlockNumber();
    console.log("✅ Connected! Latest block:", block);
}
test().catch(console.error);
