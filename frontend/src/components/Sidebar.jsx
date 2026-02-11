import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { WalletContext } from '../context/WalletContext';
import { NotificationContext } from '../context/NotificationContext';
import { ThemeContext } from '../context/ThemeContext';
import {
    LayoutDashboard,
    UploadCloud,
    Search,
    FileInput,
    LogOut,
    Shield,
    Wallet,
    Sun,
    Moon,
    User,
    Settings
} from 'lucide-react';

const Sidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const { requestCount } = useContext(NotificationContext);
    const { account, connectWallet } = useContext(WalletContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <UploadCloud size={20} />, label: 'Upload', path: '/upload' },
        { icon: <Search size={20} />, label: 'Discover', path: '/search' },
        { icon: <FileInput size={20} />, label: 'Requests', path: '/requests', badge: requestCount },
    ];

    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-header">
                <div className="logo-container">
                    <Shield className="logo-icon" />
                    <span className="logo-text">SecureShare</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.badge > 0 && (
                            <span className="badge">{item.badge}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button
                    onClick={connectWallet}
                    className={`wallet-btn ${account ? 'connected' : ''}`}
                    title={account ? 'Wallet Connected' : 'Connect Wallet'}
                >
                    <Wallet size={18} />
                    <span>
                        {account
                            ? `${account.substring(0, 6)}...${account.substring(38)}`
                            : 'Connect Wallet'}
                    </span>
                </button>

                <Link
                    to="/profile"
                    className="profile-link"
                    title="View Profile"
                >
                    <div className="user-profile">
                        <div className="user-avatar">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.username || 'User'}</span>
                            <span className="user-role">Verified User</span>
                        </div>
                    </div>
                    <User size={18} className="profile-icon" />
                </Link>

                <div className="footer-actions">
                    <button
                        onClick={toggleTheme}
                        className="icon-btn theme-toggle"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="icon-btn logout"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
