import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, CheckCircle, XCircle, Clock, File } from 'lucide-react';

const Requests = () => {
    const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.get(`${apiUrl}/access/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId, status) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            await axios.post(`${apiUrl}/access/approve`, { requestId, status }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`Request ${status} successfully`);
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error('Action failed');
        }
    };

    const RequestList = ({ list, isIncoming }) => {
        if (list.length === 0) return <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No requests found.</div>;

        return (
            <div className="grid">
                {list.map(req => (
                    <div key={req._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <File size={20} color="var(--accent)" />
                                <span style={{ fontWeight: 500 }}>{req.document?.title || 'Unknown Doc'}</span>
                            </div>
                            <span style={{
                                fontSize: '0.8rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                background: req.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : req.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                color: req.status === 'approved' ? '#34d399' : req.status === 'rejected' ? '#f87171' : '#facc15'
                            }}>
                                {req.status}
                            </span>
                        </div>

                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {isIncoming ? (
                                <>
                                    <User size={14} style={{ marginRight: '0.5rem' }} />
                                    Requester: <strong>{req.requester?.username}</strong> ({req.requester?.email})
                                </>
                            ) : (
                                <>
                                    <User size={14} style={{ marginRight: '0.5rem' }} />
                                    Owner: <strong>{req.owner?.username}</strong>
                                </>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
                            <Clock size={14} style={{ marginRight: '0.4rem' }} />
                            {new Date(req.requestDate).toLocaleDateString()}
                        </div>

                        {isIncoming && req.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, background: '#10b981', borderColor: '#10b981' }}
                                    onClick={() => handleAction(req._id, 'approved')}
                                >
                                    Approve
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                                    onClick={() => handleAction(req._id, 'rejected')}
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container fade-in" style={{ marginTop: '4rem' }}>
            <h2 style={{ marginBottom: '2rem' }}>Access Requests</h2>

            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Incoming Requests</h3>
                <RequestList list={requests.incoming} isIncoming={true} />
            </div>

            <div>
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Outgoing Requests</h3>
                <RequestList list={requests.outgoing} isIncoming={false} />
            </div>
        </div>
    );
};

export default Requests;
