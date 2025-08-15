
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { IconContext } from './components/IconContext';
import AuthView from './views/AuthView';
import MainView from './views/MainView';
import ChatView from './views/ChatView';
import CallView from './views/CallView';
import { View, UserProfile, Contact, FriendRequest, Message } from './types';
import { useWebRTC } from './hooks/useWebRTC';
import { useFirebase } from './hooks/useFirebase';
import ProfileSetupModal from './components/modals/ProfileSetupModal';
import AddFriendModal from './components/modals/AddFriendModal';
import ProfileViewModal from './components/modals/ProfileViewModal';
import IncomingCallModal from './components/modals/IncomingCallModal';

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.LOADING);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const [isProfileSetupModalOpen, setProfileSetupModalOpen] = useState(false);
    const [isAddFriendModalOpen, setAddFriendModalOpen] = useState(false);
    const [isProfileViewModalOpen, setProfileViewModalOpen] = useState(false);

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [callHistory, setCallHistory] = useState<any[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<{ [chatId: string]: number }>({});

    const [currentChatPartner, setCurrentChatPartner] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    
    const { 
      auth, 
      db, 
      setupAuthStateListener, 
      setupUserProfileListener, 
      setupContactsListener,
      setupFriendRequestsListener,
      setupCallHistoryListener,
      setupMessageListener,
      setupUnreadCountsListener,
      removeMessageListener,
      sendFriendRequest,
      acceptFriendRequest,
      rejectFriendRequest,
      sendMessage: fbSendMessage,
      updateUserProfile,
      signOut,
    } = useFirebase();

    const {
        localStream,
        remoteStream,
        incomingCall,
        activeCall,
        isMuted,
        isCameraOff,
        startCall,
        answerCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
    } = useWebRTC(db, userProfile);

    const ringtoneRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        setupAuthStateListener(
            (user: User) => {
                setCurrentUser(user);
                if (user) {
                    setupUserProfileListener(user.uid, (profile) => {
                        if (profile) {
                            setUserProfile(profile);
                            setView(View.MAIN);
                            setProfileSetupModalOpen(false);
                        } else {
                            setProfileSetupModalOpen(true);
                        }
                    });
                } else {
                    setCurrentUser(null);
                    setUserProfile(null);
                    setView(View.AUTH);
                    // Reset all states on logout
                    setContacts([]);
                    setFriendRequests([]);
                    setCallHistory([]);
                    setUnreadCounts({});
                    setCurrentChatPartner(null);
                    setMessages([]);
                }
            },
            () => setView(View.AUTH)
        );
    }, [setupAuthStateListener, setupUserProfileListener]);

    useEffect(() => {
        if (userProfile?.uid) {
            const unsubContacts = setupContactsListener(userProfile.uid, setContacts);
            const unsubRequests = setupFriendRequestsListener(userProfile.uid, setFriendRequests);
            const unsubCalls = setupCallHistoryListener(userProfile.uid, setCallHistory);
            const unsubUnread = setupUnreadCountsListener(userProfile.uid, setUnreadCounts);

            return () => {
                unsubContacts();
                unsubRequests();
                unsubCalls();
                unsubUnread();
            };
        }
    }, [userProfile, setupContactsListener, setupFriendRequestsListener, setupCallHistoryListener, setupUnreadCountsListener]);
    
    useEffect(() => {
      if (incomingCall) {
          ringtoneRef.current?.play();
      } else {
          ringtoneRef.current?.pause();
          if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
      }
    }, [incomingCall]);

    const unreadCountsByContact = useMemo(() => {
        const counts: { [contactId: string]: number } = {};
        if (!userProfile) return counts;

        Object.entries(unreadCounts).forEach(([chatId, count]) => {
            const partnerId = chatId.replace(userProfile.uid, '').replace('_', '');
            if (count > 0) {
                counts[partnerId] = count;
            }
        });
        return counts;
    }, [unreadCounts, userProfile]);

    const handleProfileSetup = async (name: string, emoji: string) => {
        if (currentUser) {
            await updateUserProfile(currentUser.uid, currentUser.email!, name, emoji);
        }
    };
    
    const handleAddFriend = async (friendId: string) => {
        if (userProfile) {
            await sendFriendRequest(friendId, userProfile);
            setAddFriendModalOpen(false);
        }
    };

    const handleOpenChat = (contact: Contact) => {
        setCurrentChatPartner(contact);
        setView(View.CHAT);
    };

    const handleBackToMain = () => {
        setCurrentChatPartner(null);
        setMessages([]);
        removeMessageListener();
        setView(View.MAIN);
    };

    const handleSendMessage = async (text: string) => {
        if (userProfile && currentChatPartner) {
            await fbSendMessage(text, userProfile.uid, currentChatPartner.uid);
        }
    };
    
    useEffect(() => {
        if (view === View.CHAT && userProfile && currentChatPartner) {
            const unsubscribe = setupMessageListener(userProfile.uid, currentChatPartner.uid, setMessages);
            return () => unsubscribe();
        }
    }, [view, userProfile, currentChatPartner, setupMessageListener]);


    const handleStartCall = (isVideo: boolean) => {
        if (currentChatPartner) {
            startCall(currentChatPartner, isVideo);
        }
    };

    const handleLogout = () => {
        endCall();
        signOut();
        setProfileViewModalOpen(false);
    }

    const handleAcceptRequest = (request: FriendRequest) => {
        if (userProfile) {
            acceptFriendRequest(request, userProfile.uid);
        }
    };

    const handleRejectRequest = (request: FriendRequest) => {
        if (userProfile) {
            rejectFriendRequest(request, userProfile.uid);
        }
    };

    const renderView = () => {
        if (activeCall) {
            return (
                <CallView
                    call={activeCall}
                    localStream={localStream}
                    remoteStream={remoteStream}
                    onEndCall={endCall}
                    isMuted={isMuted}
                    isCameraOff={isCameraOff}
                    onToggleMute={toggleMute}
                    onToggleCamera={toggleCamera}
                />
            );
        }

        switch (view) {
            case View.AUTH:
            case View.LOADING:
                return <AuthView auth={auth} />;
            case View.MAIN:
                return (
                    <MainView
                        contacts={contacts}
                        friendRequests={friendRequests}
                        callHistory={callHistory}
                        unreadCountsByContact={unreadCountsByContact}
                        onOpenChat={handleOpenChat}
                        onAddFriend={() => setAddFriendModalOpen(true)}
                        onOpenProfile={() => setProfileViewModalOpen(true)}
                        onAcceptRequest={handleAcceptRequest}
                        onRejectRequest={handleRejectRequest}
                    />
                );
            case View.CHAT:
                return currentChatPartner ? (
                    <ChatView
                        chatPartner={currentChatPartner}
                        messages={messages}
                        currentUserId={userProfile!.uid}
                        onBack={handleBackToMain}
                        onSendMessage={handleSendMessage}
                        onStartCall={handleStartCall}
                    />
                ) : null;
            default:
                return <AuthView auth={auth} />;
        }
    };

    return (
      <IconContext.Provider value={{ color: '#f0f2f5', size: '24px' }}>
        <div className="w-full h-full bg-[#f0f2f5] flex flex-col relative overflow-hidden md:max-w-[450px] md:max-h-[95vh] md:rounded-2xl md:shadow-2xl">
          {renderView()}
          {isProfileSetupModalOpen && userProfile === null && (
            <ProfileSetupModal onSubmit={handleProfileSetup} />
          )}
          {isAddFriendModalOpen && (
            <AddFriendModal
              onClose={() => setAddFriendModalOpen(false)}
              onSubmit={handleAddFriend}
            />
          )}
          {isProfileViewModalOpen && userProfile && (
            <ProfileViewModal
              userProfile={userProfile}
              onClose={() => setProfileViewModalOpen(false)}
              onLogout={handleLogout}
            />
          )}
          {incomingCall && !activeCall && (
            <IncomingCallModal
              call={incomingCall}
              onAccept={() => answerCall(incomingCall)}
              onReject={() => rejectCall(incomingCall.callId)}
            />
          )}
          <audio ref={ringtoneRef} loop src="https://firebasestorage.googleapis.com/v0/b/my-call-7d44e.appspot.com/o/ringtone.mp3?alt=media&token=c4a85b9b-0b2b-4279-8d19-4820eb231336"></audio>
        </div>
      </IconContext.Provider>
    );
};

export default App;
