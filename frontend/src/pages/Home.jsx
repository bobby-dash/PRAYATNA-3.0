import React from 'react';
import { Shield, Lock, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="container fade-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Tamper-Proof Data Sharing <br /> on the Blockchain
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 3rem' }}>
                Securely upload and share documents with the power of Ethereum and IPFS.
                Immutable records ensure your data integrity is never compromised.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '5rem' }}>
                <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem', textDecoration: 'none' }}>Start Securing Now</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <FeatureCard
                    icon={<Lock size={40} color="var(--accent)" />}
                    title="AES-256 Encryption"
                    desc="Military-grade encryption ensures only authorized users can access the content of your files."
                />
                <FeatureCard
                    icon={<Shield size={40} color="var(--success)" />}
                    title="Blockchain Verification"
                    desc="SHA-256 hashes stored on Ethereum Smart Contracts provide immutable proof of existence and integrity."
                />
                <FeatureCard
                    icon={<Share2 size={40} color="var(--accent-hover)" />}
                    title="Decentralized Storage"
                    desc="Files are stored on IPFS, ensuring redundancy and availability without a central point of failure."
                />
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
        <div style={{ marginBottom: '1rem' }}>{icon}</div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

export default Home;
