import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { WalletContext } from '../context/WalletContext';
import axios from 'axios';
import { Upload as UploadIcon, File as FileIcon, Loader, CheckCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
    const [mode, setMode] = useState('file'); // 'file' | 'text'
    const [file, setFile] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [metadata, setMetadata] = useState({
        title: '',
        category: 'General',
        tags: '',
        description: ''
    });
    const [uploading, setUploading] = useState(false);

    const { user } = useContext(AuthContext);
    const { account } = useContext(WalletContext);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleMetadataChange = (e) => {
        setMetadata({ ...metadata, [e.target.name]: e.target.value });
    };

    const handleUpload = async () => {
        if (!account) {
            return toast.error("Please connect your wallet to upload documents.");
        }

        let uploadFile = file;

        // If text mode, convert text to a file
        if (mode === 'text') {
            if (!metadata.title) return toast.error("Title is required for text uploads");
            if (!textContent) return toast.error("Content is empty");

            const blob = new Blob([textContent], { type: 'text/plain' });
            uploadFile = new File([blob], `${metadata.title.replace(/\s+/g, '_')}.txt`, { type: 'text/plain' });
        } else {
            if (!uploadFile) return toast.error("Please select a file");
        }

        if (!metadata.title) {
            // Auto-fill title from filename if empty
            metadata.title = uploadFile.name;
        }

        setUploading(true);
        const toastId = toast.loading("Uploading, Encrypting & Registering on Blockchain...");

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('title', metadata.title);
        formData.append('category', metadata.category);
        formData.append('tags', metadata.tags);
        formData.append('description', metadata.description);

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            await axios.post(`${apiUrl}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            toast.success("Document Uploaded & Registered!", { id: toastId });
            setTimeout(() => navigate('/dashboard'), 2000);

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Upload failed", { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container fade-in" style={{ marginTop: '2rem', maxWidth: '800px' }}>
            <div className="glass-panel">
                <div className="text-center mb-4">
                    <h2>Secure Upload</h2>
                    <p className="text-secondary">Store your sensitive documents or notes with encryption on IPFS & Blockchain.</p>
                </div>

                {!account && (
                    <div className="flex-center mb-4" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <strong>Note:</strong> &nbsp; You must connect your wallet to upload.
                    </div>
                )}

                <div className="flex-center gap-2 mb-4" style={{ background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '8px', display: 'inline-flex', width: '100%' }}>
                    <button
                        className={mode === 'file' ? 'btn-primary' : 'btn-secondary'}
                        style={{ flex: 1 }}
                        onClick={() => setMode('file')}
                    >
                        <UploadIcon size={18} style={{ marginRight: '8px' }} /> File Upload
                    </button>
                    <button
                        className={mode === 'text' ? 'btn-primary' : 'btn-secondary'}
                        style={{ flex: 1 }}
                        onClick={() => setMode('text')}
                    >
                        <FileText size={18} style={{ marginRight: '8px' }} /> Text / Note
                    </button>
                </div>

                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                        type="text"
                        name="title"
                        placeholder={mode === 'file' ? "Document Title (Optional)" : "Note Title (Required)"}
                        className="input-field"
                        value={metadata.title}
                        onChange={handleMetadataChange}
                    />
                </div>

                {mode === 'file' ? (
                    <div
                        style={{
                            border: '2px dashed var(--border)',
                            borderRadius: '12px',
                            padding: '3rem',
                            marginBottom: '1.5rem',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s',
                            textAlign: 'center'
                        }}
                        onClick={() => document.getElementById('fileInput').click()}
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = 'var(--border)';
                            if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
                        }}
                    >
                        <input
                            type="file"
                            id="fileInput"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        {file ? (
                            <div className="flex-col flex-center gap-2">
                                <FileIcon size={48} color="var(--accent)" />
                                <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>{file.name}</p>
                                <p className="text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <div className="flex-col flex-center gap-2">
                                <UploadIcon size={48} color="var(--text-secondary)" />
                                <p className="text-secondary">Click or Drag file to upload</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="form-group">
                        <label className="form-label">Content</label>
                        <textarea
                            className="textarea-field"
                            style={{ minHeight: '200px', fontFamily: 'monospace' }}
                            placeholder="Write your secure note here..."
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                        />
                    </div>
                )}

                <div className="flex-between gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Category</label>
                        <select
                            name="category"
                            className="input-field"
                            value={metadata.category}
                            onChange={handleMetadataChange}
                        >
                            <option>General</option>
                            <option>Finance</option>
                            <option>Legal</option>
                            <option>Medical</option>
                            <option>Personal</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Tags</label>
                        <input
                            type="text"
                            name="tags"
                            placeholder="e.g. tax, 2024, invoice"
                            className="input-field"
                            value={metadata.tags}
                            onChange={handleMetadataChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Description (Optional)</label>
                    <textarea
                        name="description"
                        className="textarea-field"
                        placeholder="Brief description of the document..."
                        value={metadata.description}
                        onChange={handleMetadataChange}
                        style={{ minHeight: '80px' }}
                    />
                </div>

                {uploading ? (
                    <div className="text-center mt-4">
                        <div className="flex-center mb-4">
                            <Loader className="animate-spin" size={32} color="var(--accent)" />
                        </div>
                        <p>Processing Secure Upload...</p>
                    </div>
                ) : (
                    <button
                        onClick={handleUpload}
                        className="btn-primary"
                        disabled={!file && mode === 'file' || !textContent && mode === 'text'}
                        style={{ width: '100%', opacity: (!file && mode === 'file' || !textContent && mode === 'text') ? 0.5 : 1 }}
                    >
                        Upload Securely (Free)
                    </button>
                )}
            </div>
        </div>
    );
};

export default Upload;
