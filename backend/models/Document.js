const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    title: { type: String, required: true }, // For search
    category: { type: String, default: 'General' }, // For filtering
    tags: [{ type: String }], // For filtering
    description: { type: String },
    fileHash: { type: String, required: true, unique: true }, // SHA-256 Hash
    ipfsHash: { type: String, required: true }, // Encrypted file IPFS Hash
    encryptionKey: { type: String }, // Optional: If we want to store key (Not recommended for high security, but for demo)
    txHash: { type: String }, // Blockchain Transaction Hash
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    createdAt: { type: Date, default: Date.now }
});

// Text index for search
DocumentSchema.index({ title: 'text', description: 'text', tags: 'text', category: 'text' });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ tags: 1 });

module.exports = mongoose.model('Document', DocumentSchema);
