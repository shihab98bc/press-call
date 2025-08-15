
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
            <div className="flex flex-col gap-4 text-sm text-[#111b21]">
                <div>
                    <p><strong>Name:</strong> {userProfile.name} {userProfile.emoji}</p>
                    <p><strong>Email:</strong> {userProfile.email}</p>
                    <p className="mt-2 text-xs text-[#667781]">
                        <strong>Your ID:</strong> {userProfile.userId}<br/>
                        (Share this with friends to connect)
                    </p>
                </div>
                {/* <div>
                    <h3 className="font-bold mb-2">Blocked Users</h3>
                    <div className="text-gray-500">No blocked users.</div>
                </div> */}
                <button
                    onClick={onLogout}
                    className="w-full mt-4 bg-[#e91e63] text-white border-none p-2.5 rounded-md hover:bg-opacity-90"
                >
                    Log Out
                </button>
            </div>
        </Modal>
    );
};

export default ProfileViewModal;