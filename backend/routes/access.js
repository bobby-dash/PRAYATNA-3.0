const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const AccessRequest = require('../models/AccessRequest');
const Document = require('../models/Document');
const AccessLog = require('../models/AccessLog');
const User = require('../models/User');

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

        // Authorization Check
        if (request.requestType === 'offer') {
            // For Offers, the RECEIVER (requester) approves/rejects
            if (request.requester.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to approve this offer' });
            }
        } else {
            // For Requests, the OWNER approves/rejects
            if (request.owner.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to manage this request' });
            }
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
        // Incoming: Requests for my files OR Offers sent to me
        const incoming = await AccessRequest.find({
            $or: [
                { owner: req.user.id, requestType: 'request' },
                { requester: req.user.id, requestType: 'offer' }
            ]
        })
            .populate('requester', 'username email')
            .populate('owner', 'username email')
            .populate('document', 'title fileName')
            .sort({ requestDate: -1 });

        // Outgoing: My requests for files OR My offers to others
        const outgoing = await AccessRequest.find({
            $or: [
                { requester: req.user.id, requestType: 'request' },
                { owner: req.user.id, requestType: 'offer' }
            ]
        })
            .populate('owner', 'username email')
            .populate('requester', 'username email')
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
            return res.status(400).json({ message: 'Request already exists or access already granted' });
        }

        // Create new OFFER (Pending approval by recipient)
        const newOffer = await AccessRequest.create({
            requester: recipient._id,
            document: document._id,
            owner: req.user.id,
            status: 'pending',
            requestType: 'offer',
            requestDate: Date.now()
        });

        // Log
        await AccessLog.create({
            user: req.user.id,
            document: document._id,
            action: 'OFFER_ACCESS',
            status: 'SUCCESS',
            ipAddress: req.ip
        });

        res.json({ message: `File offered to ${recipient.username}. They must accept it.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/access/:id
// @desc    Delete/Dismiss a request
router.delete('/:id', protect, async (req, res) => {
    try {
        const request = await AccessRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Authorization: Only Requester or Owner can delete/dismiss
        if (request.requester.toString() !== req.user.id && request.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await request.deleteOne();
        res.json({ message: 'Request removed' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
