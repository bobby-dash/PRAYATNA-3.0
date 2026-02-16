import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                toast.success('Logged in successfully');
                navigate('/dashboard');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Login</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
                        <a href="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none' }}>Forgot Password?</a>
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        Don't have an account? <a href="/register" style={{ color: 'var(--accent)' }}>Register</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
