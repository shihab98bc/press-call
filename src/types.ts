
export enum View {
    LOADING,
    AUTH,
    MAIN,
    CHAT,
    CALL,
}

export enum Panel {
    CHATS = 'CHATS',
    UPDATES = 'UPDATES',
    CALLS = 'CALLS',
}

export enum CallType {
    VOICE = 'voice',
    VIDEO = 'video',
}

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    emoji: string;
    userId: string; // The short, shareable ID
    contacts?: { [key: string]: boolean };
    blocked?: { [key: string]: boolean };
}

export type Contact = Omit<UserProfile, 'contacts' | 'blocked' | 'email'>;

export interface FriendRequest {
    key: string; // Firebase key
    from: string; // from uid
    name: string;
    emoji: string;
    status: 'pending';
}

export interface Message {
    key: string;
    text: string;
    sender: string; // sender uid
    timestamp: number;
}

export interface CallData {
    callId: string;
    caller: UserProfile;
    callee: UserProfile;
    isVideo: boolean;
    offer?: any;
    answer?: any;
    status: 'dialing' | 'ringing' | 'connected' | 'ended';
}

export interface IncomingCall {
    callId: string;
    caller: Contact;
    isVideo: boolean;
    offer: RTCSessionDescriptionInit;
}

export interface ActiveCall extends IncomingCall {
    calleeId: string;
    status: 'dialing' | 'connecting' | 'connected';
}

export interface CallLog {
    key: string;
    with: Contact;
    type: 'video' | 'voice';
    timestamp: number;
    duration: number;
    direction: 'outgoing' | 'incoming' | 'missed';
}