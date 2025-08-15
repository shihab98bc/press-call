
import React from 'react';
import Modal from './Modal';
import { UserProfile } from '../../types';

interface ProfileViewModalProps {
    userProfile: UserProfile;
    onClose: () => void;
    onLogout: () => void;
}

const ProfileViewModal: React.FC<ProfileViewModalProps> = ({ userProfile, onClose, onLogout }) => {
    return (
        <Modal onClose={onClose} title="Profile & Settings">
            <div className="flex flex-col gap-4 text-[#111b21]">
                <div className="space-y-3 text-base">
                    <p className="break-words">
                        <strong className="font-bold">Name:</strong> {userProfile.name} {userProfile.emoji}
                    </p>
                    <p className="break-words">
                        <strong className="font-bold">Email:</strong> {userProfile.email}
                    </p>
                    <div className="pt-1">
                        <p className="break-words">
                            <strong className="font-bold">Your ID:</strong> {userProfile.userId}
                        </p>
                        <p className="text-xs text-[#667781]">(Share this with friends to connect)</p>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full mt-2 bg-[#e91e63] text-white border-none p-3 rounded-lg text-base font-bold cursor-pointer hover:bg-[#e91e63]/90 transition-colors"
                >
                    Log Out
                </button>
            </div>
        </Modal>
    );
};

export default ProfileViewModal;
