
import React from 'react';

interface IconButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    title?: string;
    className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ children, onClick, title, className = '' }) => {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`bg-transparent border-none cursor-pointer p-2 flex items-center justify-center text-[#f0f2f5] rounded-full hover:bg-white/10 ${className}`}
        >
            {children}
        </button>
    );
};

export default IconButton;
