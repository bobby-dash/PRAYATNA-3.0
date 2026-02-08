const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const AccessRequest = require('../models/AccessRequest');
const Document = require('../models/Document');
const AccessLog = require('../models/AccessLog');

// @route   POST /api/access/request
// @desc    Request access to a document
router.post('/request', protect, async (req, res) => {
    const { documentId } = req.body;

    try {
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (document.owner.toString() === req.user.id) {
            return res.status(400).json({ message: 'You own this document' });
        }

        const existingRequest = await AccessRequest.findOne({
            requester: req.user.id,
            document: documentId
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Request already exists', status: existingRequest.status });
        }

        const newRequest = await AccessRequest.create({
            requester: req.user.id,
            document: documentId,
            owner: document.owner
        });

        // Log the request
        await AccessLog.create({
            user: req.user.id,
            document: documentId,
            action: 'REQUEST_ACCESS',
            ipAddress: req.ip
        });

        res.status(201).json(newRequest);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/access/approve
// @desc    Approve or Reject access request
router.post('/approve', protect, async (req, res) => {
    const { requestId, status } = req.body; // status: 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const request = await AccessRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        request.status = status;
        request.responseDate = Date.now();
        await request.save();

        // Log the action
        await AccessLog.create({
            user: req.user.id,
            document: request.document,
            action: status === 'approved' ? 'APPROVE_ACCESS' : 'REJECT_ACCESS',
            ipAddress: req.ip
        });

        res.json(request);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/access/requests
// @desc    Get all requests related to user (incoming and outgoing)
router.get('/requests', protect, async (req, res) => {
    try {
        const incoming = await AccessRequest.find({ owner: req.user.id })
            .populate('requester', 'username email')
            .populate('document', 'title fileName')
            .sort({ requestDate: -1 });

        const outgoing = await AccessRequest.find({ requester: req.user.id })
            .populate('owner', 'username email')
            .populate('document', 'title fileName')
            .sort({ requestDate: -1 });

        res.json({ incoming, outgoing });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/access/grant-direct
// @desc    Owner directly grants access to a user (Push model) - via Wallet Address
router.post('/grant-direct', protect, async (req, res) => {
    try {
        const { documentId, recipientWallet } = req.body;

        const document = await Document.findById(documentId);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        if (document.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Find recipient by Wallet Address (case-insensitive)
        const recipient = await User.findOne({
            walletAddress: { $regex: new RegExp(`^${recipientWallet}$`, 'i') }
        });

        if (!recipient) return res.status(404).json({ message: 'User with this wallet address not found' });

        // Check for existing request/access
        const existingRequest = await AccessRequest.findOne({
            requester: recipient._id,
            document: document._id
        });

        if (existingRequest) {
            if (existingRequest.status === 'approved') {
                return res.status(400).json({ message: 'User already has access' });
            }
            // Approve existing request
            existingRequest.status = 'approved';
            existingRequest.approvalDate = Date.now();
            await existingRequest.save();

            // Log
            await AccessLog.create({
                user: req.user.id,
                document: document._id,
                action: 'APPROVE_ACCESS',
                status: 'SUCCESS',
                ipAddress: req.ip
            });

            return res.json({ message: 'Access granted successfully' });
        }

        // Create new approved request
        await AccessRequest.create({
            requester: recipient._id,
            document: document._id,
            owner: req.user.id,
            status: 'approved',
            approvalDate: Date.now()
        });

        // Log
        await AccessLog.create({
            user: req.user.id,
            document: document._id,
            action: 'GRANT_ACCESS',
            status: 'SUCCESS',
            ipAddress: req.ip
        });

        res.json({ message: `Access granted to ${recipient.username}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
