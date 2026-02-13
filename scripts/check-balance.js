const hre = require("hardhat");
require('dotenv').config();

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Checking balance for account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        console.log("❌ ERROR: You have 0 ETH on Sepolia. You need to get some from a faucet.");
    } else {
        console.log("✅ Balance > 0. You should be able to deploy.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
