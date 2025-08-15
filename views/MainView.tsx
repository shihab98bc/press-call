
import React, { useState } from 'react';
import { Panel, Contact, FriendRequest, CallLog, UserProfile } from '../types';
import IconButton from '../components/IconButton';
import { AddFriendIcon, MenuIcon, VoiceCallIcon, VideoCallIcon } from '../components/icons';

interface MainViewProps {
    contacts: Contact[];
    friendRequests: FriendRequest[];
    callHistory: CallLog[];
    onOpenChat: (contact: Contact) => void;
    onAddFriend: () => void;
    onOpenProfile: () => void;
    onAcceptRequest: (request: FriendRequest, currentUid: string) => void;
    onRejectRequest: (request: FriendRequest, currentUid: string) => void;
}

const NavTab: React.FC<{ title: string; isActive: boolean; onClick: () => void; badgeCount: number }> = ({ title, isActive, onClick, badgeCount }) => {
    return (
        <div
            onClick={onClick}
            className={`flex-1 text-center py-4 font-bold relative cursor-pointer transition-colors duration-200 border-b-4 
                ${isActive ? 'text-[#34B7F1] border-[#34B7F1]' : 'text-white/70 border-transparent hover:text-white'}`}
        >
            {title}
            {badgeCount > 0 && (
                <span className="absolute top-2.5 right-4 bg-[#e91e63] text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {badgeCount}
                </span>
            )}
        </div>
    );
};

const ListItem: React.FC<{ emoji: string; name: string; subtext: string; onClick?: () => void; children?: React.ReactNode }> = ({ emoji, name, subtext, onClick, children }) => (
    <div className="flex items-center p-3 cursor-pointer border-b border-[#e9edef] bg-white hover:bg-gray-100" onClick={onClick}>
        <div className="text-4xl mr-4">{emoji}</div>
        <div className="flex-1">
            <div className="font-medium text-base text-[#111b21]">{name}</div>
            <div className="text-sm text-[#667781]">{subtext}</div>
        </div>
        {children}
    </div>
);

const MainView: React.FC<MainViewProps> = ({ contacts, friendRequests, callHistory, onOpenChat, onAddFriend, onOpenProfile, onAcceptRequest, onRejectRequest }) => {
    const [activePanel, setActivePanel] = useState<Panel>(Panel.CHATS);

    const renderPanelContent = () => {
        switch (activePanel) {
            case Panel.CHATS:
                return contacts.length > 0 ? (
                    contacts.map(contact => (
                        <ListItem key={contact.uid} emoji={contact.emoji} name={contact.name} subtext="Tap to chat" onClick={() => onOpenChat(contact)} />
                    ))
                ) : <p className="p-4 text-center text-[#667781]">Add friends to start chatting!</p>;

            case Panel.UPDATES:
                 return friendRequests.length > 0 ? (
                    friendRequests.map(req => (
                        <ListItem key={req.key} emoji={req.emoji} name={req.name} subtext="Wants to be your contact">
                           <div className="flex gap-2">
                                <button onClick={() => onAcceptRequest(req, '')} className="px-3 py-1.5 rounded-md border-none cursor-pointer text-white text-sm bg-[#4CAF50]">Accept</button>
                                <button onClick={() => onRejectRequest(req, '')} className="px-3 py-1.5 rounded-md border-none cursor-pointer text-white text-sm bg-[#e91e63]">Reject</button>
                            </div>
                        </ListItem>
                    ))
                ) : <p className="p-4 text-center text-[#667781]">No new friend requests.</p>;
            
            case Panel.CALLS:
                return callHistory.length > 0 ? (
                    callHistory.map(log => (
                        <ListItem key={log.key} emoji={log.with.emoji} name={log.with.name} subtext={`${log.direction} call on ${new Date(log.timestamp).toLocaleDateString()}`}>
                            <div className="text-[#005c97]">
                                {log.type === 'video' ? <VideoCallIcon color="currentColor" /> : <VoiceCallIcon color="currentColor" />}
                            </div>
                        </ListItem>
                    ))
                ) : <p className="p-4 text-center text-[#667781]">No recent calls.</p>;

            default:
                return null;
        }
    };
    
    return (
        <div className="flex flex-col w-full h-full">
            <header className="bg-[#005c97] text-[#f0f2f5] shadow-md">
                <div className="flex justify-between items-center pt-4 px-4 pb-2">
                    <h1 className="text-2xl font-medium">Press Call</h1>
                    <div className="flex gap-2">
                        <IconButton onClick={onAddFriend} title="Add Friend"><AddFriendIcon /></IconButton>
                        <IconButton onClick={onOpenProfile} title="Profile & Settings"><MenuIcon /></IconButton>
                    </div>
                </div>
                <nav className="flex justify-around">
                    <NavTab title="CHATS" isActive={activePanel === Panel.CHATS} onClick={() => setActivePanel(Panel.CHATS)} badgeCount={0} />
                    <NavTab title="UPDATES" isActive={activePanel === Panel.UPDATES} onClick={() => setActivePanel(Panel.UPDATES)} badgeCount={friendRequests.length} />
                    <NavTab title="CALLS" isActive={activePanel === Panel.CALLS} onClick={() => setActivePanel(Panel.CALLS)} badgeCount={0} />
                </nav>
            </header>
            <main className="flex-1 overflow-y-auto bg-[#f0f2f5]">
                {renderPanelContent()}
            </main>
        </div>
    );
};

export default MainView;