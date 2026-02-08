const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying DocumentRegistry...");

    const DocumentRegistry = await hre.ethers.getContractFactory("DocumentRegistry");
    const documentRegistry = await DocumentRegistry.deploy();

    await documentRegistry.waitForDeployment();

    const address = await documentRegistry.getAddress();
    console.log(`DocumentRegistry deployed to: ${address}`);

    // Save the contract address and ABI to a config file for frontend/backend to use
    const configDir = path.join(__dirname, "../config");
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
    }

    const contractConfig = {
        address: address,
        network: hre.network.name,
        abi: JSON.parse(documentRegistry.interface.formatJson())
    };

    fs.writeFileSync(
        path.join(configDir, "contract-config.json"),
        JSON.stringify(contractConfig, null, 2)
    );
    console.log("Contract config saved to config/contract-config.json");

    // Also save to frontend/src/config for direct import
    const frontendConfigDir = path.join(__dirname, "../frontend/src/config");
    if (!fs.existsSync(frontendConfigDir)) {
        fs.mkdirSync(frontendConfigDir, { recursive: true });
    }
    fs.writeFileSync(
        path.join(frontendConfigDir, "contract-config.json"),
        JSON.stringify(contractConfig, null, 2)
    );
    console.log("Contract config saved to frontend/src/config/contract-config.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
