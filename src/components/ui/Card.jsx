import React from 'react';

export const Card = ({ children, className = '', onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl p-5 shadow-lg border border-gray-100 ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} ${className}`}
        >
            {children}
        </div>
    );
};
