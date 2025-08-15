
import React from 'react';

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
    title: string;
}

const Modal: React.FC<ModalProps> = ({ children, onClose, title }) => {
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="absolute inset-0 w-full h-full bg-black/50 z-50 flex justify-center items-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white p-5 rounded-lg min-w-[300px] max-w-[90%] shadow-lg animate-fade-in-up">
                <h2 className="mb-4 text-xl font-bold text-[#111b21]">{title}</h2>
                {children}
            </div>
        </div>
    );
};

export default Modal;