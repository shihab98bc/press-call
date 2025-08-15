
import React, { useState } from 'react';
import Modal from './Modal';

interface AddFriendModalProps {
    onClose: () => void;
    onSubmit: (friendId: string) => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ onClose, onSubmit }) => {
    const [friendId, setFriendId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (friendId.trim()) {
            onSubmit(friendId.trim());
        }
    };

    return (
        <Modal onClose={onClose} title="Add a Friend">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    value={friendId}
                    onChange={(e) => setFriendId(e.target.value)}
                    placeholder="Enter Friend's ID"
                    className="p-3 border border-[#e9edef] rounded-md text-base focus:outline-2 focus:outline-[#34B7F1] focus:border-transparent"
                    required
                />
                <button
                    type="submit"
                    className="p-3 bg-[#008069] text-white border-none rounded-md text-base font-medium cursor-pointer hover:bg-opacity-90"
                >
                    Send Request
                </button>
            </form>
        </Modal>
    );
};

export default AddFriendModal;
