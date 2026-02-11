# PRAYATNA-3.0 Project Overview

## 1. Project Description
**PRAYATNA-3.0** is a Secure Decentralized Document Management System designed to provide a tamper-proof and privacy-focused platform for storing and sharing sensitive documents. It leverages **Blockchain technology (Ethereum/Hardhat)** for data integrity and **IPFS (InterPlanetary File System)** for decentralized storage, ensuring that documents are secure, verifiable, and available without reliance on a single central authority.

Key features include:
- **Decentralized Storage**: Files are encrypted and stored on IPFS.
- **Blockchain Integrity**: File hashes are stored on the blockchain to prevent tampering.
- **Secure Sharing**: Granular access control using a "Request & Approve" or "Direct Offer" mechanism.
- **Role-Based Access Control (RBAC)**: Distinct roles for Organizations, Verifiers, and Admins.
- **Audit Trails**: comprehensive logging of all access and modification actions.

## 2. User Flow

### A. Onboarding & Authentication
1.  **Registration**: User signs up with Username, Email, Password, and Role (Organization/Verifier).
2.  **Login**: User logs in and receives a **JWT Token** for session management.
3.  **Wallet Connection**: User connects their Ethereum Wallet (e.g., MetaMask) to interact with blockchain features.

### B. Document Management (Upload)
1.  **Upload**: User selects a file and provides metadata (Title, Category, Tags).
2.  **Encryption**: The browser/backend encrypts the file using AES-256 before storage.
3.  **Storage**: The encrypted file is uploaded to IPFS, returning a unique CID (Content Identifier).
4.  **Notarization**: The file's hash and IPFS CID are stored on the Blockchain via a Smart Contract.
5.  **Database Entry**: Metadata (Owner, IPFS Hash, Transaction Hash) is saved to MongoDB.

### C. Access & Sharing
1.  **Search**: Users can search for public document metadata (files themselves are encrypted).
2.  **Request Access**: A user requests access to a specific document.
3.  **Approval**: The document owner receives the request and approves or rejects it.
4.  **Download**:
    *   If approved, the backend fetches the encrypted file from IPFS.
    *   The backend decrypts the file using the stored key.
    *   The file is sent to the requester's browser.
5.  **Direct Offer**: Owners can proactively offer access to specific users via their Wallet Address.

## 3. Security Flow

### A. Authentication & Authorization
*   **JWT (JSON Web Tokens)**: Used for stateless authentication. Every sensitive API request requires a valid Bearer Token.
*   **RBAC (Role-Based Access Control)**: Middleware protects routes based on user roles (e.g., only 'Organization' can upload).

### B. Data Privacy (Encryption)
*   **At Rest**: Files are encryption using **AES-256** (or similar symmetric encryption) before being uploaded to IPFS. Even if someone finds the file on IPFS, they cannot read it without the key.
*   **In Transit**: All client-server communication occurs over HTTPS (in production) or secure localhost channels.

### C. Data Integrity (Blockchain)
*   **Tamper Proofing**: A SHA-256 hash of the *original* file is generated and stored on the Ethereum-compatible blockchain.
*   **Verification**: When a file is downloaded, its hash is recalculated and compared against the blockchain record to ensure it hasn't been altered.

## 4. Backend & Data Flow

### Technology Stack
*   **Frontend**: React.js, Vite, Tailwind CSS (implied).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Metadata, User auth, Access Logs).
*   **Blockchain**: Hardhat (Local/Testnet), Ethers.js.
*   **Storage**: IPFS (Pinata or local node).

### Data Flow Diagram (Conceptual)

1.  **Frontend Request**:
    `Client -> [HTTP POST /api/upload] -> Server`

2.  **Server Processing**:
    *   **Auth**: Validate JWT.
    *   **Processing**: Read file from request buffer.
    *   **Hashing**: Generate `SHA-256` of raw content.
    *   **Encryption**: Encrypt buffer -> `EncryptedBuffer`.
    *   **IPFS Upload**: `EncryptedBuffer` -> IPFS -> Returns `IPFS_HASH`.
    *   **Blockchain**: `Wallet` -> `SmartContract.addDocument(IPFS_HASH, FILE_HASH)` -> Returns `TX_HASH`.

3.  **Database Storage**:
    *   Save `User`, `Metadata`, `IPFS_HASH`, `TX_HASH`, and `EncryptionKey` (if managed) to MongoDB.

4.  **Response**:
    `Server -> [201 Created] -> Client`
