import React from 'react';
import PropTypes from 'prop-types';

const StatCard = ({ title, value, icon, color }) => {
    // Extract RGB values if needed or just use the color string passed
    const bgStyle = {
        background: `rgba(${color}, 0.1)`,
        color: `rgb(${color})`
    };

    return (
        <div className="glass-panel stat-card hover-scale">
            <div className="stat-icon-container" style={bgStyle}>
                {icon}
            </div>
            <div className="stat-info">
                <h3 className="stat-value">{value}</h3>
                <p className="stat-title">{title}</p>
            </div>
        </div>
    );
};

StatCard.propTypes = {
    title: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    icon: PropTypes.element,
    color: PropTypes.string
};

export default StatCard;
