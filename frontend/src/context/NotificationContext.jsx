import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [requestCount, setRequestCount] = useState(0);

    const fetchRequestCount = async (showToast = false) => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.get(`${apiUrl}/access/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Count pending incoming requests
            const pending = res.data.incoming.filter(req => req.status === 'pending').length;

            if (showToast && pending > requestCount) {
                toast("New Access Request Received!", {
                    icon: '🔔',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            }
            setRequestCount(pending);

        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    // Initial Fetch when user logs in
    useEffect(() => {
        if (user) {
            fetchRequestCount(false);
        } else {
            setRequestCount(0);
        }
    }, [user]);

    // Polling every 30 seconds
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(() => {
            fetchRequestCount(true);
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [user, requestCount]); // Depend on requestCount to correctly trigger "new" check

    return (
        <NotificationContext.Provider value={{ requestCount, fetchRequestCount }}>
            {children}
        </NotificationContext.Provider>
    );
};
