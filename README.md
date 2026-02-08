<<<<<<< HEAD
# Tamper-Proof Data Sharing Platform

A secure, blockchain-backed document sharing platform ensuring data integrity using Ethereum and IPFS.

## Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or Atlas URI)
- MetaMask Extension

## Quick Start
### 1. Install Dependencies
Run the following command in the **root** folder:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment
Create a `.env` file in the **backend** folder (copy from `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tamper-proof-platform
JWT_SECRET=your_jwt_secret
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_API_KEY=your_pinata_secret
```
*Note: For the hacking to work, you need valid Pinata keys for IPFS.*

### 3. Start Local Blockchain
Open a new terminal in root:
```bash
npx hardhat node
```
*Keep this terminal running.*

### 4. Deploy Smart Contract
In a new terminal (root):
```bash
npx hardhat run scripts/deploy.js --network localhost
```
*This will deploy the contract and save the config to `frontend/src/config/contract-config.json`.*

### 5. Start Backend Server
In a new terminal (backend folder):
```bash
cd backend
npm run dev
```

### 6. Start Frontend
In a new terminal (frontend folder):
```bash
cd frontend
npm run dev
```

## Features
- **Secure Upload**: Files are encrypted (AES-256) before IPFS upload.
- **Blockchain Verification**: SHA-256 hash stored on Ethereum for tamper-proof verification.
- **Role-Based Auth**: Organization and Verifier roles.
- **Wallet Integration**: MetaMask login for signing transactions.

## Technologies
- **Blockchain**: Solidity, Hardhat
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, Vite, Tailwind-like CSS
- **Storage**: IPFS (Pinata)
=======
# PRAYATNA-3.0
>>>>>>> 5fe22cbd1562f8a71cd9ebde93d97f423db3e8ce
