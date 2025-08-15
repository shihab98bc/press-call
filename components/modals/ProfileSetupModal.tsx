
import React, { useState } from 'react';
import Modal from './Modal';

interface ProfileSetupModalProps {
    onSubmit: (name: string, emoji: string) => void;
}

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && emoji.trim()) {
            onSubmit(name, emoji);
        }
    };

    return (
        <div className="absolute inset-0 w-full h-full bg-black/50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-5 rounded-lg min-w-[300px] max-w-[90%] shadow-lg">
                <h2 className="mb-4 text-xl font-bold text-[#111b21]">Set up your profile</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="p-3 border border-[#e9edef] rounded-md text-base focus:outline-2 focus:outline-[#34B7F1] focus:border-transparent"
                        required
                    />
                    <input
                        type="text"
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        placeholder="Your Emoji (e.g., 😊)"
                        maxLength={2}
                        className="p-3 border border-[#e9edef] rounded-md text-base focus:outline-2 focus:outline-[#34B7F1] focus:border-transparent"
                        required
                    />
                    <button
                        type="submit"
                        className="p-3 bg-[#008069] text-white border-none rounded-md text-base font-medium cursor-pointer hover:bg-opacity-90"
                    >
                        Save Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetupModal;