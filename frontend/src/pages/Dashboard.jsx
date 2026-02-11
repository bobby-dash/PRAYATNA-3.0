import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { WalletContext } from '../context/WalletContext';
import {
    FileText,
    Shield,
    HardDrive,
    Activity,
    Plus,
    Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import StatCard from '../components/StatCard';
import FileCard from '../components/FileCard';
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
                } catch (error) {
                    console.error("Wallet sync failed", error);
                }
            }
        };
        syncWalletToBackend();
    }, [user, account]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

                // Fetch My Docs
                const resDocs = await axios.get(`${apiUrl}/upload/my-docs`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMyDocs(resDocs.data);

                // Fetch Shared Docs (Approved Requests)
                const resRequests = await axios.get(`${apiUrl}/access/requests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const approved = resRequests.data.outgoing
                    .filter(req => req.status === 'approved' && req.document && req.owner)
                    .map(req => {
                        return {
                            ...req.document,
                            _id: req.document._id,
                            requestId: req._id,
                            owner: req.owner,
                            createdAt: req.approvalDate || req.requestDate
                        };
                    });

                setSharedDocs(approved);

            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
                if (error.response?.status === 401) {
                    toast.error("Session expired. Please login again.");
                }
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);

    }, [user]);

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

    const handleDeleteFile = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            await axios.delete(`${apiUrl}/upload/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('File deleted successfully');
            fetchDocs(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete file');
        }
    };

    return (
        <div className="container fade-in" style={{ marginTop: '4rem' }}>
            <div className="dashboard-header mb-8">
                <div>
                    <h2>My Dashboard</h2>
                    <p className="text-secondary">Manage your secure documents</p>
                </div>
                <header className="mb-8 fade-in">
                    <h1 className="text-gradient">Welcome back, {user?.username}</h1>
                    <p className="text-secondary">Here's what's happening with your secure documents.</p>
                </header>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
                <StatCard
                    title="Total Uploads"
                    value={myDocs.length}
                    icon={<FileText />}
                    color="59, 130, 246"
                />
                <StatCard
                    title="Shared With Me"
                    value={sharedDocs.length}
                    icon={<Shield />}
                    color="16, 185, 129"
                />
                <StatCard
                    title="Storage Used"
                    value={`${(myDocs.length * 1.5).toFixed(1)} MB`}
                    icon={<HardDrive />}
                    color="245, 158, 11"
                />
            </div>

            {/* Quick Actions & Recent Uploads */}
            <div className="flex-between mb-4 fade-in" style={{ animationDelay: '0.2s' }}>
                <h3>Recent Uploads</h3>
                <div className="flex-center gap-2">
                    <Link to="/search">
                        <button className="btn-secondary flex-center gap-2">
                            <Search size={18} /> Find Docs
                        </button>
                    </Link>
                    <Link to="/upload">
                        <button className="btn-primary flex-center gap-2">
                            <Plus size={18} /> Upload New
                        </button>
                    </Link>
                </div>
            </div>

            {/* My Uploads Grid */}
            {myDocs.length > 0 ? (
                <div className="grid grid-cols-3 mb-8 fade-in" style={{ animationDelay: '0.3s' }}>
                    {myDocs.map(doc => (
                        <FileCard
                            key={doc._id}
                            file={doc}
                            isShared={false}
                            onDownload={handleDownload}
                            onShare={openShareModal}
                            onDelete={handleDeleteFile}
                        />
                    ))}
                </div>
            ) : (
                <div className="glass-panel text-center mb-8 fade-in" style={{ padding: '3rem' }}>
                    <p className="text-secondary">You haven't uploaded any documents yet.</p>
                </div>
            )}

            {/* Shared with Me Section */}
            {sharedDocs.length > 0 && (
                <>
                    <h3 className="mb-4 fade-in" style={{ animationDelay: '0.4s' }}>Shared with Me</h3>
                    <div className="grid grid-cols-3 mb-8 fade-in" style={{ animationDelay: '0.5s' }}>
                        {sharedDocs.map(doc => (
                            <FileCard
                                key={doc._id || doc.requestId}
                                file={doc}
                                isShared={true}
                                onDownload={handleDownload}
                            />
                        ))}
                    </div>
                </>
            )}

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
