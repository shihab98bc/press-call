
import { useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { getDatabase, ref, onValue, set, push, serverTimestamp, query, orderByChild, equalTo, get, remove, runTransaction } from 'firebase/database';
import { UserProfile, Contact, FriendRequest, Message, CallLog } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyAJ9VAr8748Hwpa2xlgleyZgS5D8KdZ6UQ",
  authDomain: "my-call-7d44e.firebaseapp.com",
  databaseURL: "https://my-call-7d44e-default-rtdb.firebaseio.com",
  projectId: "my-call-7d44e",
  storageBucket: "my-call-7d44e.firebasestorage.app",
  messagingSenderId: "779264436033",
  appId: "1:779264436033:web:4ba4c7af4219ed03a963c0",
  measurementId: "G-9Q5BMZQPPV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export const useFirebase = () => {
    const messageListenerRef = useRef<{ chatId: string, unsubscribe: () => void } | null>(null);

    const setupAuthStateListener = useCallback((onUser: (user: User) => void, onNoUser: () => void) => {
        return onAuthStateChanged(auth, user => {
            if (user) {
                onUser(user);
            } else {
                onNoUser();
            }
        });
    }, []);
    
    const setupUserProfileListener = useCallback((uid: string, callback: (profile: UserProfile | null) => void) => {
        const userRef = ref(db, 'users/' + uid);
        const unsubscribe = onValue(userRef, snapshot => {
            if (snapshot.exists()) {
                callback({ uid, ...snapshot.val() });
            } else {
                callback(null);
            }
        });
        return unsubscribe;
    }, []);

    const setupContactsListener = useCallback((uid: string, callback: (contacts: Contact[]) => void) => {
        const contactsRef = ref(db, `users/${uid}/contacts`);
        const unsubscribe = onValue(contactsRef, async snapshot => {
            if (snapshot.exists()) {
                const contactUids = Object.keys(snapshot.val());
                const contactPromises = contactUids.map(contactUid =>
                    get(ref(db, `users/${contactUid}`)).then(userSnapshot => ({
                        uid: contactUid,
                        ...userSnapshot.val()
                    }))
                );
                const contactsData = await Promise.all(contactPromises);
                callback(contactsData);
            } else {
                callback([]);
            }
        });
        return unsubscribe;
    }, []);

    const setupFriendRequestsListener = useCallback((uid: string, callback: (requests: FriendRequest[]) => void) => {
        const requestsRef = ref(db, 'requests/' + uid);
        const unsubscribe = onValue(requestsRef, snapshot => {
            const requests: FriendRequest[] = [];
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    requests.push({ key: childSnapshot.key!, ...childSnapshot.val() });
                });
            }
            callback(requests.reverse());
        });
        return unsubscribe;
    }, []);
    
    const setupCallHistoryListener = useCallback((uid: string, callback: (logs: CallLog[]) => void) => {
      const logsRef = ref(db, 'callLogs/' + uid);
      const unsubscribe = onValue(logsRef, async (snapshot) => {
          const logsData: CallLog[] = [];
          if (snapshot.exists()) {
              const logPromises: Promise<CallLog>[] = [];
              snapshot.forEach(childSnapshot => {
                  const log = childSnapshot.val();
                  const contactPromise = get(ref(db, `users/${log.with}`)).then(userSnapshot => {
                      return {
                          key: childSnapshot.key!,
                          ...log,
                          with: { uid: log.with, ...userSnapshot.val() },
                      };
                  });
                  logPromises.push(contactPromise);
              });
              const resolvedLogs = await Promise.all(logPromises);
              logsData.push(...resolvedLogs);
          }
          callback(logsData.reverse());
      });
      return unsubscribe;
    }, []);
    
    const setupUnreadCountsListener = useCallback((uid: string, callback: (counts: { [chatId: string]: number }) => void) => {
        const unreadRef = ref(db, `unreadCounts/${uid}`);
        const unsubscribe = onValue(unreadRef, snapshot => {
            callback(snapshot.val() || {});
        });
        return unsubscribe;
    }, []);

    const removeMessageListener = useCallback(() => {
        if (messageListenerRef.current) {
            messageListenerRef.current.unsubscribe();
            messageListenerRef.current = null;
        }
    }, []);

    const setupMessageListener = useCallback((currentUserId: string, partnerId: string, callback: (messages: Message[]) => void) => {
        removeMessageListener();
        
        const chatId = [currentUserId, partnerId].sort().join('_');
        const messagesRef = ref(db, `messages/${chatId}`);
        
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const messagesData: Message[] = [];
            if(snapshot.exists()){
                snapshot.forEach(childSnapshot => {
                    messagesData.push({ key: childSnapshot.key!, ...childSnapshot.val() });
                });
            }
            callback(messagesData);

            // Mark messages as read
            const unreadRef = ref(db, `unreadCounts/${currentUserId}/${chatId}`);
            remove(unreadRef);
        });
        
        messageListenerRef.current = { chatId, unsubscribe };
        return unsubscribe;
    }, [removeMessageListener]);
    
    const sendFriendRequest = async (friendId: string, currentUserProfile: UserProfile) => {
        const usersRef = query(ref(db, 'users'), orderByChild('userId'), equalTo(friendId));
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const recipientUid = Object.keys(snapshot.val())[0];
            if (recipientUid === currentUserProfile.uid) {
                alert("You can't add yourself!");
                return;
            }
            const requestRef = push(ref(db, `requests/${recipientUid}`));
            await set(requestRef, {
                from: currentUserProfile.uid,
                name: currentUserProfile.name,
                emoji: currentUserProfile.emoji,
                status: 'pending'
            });
            alert('Friend request sent!');
        } else {
            alert('User not found.');
        }
    };

    const acceptFriendRequest = async (request: FriendRequest, currentUid: string) => {
        await set(ref(db, `users/${currentUid}/contacts/${request.from}`), true);
        await set(ref(db, `users/${request.from}/contacts/${currentUid}`), true);
        await remove(ref(db, `requests/${currentUid}/${request.key}`));
    };
    
    const rejectFriendRequest = async (request: FriendRequest, currentUid: string) => {
        await remove(ref(db, `requests/${currentUid}/${request.key}`));
    };
    
    const sendMessage = async (text: string, senderId: string, receiverId: string) => {
        const chatId = [senderId, receiverId].sort().join('_');
        const messageRef = push(ref(db, `messages/${chatId}`));
        await set(messageRef, {
            text,
            sender: senderId,
            timestamp: serverTimestamp()
        });
        
        const unreadRef = ref(db, `unreadCounts/${receiverId}/${chatId}`);
        await runTransaction(unreadRef, (count) => (count || 0) + 1);
    };

    const updateUserProfile = async (uid: string, email: string, name: string, emoji: string) => {
        const userId = 'id_' + Math.random().toString(36).substring(2, 9);
        await set(ref(db, 'users/' + uid), {
            name,
            emoji,
            userId,
            email,
        });
    };
    
    const signOut = () => firebaseSignOut(auth);

    return { 
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
        sendMessage,
        updateUserProfile,
        signOut
    };
};
