import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Search from './pages/Search';
import Requests from './pages/Requests';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const location = useLocation();

  // Define public routes where Navbar should appear
  const publicRoutes = ['/', '/login', '/register'];
  const isPublic = publicRoutes.includes(location.pathname);

  return (
    <ThemeProvider>
      <div className="app-layout">
        {isPublic ? (
          <div style={{ width: '100%' }}>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        ) : (
          <>
            <Sidebar />
            <main className="main-content fade-in">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/search" element={<Search />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
              </Routes>
            </main>
          </>
        )}
        <Toaster position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)'
            }
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
