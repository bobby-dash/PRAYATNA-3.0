const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    try {
        const user = await User.create({
            username,
            email,
            password,
            role: role || 'organization'
        });

        if (user) {
            console.log('User Registered:', user.email); // DEBUG LOG
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            console.log('Invalid user data'); // DEBUG LOG
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register Error:', error); // DEBUG LOG
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate a user
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login attempt for:', email); // DEBUG LOG
        // Check for user email
        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No'); // DEBUG LOG

        if (user && (await user.matchPassword(password))) {
            console.log('Password matched'); // DEBUG LOG
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            console.log('Invalid credentials - User exists:', !!user); // DEBUG LOG
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error); // DEBUG LOG - detailed error
        console.error('Stack:', error.stack); // DEBUG LOG - stack trace
        res.status(500).json({ message: 'Server error', error: error.message }); // Send error message to client for now
    }
});

// @route   PUT /api/auth/update-wallet
// @desc    Update user wallet address
// @access  Private
router.post('/update-wallet', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ message: 'Wallet address required' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.walletAddress = walletAddress;
        await user.save();

        res.json({ message: 'Wallet linked successfully', walletAddress: user.walletAddress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile (username/email)
router.put('/update-profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id) // Issue new token with potential new data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update failed' });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change password
router.put('/change-password', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    try {
        const { currentPassword, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
router.post('/forgot-password', async (req, res) => {
    console.log('Forgot password request received');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset url - use network-accessible URL
        // If FRONTEND_URL is set, use it (especially to replace localhost with network IP)
        // Otherwise, try to detect from request headers
        let origin = req.headers.origin ||
            (req.headers.referer ? new URL(req.headers.referer).origin : null);

        // If FRONTEND_URL is set, use it (this ensures network IP is used instead of localhost)
        if (process.env.FRONTEND_URL) {
            origin = process.env.FRONTEND_URL;
        } else if (!origin) {
            // Final fallback to localhost if nothing else is available
            origin = 'http://localhost:5173';
        }

        const resetUrl = `${origin}/reset-password/${resetToken}`;

        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
                </div>
                
                <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">Hello,</p>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">
                        You are receiving this email because you (or someone else) has requested to reset the password for your account.
                    </p>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">
                        Please click the button below to reset your password:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; line-height: 1.6;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="font-size: 14px; color: #667eea; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
                        ${resetUrl}
                    </p>
                    
                    <p style="font-size: 14px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        ⏰ This link will expire in 10 minutes.
                    </p>
                    
                    <p style="font-size: 14px; color: #999;">
                        If you did not request this, please ignore this email and your password will remain unchanged.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                    <p>© ${new Date().getFullYear()} SecureShare. All rights reserved.</p>
                </div>
            </div>
        `;

        const sendEmail = require('../utils/sendEmail');

        try {
            console.log('Attempting to send password reset email to:', user.email);
            console.log('Reset URL:', resetUrl);
            console.log('Email config - Service:', process.env.EMAIL_SERVICE);
            console.log('Email config - Username:', process.env.EMAIL_USERNAME);
            console.log('Email config - Password set:', !!process.env.EMAIL_PASSWORD);

            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request - SecureShare',
                message: message.replace(/<[^>]*>/g, ''), // Plain text fallback
                html: message
            });

            console.log('Password reset email sent successfully to:', user.email);
            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error('Email Error Details:', err);
            console.error('Error message:', err.message);
            console.error('Error stack:', err.stack);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent', error: err.message });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/reset-password/:resetToken
// @desc    Reset password
router.put('/reset-password/:resetToken', async (req, res) => {
    console.log('Reset password request received');
    console.log('Reset token from URL:', req.params.resetToken);
    console.log('Request body:', req.body);

    const crypto = require('crypto');
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    console.log('Hashed token:', resetPasswordToken);

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        console.log('User found:', !!user);
        if (user) {
            console.log('Token expiry:', new Date(user.resetPasswordExpire));
            console.log('Current time:', new Date());
        }

        if (!user) {
            console.log('Invalid or expired token');
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        console.log('Password reset successful for user:', user.email);
        res.status(201).json({
            success: true,
            message: 'Password Reset Success',
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Reset password error:', error);
        console.error('Error message:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/auth/backup
// @desc    Backup user data (Docs & Requests)
router.get('/backup', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const Document = require('../models/Document');
        const AccessRequest = require('../models/AccessRequest');

        const docs = await Document.find({ owner: decoded.id });
        const requests = await AccessRequest.find({
            $or: [{ owner: decoded.id }, { requester: decoded.id }]
        });

        const backupData = {
            exportDate: new Date().toISOString(),
            userId: decoded.id,
            documents: docs,
            requests: requests
        };

        res.json(backupData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Backup failed' });
    }
});

module.exports = router;
