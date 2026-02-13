import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Lock, Download, Save, Shield, Database } from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);

    const [orgName, setOrgName] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.put(`${apiUrl}/auth/update-profile`,
                { username: orgName, email },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            updateUser(res.data);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error("New passwords don't match");
        }
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.put(`${apiUrl}/auth/change-password`,
                { currentPassword: passwords.current, newPassword: passwords.new },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Password changed successfully');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Change password failed');
        }
    };

    const handleBackup = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.get(`${apiUrl}/auth/backup`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Trigger Download
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `backup_${user.username}_${Date.now()}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            toast.success('Backup downloaded');
        } catch (error) {
            toast.error('Backup failed');
        }
    };

    return (
        <div className="container fade-in" style={{ maxWidth: '900px' }}>
            <h1 className="mb-8">Profile & Settings</h1>

            <div className="profile-grid">
                {/* Organization Profile */}
                <div className="glass-panel profile-section">
                    <div className="section-header">
                        <User className="section-icon" size={24} />
                        <h3>Organization Profile</h3>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="orgName">Organization Name</label>
                            <input
                                id="orgName"
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                className="input-field"
                                placeholder="Enter organization name"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="Enter email address"
                            />
                        </div>
                        <button type="submit" className="btn-primary">
                            <Save size={18} />
                            <span>Update Profile</span>
                        </button>
                    </form>
                </div>

                {/* Security */}
                <div className="glass-panel profile-section">
                    <div className="section-header">
                        <Shield className="section-icon" size={24} />
                        <h3>Security</h3>
                    </div>
                    <form onSubmit={handleChangePassword} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <input
                                id="currentPassword"
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="input-field"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className="password-grid">
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    className="input-field"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="input-field"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-secondary">
                            <Lock size={18} />
                            <span>Change Password</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
