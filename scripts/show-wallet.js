require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        console.error("❌ No PRIVATE_KEY found in .env file");
        return;
    }

    try {
        const wallet = new ethers.Wallet(privateKey);
        console.log("\n🔑 Wallet Information:");
        console.log("------------------------");
        console.log("Public Address:", wallet.address);
        console.log("Private Key:   ", privateKey.substring(0, 6) + "..." + privateKey.substring(60));
        console.log("------------------------");
        console.log("Copy the 'Public Address' to use in the Faucet.");
    } catch (error) {
        console.error("❌ Invalid Private Key:", error.message);
    }
}

main();
