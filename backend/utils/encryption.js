const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const algorithm = 'aes-256-ctr';
// In production, key should be stored securely (e.g. AWS KMS, or derived from user signature)
// For hackathon, we can use a server-side secret or a generated key per file.
// Here we will use a simple utility to encrypt/decrypt buffers.

const encryptBuffer = (buffer) => {
    // Generate a secure random key and IV
    const secretKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted, // Keep as buffer for IPFS upload
        key: secretKey.toString('hex')
    };
};

const decryptBuffer = (encryptedBuffer, keyHex, ivHex) => {
    const secretKey = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

    return decrypted;
};

// Also need a utility to hash the file for integrity (SHA-256)
const generateFileHash = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};

module.exports = {
    encryptBuffer,
    decryptBuffer,
    generateFileHash
};
