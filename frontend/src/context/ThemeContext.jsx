import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => { }
});

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('theme');
            return savedTheme || 'dark';
        } catch (error) {
            console.warn('Failed to access localStorage:', error);
            return 'dark';
        }
    });

    useEffect(() => {
        try {
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.warn('Failed to write to localStorage:', error);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
