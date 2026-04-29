// check-balance.js
import { ethers } from "ethers";

async function main() {
    const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/jzrb-5oDgMdzw6MSljigJ");
    const privateKey = "0x80fe9c39dc0e5fb5a197016553fac53ac8308cb2d56dd176adb3e83e8ddb6ac4";
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("📡 Wallet Address:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
}

main().catch(console.error);
