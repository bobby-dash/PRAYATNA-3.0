import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { WalletContext } from '../context/WalletContext';
import { NotificationContext } from '../context/NotificationContext';
import { Shield, Upload, FileText, Search, LogOut, Wallet } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { account, connectWallet } = useContext(WalletContext);
    const { requestCount } = useContext(NotificationContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'var(--accent)' : 'var(--text-secondary)';
    const linkStyle = (path) => ({
        color: isActive(path),
        textDecoration: 'none',
        fontWeight: location.pathname === path ? 600 : 500
    });

    return (
        <header className="container" style={{ marginTop: '1rem' }}>
            <nav className="glass-panel flex-between" style={{ padding: '1rem 2rem' }}>
                <Link to="/" className="flex-center gap-1" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Shield color="var(--accent)" size={32} />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>SecureShare</span>
                </Link>

                <div className="flex-center gap-2">
                    <ThemeToggle />
                    {user ? (
                        <>
                            <Link to="/dashboard" className="flex-center gap-1" style={linkStyle('/dashboard')}>
                                <FileText size={18} /> Dashboard
                            </Link>
                            <Link to="/upload" className="flex-center gap-1" style={linkStyle('/upload')}>
                                <Upload size={18} /> Upload
                            </Link>
                            <Link to="/search" className="flex-center gap-1" style={linkStyle('/search')}>
                                <Search size={18} /> Discover
                            </Link>
                            <Link to="/requests" className="flex-center gap-1" style={{ ...linkStyle('/requests'), position: 'relative' }}>
                                <FileText size={18} /> Requests
                                {requestCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-12px',
                                        background: 'var(--error)',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        borderRadius: '50%',
                                        width: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {requestCount}
                                    </span>
                                )}
                            </Link>

                            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>

                            <button
                                onClick={connectWallet}
                                className="btn-primary flex-center gap-1"
                                style={{
                                    background: account ? 'var(--success)' : 'var(--accent)',
                                    padding: '0.5rem 1rem',
                                    border: 'none',
                                    color: 'white'
                                }}
                            >
                                <Wallet size={18} />
                                {account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Connect Wallet'}
                            </button>

                            <button onClick={handleLogout} className="btn-secondary" style={{ border: 'none' }}>
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/verify" className="flex-center gap-1" style={linkStyle('/verify')}>
                                <Search size={18} /> Verify
                            </Link>
                            <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Login</Link>
                            <Link to="/register" className="btn-primary">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
