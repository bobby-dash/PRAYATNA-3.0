import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, Lock } from 'lucide-react';

const AccessRequestModal = ({ isOpen, onClose, documentId, documentTitle }) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleRequest = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            await axios.post(`${apiUrl}/access/request`, { documentId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Access request sent successfully!');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="glass-panel" style={{ width: '400px', padding: '2rem', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <Lock size={30} color="var(--accent)" />
                    </div>
                    <h3>Request Access</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        You are requesting access to <strong>{documentTitle}</strong>.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button
                        onClick={handleRequest}
                        className="btn-primary"
                        style={{ flex: 1 }}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessRequestModal;
