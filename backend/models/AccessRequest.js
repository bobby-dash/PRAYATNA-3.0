const mongoose = require('mongoose');

const AccessRequestSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    requestDate: { type: Date, default: Date.now },
    responseDate: { type: Date }
});

// Compound index to prevent duplicate pending requests
AccessRequestSchema.index({ requester: 1, document: 1 }, { unique: true });

module.exports = mongoose.model('AccessRequest', AccessRequestSchema);
