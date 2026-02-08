import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, Send, User } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, documentId, documentTitle }) => {
    const [recipientWallet, setRecipientWallet] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleShare = async () => {
        if (!recipientWallet) return toast.error('Please enter a wallet address');

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const res = await axios.post(`${apiUrl}/access/grant-direct`, {
                documentId,
                recipientWallet
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(res.data.message);
            setRecipientWallet('');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to share. Ensure recipient has registered & connected wallet.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div className="glass-panel" style={{ width: '400px', padding: '2rem', position: 'relative', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={20} />
                </button>

                <div className="text-center mb-4">
                    <div className="flex-center mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)', width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto' }}>
                        <Send size={30} color="#10b981" />
                    </div>
                    <h3>Share Document</h3>
                    <p className="text-secondary mt-4">
                        Share <strong>{documentTitle}</strong> via Wallet Address.
                    </p>
                </div>

                <div className="form-group">
                    <label className="form-label text-secondary" style={{ fontSize: '0.9rem' }}>Recipient Wallet Address</label>
                    <div className="flex-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                        <User size={18} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
                        <input
                            type="text"
                            placeholder="0x..."
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', flex: 1, outline: 'none' }}
                            value={recipientWallet}
                            onChange={(e) => setRecipientWallet(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-between gap-2">
                    <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button
                        onClick={handleShare}
                        className="btn-primary"
                        style={{ flex: 1, background: '#10b981', borderColor: '#10b981' }}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
