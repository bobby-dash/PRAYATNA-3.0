import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button
            onClick={toggleTheme}
            style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
            }}
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <Moon size={20} color="var(--text-primary)" />
            ) : (
                <Sun size={20} color="var(--text-primary)" />
            )}
        </button>
    );
};

export default ThemeToggle;
