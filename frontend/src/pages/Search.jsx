import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search as SearchIcon, Filter, Lock, Unlock, FileText } from 'lucide-react';
import AccessRequestModal from '../components/AccessRequestModal';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null); // For modal

    const handleSearch = async (e) => {
        e?.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.get(`${apiUrl}/search?q=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data.documents);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query) handleSearch();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="container fade-in" style={{ marginTop: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Discover Documents</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Search encrypted documents from verified organizations.</p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <SearchIcon color="var(--text-secondary)" />
                <input
                    type="text"
                    placeholder="Search by title, tags, or category..."
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.1rem', flex: 1, outline: 'none' }}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button className="btn-primary">Search</button>
            </div>

            <div className="grid">
                {results.map(doc => (
                    <div key={doc._id} className="glass-panel card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.8rem', borderRadius: '12px' }}>
                                <FileText color="var(--accent)" size={24} />
                            </div>
                            <span style={{ fontSize: '0.8rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                                {doc.category}
                            </span>
                        </div>

                        <div style={{ paddingLeft: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{doc.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {doc.description || "No description provided."}
                            </p>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <span style={{ opacity: 0.7 }}>By:</span>
                                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{doc.owner?.username || 'Unknown'}</span>
                            </div>
                            <button
                                className="btn-secondary"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                onClick={() => setSelectedDoc(doc)}
                            >
                                <Lock size={14} style={{ marginRight: '0.4rem' }} /> Request Access
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {results.length === 0 && query && !loading && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    No documents found matching "{query}"
                </div>
            )}

            <AccessRequestModal
                isOpen={!!selectedDoc}
                onClose={() => setSelectedDoc(null)}
                documentId={selectedDoc?._id}
                documentTitle={selectedDoc?.title}
            />
        </div>
    );
};

export default Search;
