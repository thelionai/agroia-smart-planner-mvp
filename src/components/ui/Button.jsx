import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', onClick, icon: Icon, fullWidth = false }) => {
    const baseStyles = "flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-andean-earth text-white shadow-xl hover:bg-amber-900 border-b-4 border-amber-950 active:border-b-0 active:translate-y-1",
        secondary: "bg-andean-foliage text-white shadow-xl hover:bg-green-800 border-b-4 border-green-950 active:border-b-0 active:translate-y-1",
        accent: "bg-andean-maize text-gray-900 shadow-xl hover:bg-yellow-400 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1",
        danger: "bg-red-500 text-white shadow-xl hover:bg-red-600 border-b-4 border-red-800 active:border-b-0 active:translate-y-1",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        >
            {Icon && <Icon className="w-6 h-6" />}
            {children}
        </button>
    );
};
