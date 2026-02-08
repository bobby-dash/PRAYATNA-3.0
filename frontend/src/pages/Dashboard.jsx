import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { WalletContext } from '../context/WalletContext';
import { FileText, Download, Calendar, Share2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import ShareModal from '../components/ShareModal';

const Dashboard = () => {
    const [myDocs, setMyDocs] = useState([]);
    const [sharedDocs, setSharedDocs] = useState([]);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const { user } = useContext(AuthContext);
    const { account } = useContext(WalletContext);

    useEffect(() => {
        const syncWalletToBackend = async () => {
            if (user && account) {
                try {
                    const token = localStorage.getItem('token');
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    await axios.post(`${apiUrl}/auth/update-wallet`, { walletAddress: account }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    // Silent success - ensuring backend is in sync
                } catch (error) {
                    console.error("Wallet sync failed", error);
                }
            }
        };
        syncWalletToBackend();
    }, [user, account]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return; // Wait for user
            try {
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

                // Fetch My Docs
                const resDocs = await axios.get(`${apiUrl}/upload/my-docs`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMyDocs(resDocs.data);

                // Fetch Shared Docs (Approved Requests)
                // In our system, a 'shared doc' is an AccessRequest where:
                // 1. requester = me (I asked or was granted direct access)
                // 2. status = approved
                const resRequests = await axios.get(`${apiUrl}/access/requests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const approved = resRequests.data.outgoing
                    .filter(req => req.status === 'approved')
                    .map(req => {
                        // Handle potential missing populated fields safely
                        return {
                            ...req.document,
                            _id: req.document?._id, // Ensure ID is top level for DocTable
                            requestId: req._id,
                            owner: req.owner,
                            createdAt: req.approvalDate || req.requestDate // Use approval date if available
                        };
                    })
                    .filter(doc => doc && doc._id); // Filter out any malformed entries

                setSharedDocs(approved);

            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
                if (error.response?.status === 401) {
                    // Token might be expired
                    toast.error("Session expired. Please login again.");
                } else {
                    toast.error("Failed to load dashboard data");
                }
            }
        };

        fetchData();

        // Poll for updates every 10s to ensure "Shared with me" appears if someone grants access while I'm on the page
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);

    }, [user]); // Re-run when user auth state is confirmed

    const handleDownload = async (docId, fileName) => {
        if (!account) return toast.error("Please connect your wallet to download.");

        const toastId = toast.loading("Downloading & Decrypting...");
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const response = await axios.get(`${apiUrl}/upload/download/${docId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Download Complete", { id: toastId });

        } catch (error) {
            console.error(error);
            toast.error("Download Failed", { id: toastId });
        }
    };

    const openShareModal = (doc) => {
        if (!account) return toast.error("Please connect your wallet to share.");
        setSelectedDoc(doc);
        setShareModalOpen(true);
    };

    const DocTable = ({ docs, isShared }) => (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Name</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Owner</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Date</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {docs.length > 0 ? docs.map(doc => (
                        <tr key={doc._id || doc.requestId} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '1rem' }}>
                                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                                    <FileText size={20} color="var(--accent)" />
                                    <span style={{ fontWeight: 500 }}>{doc.fileName || doc.title}</span>
                                </div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                {isShared ? (
                                    <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                        <Share2 size={14} /> {doc.owner?.username}
                                    </span>
                                ) : (
                                    <span className="text-secondary">Me</span>
                                )}
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <div className="flex-center text-secondary" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                    <Calendar size={14} />
                                    {new Date(doc.createdAt || Date.now()).toLocaleDateString()}
                                </div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleDownload(doc._id, doc.fileName)}
                                        className="btn-primary flex-center"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', gap: '0.4rem' }}
                                    >
                                        <Download size={14} /> Download
                                    </button>
                                    {!isShared && (
                                        <button
                                            onClick={() => openShareModal(doc)}
                                            className="btn-secondary flex-center"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', gap: '0.4rem' }}
                                        >
                                            <Share2 size={14} /> Share
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4" className="text-center text-secondary" style={{ padding: '3rem' }}>
                                No documents found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="container fade-in" style={{ marginTop: '2rem' }}>
            <div className="flex-between mb-4">
                <h2>My Dashboard</h2>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                    Organization: <span style={{ color: 'var(--accent)' }}>{user?.username}</span>
                </div>
            </div>

            <div className="glass-panel mb-4" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'rgba(59, 130, 246, 0.05)' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>My Uploads</h3>
                </div>
                <DocTable docs={myDocs} isShared={false} />
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'rgba(16, 185, 129, 0.05)' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Shared with Me</h3>
                </div>
                <DocTable docs={sharedDocs} isShared={true} />
            </div>

            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                documentId={selectedDoc?._id}
                documentTitle={selectedDoc?.title || selectedDoc?.fileName}
            />
        </div>
    );
};

export default Dashboard;
