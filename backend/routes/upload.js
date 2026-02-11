const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { uploadToIPFS, getFromIPFS } = require('../utils/ipfs');
const { encryptBuffer, generateFileHash, decryptBuffer } = require('../utils/encryption');
const Document = require('../models/Document');
const AccessRequest = require('../models/AccessRequest');
const AccessLog = require('../models/AccessLog');

// Load Contract Config
const configPath = path.join(__dirname, '../../config/contract-config.json');
let contractConfig;
try {
    if (fs.existsSync(configPath)) {
        contractConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
} catch (err) {
    console.error("Failed to load contract config:", err);
}

// Initialize Wallet & Contract (Server-Side)
let contract;
if (contractConfig && contractConfig.address && process.env.PRIVATE_KEY) {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    contract = new ethers.Contract(contractConfig.address, contractConfig.abi, wallet);
} else {
    console.warn("Blockchain features disabled: Missing Config or Private Key");
}

// Multer setup for memory storage (process file in memory before upload)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   POST /api/upload
// @desc    Upload file, encrypt, store on IPFS, save metadata, AND register on Blockchain
// @access  Private (Organization/Admin)
router.post('/', protect, upload.single('file'), async (req, res) => {
    console.log("--- Upload Request Received ---");
    console.log("User:", req.user.id);
    console.log("File:", req.file ? req.file.originalname : "No File");

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const { title, category, tags, description, visibility } = req.body;

        // 1. Generate SHA-256 Hash of ORIGINAL file (for integrity)
        const fileHash = generateFileHash(req.file.buffer);
        console.log("File Hash Generated:", fileHash);

        // Check if document already exists by hash
        const existingDoc = await Document.findOne({ fileHash });
        if (existingDoc) {
            console.log("Document exists:", existingDoc._id);
            return res.status(400).json({ message: 'Document already exists', doc: existingDoc });
        }

        // 2. Encrypt the file buffer
        const { encryptedData, iv, key } = encryptBuffer(req.file.buffer);
        console.log("Encryption Successful");

        // 3. Upload ENCRYPTED file to IPFS
        const pinataKey = process.env.PINATA_API_KEY ? "Set" : "Missing";
        const pinataSecret = process.env.PINATA_SECRET_API_KEY ? "Set" : "Missing";
        console.log(`IPFS Upload Starting. Keys: ${pinataKey} / ${pinataSecret}`);

        const ipfsHash = await uploadToIPFS(encryptedData, req.file.originalname + '.enc');
        console.log("IPFS Upload Success:", ipfsHash);

        let txHash = '';
        // 4. Register on Blockchain (Gasless for User - Server pays)
        if (contract) {
            try {
                console.log(`Minting document on blockchain... IPFS: ${ipfsHash}`);
                const tx = await contract.addDocument(ipfsHash, fileHash, title || req.file.originalname);
                await tx.wait();
                txHash = tx.hash;
                console.log(`Transaction successful: ${txHash}`);
            } catch (bcError) {
                console.error("Blockchain transaction failed:", bcError);
            }
        } else {
            console.warn("Skipping Blockchain: Contract not initialized");
        }

        // 5. Save Metadata to MongoDB
        const document = await Document.create({
            owner: req.user.id,
            fileName: req.file.originalname,
            title: title || req.file.originalname,
            category: category || 'General',
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            description: description || '',
            visibility: visibility || 'public',
            fileHash: fileHash,
            ipfsHash: ipfsHash,
            encryptionKey: `${key}:${iv}`,
            txHash: txHash
        });
        console.log("Document Saved to DB:", document._id);

        res.status(201).json({
            message: 'File uploaded, encrypted, and registered successfully',
            document: {
                _id: document._id,
                fileHash: document.fileHash,
                ipfsHash: document.ipfsHash,
                fileName: document.fileName,
                txHash: document.txHash
            }
        });

    } catch (error) {
        console.error("Upload Route Error:", error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// @route   GET /api/upload/download/:id
// @desc    Secure download (Checks access, fetches from IPFS, Decrypts)
router.get('/download/:id', protect, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Access Control Check
        let hasAccess = false;
        if (document.owner.toString() === req.user.id) {
            hasAccess = true;
        } else {
            const accessRequest = await AccessRequest.findOne({
                requester: req.user.id,
                document: document._id,
                status: 'approved'
            });
            if (accessRequest) hasAccess = true;
        }

        if (!hasAccess) {
            // Log failure
            await AccessLog.create({
                user: req.user.id,
                document: document._id,
                action: 'DOWNLOAD',
                status: 'FAILURE',
                ipAddress: req.ip
            });
            return res.status(403).json({ message: 'Access Denied' });
        }

        // Fetch Encrypted File from IPFS
        // We need a utility to fetch raw buffer from IPFS gateway
        const encryptedBuffer = await getFromIPFS(document.ipfsHash);

        // Decrypt
        const [keyHex, ivHex] = document.encryptionKey.split(':');
        const decryptedBuffer = decryptBuffer(encryptedBuffer, keyHex, ivHex);

        // Integrity Check (Optional but recommended)
        const currentHash = generateFileHash(decryptedBuffer);
        if (currentHash !== document.fileHash) {
            // Log tampering?
            return res.status(409).json({ message: 'Integrity Check Failed: File may be tampered' });
        }

        // Log Success
        await AccessLog.create({
            user: req.user.id,
            document: document._id,
            action: 'DOWNLOAD',
            status: 'SUCCESS',
            ipAddress: req.ip
        });

        // Send File
        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename="${document.fileName}"`);
        res.send(decryptedBuffer);

    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ message: 'Download failed' });
    }
});

// @route   GET /api/upload/my-docs
// @desc    Get all documents for logged in user

// @route   GET /api/upload/my-docs
// @desc    Get all documents for logged in user
// @access  Private
router.get('/my-docs', protect, async (req, res) => {
    try {
        const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/upload/:id
// @desc    Delete a document (Owner only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Check ownership
        if (document.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this document' });
        }

        // Delete associated access requests
        await AccessRequest.deleteMany({ document: document._id });

        // Delete from DB
        await document.deleteOne();

        // Log deletion
        await AccessLog.create({
            user: req.user.id,
            document: document._id, // Might be null if doc is gone, but keeping ID for record
            action: 'DELETE_FILE',
            status: 'SUCCESS',
            ipAddress: req.ip
        });

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
