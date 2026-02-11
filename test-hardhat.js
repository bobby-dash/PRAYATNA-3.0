const fs = require('fs');

try {
    const hardhat = require("hardhat");
    console.log("Hardhat loaded successfully");
    fs.writeFileSync("hardhat_status.txt", "Hardhat loaded successfully");
} catch (error) {
    console.error("Error loading hardhat:", error);
    fs.writeFileSync("hardhat_error.txt", error.stack || error.toString());
}
