const mongoose = require('mongoose');

const AccessLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    action: {
        type: String,
        enum: ['VIEW_METADATA', 'DOWNLOAD', 'REQUEST_ACCESS', 'APPROVE_ACCESS', 'REJECT_ACCESS', 'OFFER_ACCESS', 'DELETE_FILE'],
        required: true
    },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    status: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' }
});

module.exports = mongoose.model('AccessLog', AccessLogSchema);
