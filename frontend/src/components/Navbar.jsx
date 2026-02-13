import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { WalletContext } from '../context/WalletContext';
import { NotificationContext } from '../context/NotificationContext';
import { ThemeContext } from '../context/ThemeContext';
import {
    Shield,
    Upload,
    FileText,
    Search,
    LogOut,
    Wallet,
    LayoutDashboard,
    User,
    Sun,
    Moon,
    Menu,
    X
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { account, connectWallet } = useContext(WalletContext);
    const { requestCount } = useContext(NotificationContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show navbar when scrolled down
            if (currentScrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            // Hide/show based on scroll direction
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    // Public navbar (for landing page, login, register)
    if (!user) {
        return (
            <header className="navbar-container">
                <nav className="navbar glass-panel">
                    <Link to="/" className="navbar-logo">
                        <Shield color="var(--accent)" size={32} />
                        <span className="logo-text">SecureShare</span>
                    </Link>

                    <div className="navbar-actions">
                        <button onClick={toggleTheme} className="icon-btn">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn-primary">Get Started</Link>
                    </div>
                </nav>
            </header>
        );
    }

    // Authenticated navbar (sticky with scroll behavior)
    return (
        <header className={`navbar-container sticky ${isScrolled ? 'scrolled' : ''} ${isVisible ? 'visible' : 'hidden'}`}>
            <nav className="navbar glass-panel">
                <Link to="/dashboard" className="navbar-logo">
                    <Shield color="var(--accent)" size={28} />
                    <span className="logo-text">SecureShare</span>
                </Link>

                <div className="navbar-nav">
                    <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/upload" className={`nav-item ${isActive('/upload') ? 'active' : ''}`}>
                        <Upload size={18} />
                        <span>Upload</span>
                    </Link>
                    <Link to="/search" className={`nav-item ${isActive('/search') ? 'active' : ''}`}>
                        <Search size={18} />
                        <span>Discover</span>
                    </Link>
                    <Link to="/requests" className={`nav-item ${isActive('/requests') ? 'active' : ''}`}>
                        <FileText size={18} />
                        <span>Requests</span>
                        {requestCount > 0 && (
                            <span className="nav-badge">{requestCount}</span>
                        )}
                    </Link>
                </div>

                <div className="navbar-actions">
                    <button
                        onClick={connectWallet}
                        className={`wallet-btn-nav ${account ? 'connected' : ''}`}
                        title={account ? 'Wallet Connected' : 'Connect Wallet'}
                    >
                        <Wallet size={18} />
                        <span className="wallet-text">
                            {account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Connect'}
                        </span>
                    </button>

                    <Link to="/profile" className="profile-btn desktop-only" title="Profile">
                        <div className="user-avatar-small">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </Link>

                    <button onClick={toggleTheme} className="icon-btn desktop-only" title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button onClick={handleLogout} className="icon-btn logout-btn desktop-only" title="Logout">
                        <LogOut size={18} />
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="icon-btn mobile-menu-toggle"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="mobile-menu-backdrop"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="mobile-menu glass-panel">
                    <div className="mobile-menu-content">
                        {/* Navigation Links */}
                        <Link to="/dashboard" className={`mobile-nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/upload" className={`mobile-nav-item ${isActive('/upload') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            <Upload size={20} />
                            <span>Upload</span>
                        </Link>
                        <Link to="/search" className={`mobile-nav-item ${isActive('/search') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            <Search size={20} />
                            <span>Discover</span>
                        </Link>
                        <Link to="/requests" className={`mobile-nav-item ${isActive('/requests') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            <FileText size={20} />
                            <span>Requests</span>
                            {requestCount > 0 && (
                                <span className="nav-badge">{requestCount}</span>
                            )}
                        </Link>

                        <div className="mobile-menu-divider"></div>

                        {/* Wallet Button */}
                        <button
                            onClick={connectWallet}
                            className={`mobile-wallet-btn ${account ? 'connected' : ''}`}
                        >
                            <Wallet size={20} />
                            <span>
                                {account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Connect Wallet'}
                            </span>
                        </button>

                        {/* Profile Link */}
                        <Link to="/profile" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
                            <User size={20} />
                            <span>Profile</span>
                        </Link>

                        {/* Theme Toggle */}
                        <button onClick={toggleTheme} className="mobile-nav-item">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>

                        {/* Logout */}
                        <button onClick={handleLogout} className="mobile-nav-item logout">
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
