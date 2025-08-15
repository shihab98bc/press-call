
import React, { useState, useEffect } from 'react';
import { Panel, Contact, FriendRequest, CallLog } from '../types';
import IconButton from '../components/IconButton';
import { AddFriendIcon, MenuIcon, VoiceCallIcon, VideoCallIcon } from '../components/icons';

interface MainViewProps {
    contacts: Contact[];
    friendRequests: FriendRequest[];
    callHistory: CallLog[];
    unreadCountsByContact: { [contactId: string]: number };
    onOpenChat: (contact: Contact) => void;
    onAddFriend: () => void;
    onOpenProfile: () => void;
    onAcceptRequest: (request: FriendRequest) => void;
    onRejectRequest: (request: FriendRequest) => void;
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
                <span className="absolute top-2.5 right-4 bg-[#008069] text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {badgeCount > 9 ? '9+' : badgeCount}
                </span>
            )}
        </div>
    );
};

const ListItem: React.FC<{ emoji: string; name: string; subtext: string; onClick?: () => void; children?: React.ReactNode }> = ({ emoji, name, subtext, onClick, children }) => (
    <div className="flex items-center p-3 cursor-pointer border-b border-[#e9edef] bg-white hover:bg-gray-100" onClick={onClick}>
        <div className="text-4xl mr-4">{emoji}</div>
        <div className="flex-1 min-w-0">
            <div className="font-medium text-base text-[#111b21] truncate">{name}</div>
            <div className="text-sm text-[#667781] truncate">{subtext}</div>
        </div>
        <div className="flex items-center gap-2 ml-2">{children}</div>
    </div>
);

const MainView: React.FC<MainViewProps> = ({ contacts, friendRequests, callHistory, onOpenChat, onAddFriend, onOpenProfile, onAcceptRequest, onRejectRequest, unreadCountsByContact }) => {
    const [activePanel, setActivePanel] = useState<Panel>(Panel.CHATS);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setSearchQuery('');
    }, [activePanel]);

    const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredRequests = friendRequests.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredCallHistory = callHistory.filter(log => log.with.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const renderPanelContent = () => {
        switch (activePanel) {
            case Panel.CHATS:
                return filteredContacts.length > 0 ? (
                    filteredContacts.map(contact => {
                        const unreadCount = unreadCountsByContact[contact.uid] || 0;
                        return (
                            <ListItem key={contact.uid} emoji={contact.emoji} name={contact.name} subtext="Tap to chat" onClick={() => onOpenChat(contact)}>
                                {unreadCount > 0 && (
                                    <span className="bg-[#008069] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </ListItem>
                        );
                    })
                ) : <p className="p-4 text-center text-[#667781]">{searchQuery ? 'No contacts found.' : 'Add friends to start chatting!'}</p>;

            case Panel.UPDATES:
                 return filteredRequests.length > 0 ? (
                    filteredRequests.map(req => (
                        <ListItem key={req.key} emoji={req.emoji} name={req.name} subtext="Wants to be your contact">
                           <div className="flex gap-2">
                                <button onClick={() => onAcceptRequest(req)} className="px-3 py-1.5 rounded-md border-none cursor-pointer text-white text-sm bg-[#4CAF50]">Accept</button>
                                <button onClick={() => onRejectRequest(req)} className="px-3 py-1.5 rounded-md border-none cursor-pointer text-white text-sm bg-[#e91e63]">Reject</button>
                            </div>
                        </ListItem>
                    ))
                ) : <p className="p-4 text-center text-[#667781]">{searchQuery ? 'No requests found.' : 'No new friend requests.'}</p>;
            
            case Panel.CALLS:
                return filteredCallHistory.length > 0 ? (
                    filteredCallHistory.map(log => (
                        <ListItem key={log.key} emoji={log.with.emoji} name={log.with.name} subtext={`${log.direction} call on ${new Date(log.timestamp).toLocaleDateString()}`}>
                            <div className="text-[#005c97]">
                                {log.type === 'video' ? <VideoCallIcon color="currentColor" /> : <VoiceCallIcon color="currentColor" />}
                            </div>
                        </ListItem>
                    ))
                ) : <p className="p-4 text-center text-[#667781]">{searchQuery ? 'No calls found.' : 'No recent calls.'}</p>;

            default:
                return null;
        }
    };
    
    const totalUnread = Object.values(unreadCountsByContact).reduce((sum, count) => sum + count, 0);

    return (
        <div className="flex flex-col w-full h-full bg-[#f0f2f5]">
            <header className="bg-[#005c97] text-[#f0f2f5] shadow-md z-10">
                <div className="flex justify-between items-center pt-4 px-4 pb-2">
                    <h1 className="text-2xl font-medium">Press Call</h1>
                    <div className="flex gap-2">
                        <IconButton onClick={onAddFriend} title="Add Friend"><AddFriendIcon /></IconButton>
                        <IconButton onClick={onOpenProfile} title="Profile & Settings"><MenuIcon /></IconButton>
                    </div>
                </div>
                <nav className="flex justify-around">
                    <NavTab title="CHATS" isActive={activePanel === Panel.CHATS} onClick={() => setActivePanel(Panel.CHATS)} badgeCount={totalUnread} />
                    <NavTab title="UPDATES" isActive={activePanel === Panel.UPDATES} onClick={() => setActivePanel(Panel.UPDATES)} badgeCount={friendRequests.length} />
                    <NavTab title="CALLS" isActive={activePanel === Panel.CALLS} onClick={() => setActivePanel(Panel.CALLS)} badgeCount={0} />
                </nav>
            </header>
            <main className="flex-1 flex flex-col overflow-y-auto">
                <div className="p-2 bg-gray-100 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder={`Search in ${activePanel}...`}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full py-1.5 px-4 rounded-full text-base bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#34B7F1] focus:border-transparent"
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {renderPanelContent()}
                </div>
            </main>
        </div>
    );
};

export default MainView;
