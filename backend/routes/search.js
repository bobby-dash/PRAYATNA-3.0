const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');

// @route   GET /api/search
// @desc    Search documents by title, tags, category
// @access  Private (Organization)
router.get('/', protect, async (req, res) => {
    try {
        const { q, category, tags, fromDate, toDate, page = 1, limit = 10 } = req.query;

        let query = { visibility: 'public' }; // Only search public metadata

        // Text Search
        if (q) {
            query.$text = { $search: q };
        }

        // Filters
        if (category) {
            query.category = category;
        }

        if (tags) {
            query.tags = { $in: tags.split(',') };
        }

        // Date Range
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = new Date(fromDate);
            if (toDate) query.createdAt.$lte = new Date(toDate);
        }

        const documents = await Document.find(query)
            .select('-encryptionKey -ipfsHash -fileHash') // Exclude sensitive data
            .populate('owner', 'username email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Document.countDocuments(query);

        res.json({
            documents,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalDocuments: total
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
