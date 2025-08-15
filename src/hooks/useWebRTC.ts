

import { useState, useEffect, useRef, useCallback } from 'react';
import { Database, ref, onValue, set, remove, get, push, serverTimestamp } from 'firebase/database';
import { UserProfile, Contact, IncomingCall, ActiveCall } from '../types';

const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

export const useWebRTC = (db: Database, userProfile: UserProfile | null) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
    const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const callListenersRef = useRef<(() => void)[]>([]);

    const cleanup = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
        setActiveCall(null);
        setIncomingCall(null);

        callListenersRef.current.forEach(unsubscribe => unsubscribe());
        callListenersRef.current = [];
    }, [localStream]);

    const endCall = useCallback(async () => {
        if (activeCall) {
            const callRef = ref(db, `calls/${activeCall.callId}`);
            const callSnapshot = await get(callRef);
            if(callSnapshot.exists()){
                const callData = callSnapshot.val();
                
                 // Log call for both users
                const callerLogRef = push(ref(db, `callLogs/${callData.caller}`));
                const calleeLogRef = push(ref(db, `callLogs/${callData.callee}`));
                const logPayload = {
                    with: activeCall.caller.uid === userProfile?.uid ? activeCall.calleeId : activeCall.caller.uid,
                    type: activeCall.isVideo ? 'video' : 'voice',
                    timestamp: serverTimestamp(),
                    duration: 0, // Simplified
                    direction: activeCall.caller.uid === userProfile?.uid ? 'outgoing' : 'incoming'
                };
                set(callerLogRef, logPayload);
                set(calleeLogRef, {...logPayload, direction: activeCall.caller.uid !== userProfile?.uid ? 'outgoing' : 'incoming'});
            }
           
            remove(ref(db, `calls/${activeCall.callId}`));
            remove(ref(db, `iceCandidates/${activeCall.callId}`));
        }
        cleanup();
    }, [activeCall, cleanup, db, userProfile]);

    // Listen for incoming calls
    useEffect(() => {
        if (!userProfile) return;

        const callsRef = ref(db, 'calls');
        const unsubscribe = onValue(callsRef, async (snapshot) => {
            if (!snapshot.exists()) return;
            
            let foundCall = false;
            for (const key in snapshot.val()) {
                const call = snapshot.val()[key];
                if (call.callee === userProfile.uid && call.status === 'dialing') {
                    const callerSnapshot = await get(ref(db, `users/${call.caller}`));
                    if (callerSnapshot.exists()) {
                        setIncomingCall({
                            callId: key,
                            caller: { uid: call.caller, ...callerSnapshot.val() },
                            isVideo: call.isVideo,
                            offer: call.offer,
                        });
                        foundCall = true;
                    }
                }
            }
            if(!foundCall) setIncomingCall(null);
        });

        return () => unsubscribe();
    }, [userProfile, db]);

    const createPeerConnection = useCallback((callId: string) => {
        const pc = new RTCPeerConnection(servers);
        pc.onicecandidate = event => {
            if (event.candidate && userProfile) {
                const role = activeCall?.caller.uid === userProfile.uid ? 'caller' : 'callee';
                set(push(ref(db, `iceCandidates/${callId}/${role}`)), event.candidate.toJSON());
            }
        };
        pc.ontrack = event => {
            setRemoteStream(event.streams[0]);
        };
        return pc;
    }, [userProfile, activeCall]);

    const startCall = useCallback(async (callee: Contact, isVideo: boolean) => {
        if (!userProfile) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
            setLocalStream(stream);

            const callRef = push(ref(db, 'calls'));
            const callId = callRef.key!;

            const pc = createPeerConnection(callId);
            pcRef.current = pc;
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const callPayload = {
                caller: userProfile.uid,
                callee: callee.uid,
                isVideo,
                offer: { type: offer.type, sdp: offer.sdp },
                status: 'dialing',
            };
            await set(callRef, callPayload);

            setActiveCall({
                callId,
                caller: { ...userProfile, uid: userProfile.uid, name: userProfile.name, emoji: userProfile.emoji, userId: userProfile.userId },
                calleeId: callee.uid,
                isVideo,
                offer,
                status: 'dialing',
            });

            // Listen for answer and ICE candidates
            const answerRef = ref(db, `calls/${callId}/answer`);
            const unsubAnswer = onValue(answerRef, async (snapshot) => {
                if (snapshot.exists() && pcRef.current && !pcRef.current.currentRemoteDescription) {
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(snapshot.val()));
                    await set(ref(db, `calls/${callId}/status`), 'connected');
                    setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
                }
            });
            callListenersRef.current.push(unsubAnswer);

            const calleeIceCandidatesRef = ref(db, `iceCandidates/${callId}/callee`);
            const unsubCalleeIce = onValue(calleeIceCandidatesRef, (snapshot) => {
                snapshot.forEach(childSnapshot => {
                    pcRef.current?.addIceCandidate(new RTCIceCandidate(childSnapshot.val()));
                });
            });
            callListenersRef.current.push(unsubCalleeIce);

            const callStatusRef = ref(db, `calls/${callId}`);
            const unsubCallStatus = onValue(callStatusRef, (snapshot) => {
                if (!snapshot.exists()) {
                    endCall();
                }
            });
            callListenersRef.current.push(unsubCallStatus);


        } catch (error) {
            console.error("Error starting call:", error);
            cleanup();
        }
    }, [userProfile, createPeerConnection, cleanup, db, endCall]);
    
    const answerCall = useCallback(async (call: IncomingCall) => {
        if (!userProfile) return;
        setIncomingCall(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: call.isVideo, audio: true });
            setLocalStream(stream);

            const pc = createPeerConnection(call.callId);
            pcRef.current = pc;
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
            
            setActiveCall({ ...call, calleeId: userProfile.uid, status: 'connecting' });

            await pc.setRemoteDescription(new RTCSessionDescription(call.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            await set(ref(db, `calls/${call.callId}/answer`), { type: answer.type, sdp: answer.sdp });
            await set(ref(db, `calls/${call.callId}/status`), 'connected');
            setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);

            // Listen for caller ICE candidates
            const callerIceCandidatesRef = ref(db, `iceCandidates/${call.callId}/caller`);
            const unsubCallerIce = onValue(callerIceCandidatesRef, (snapshot) => {
                snapshot.forEach(childSnapshot => {
                    pcRef.current?.addIceCandidate(new RTCIceCandidate(childSnapshot.val()));
                });
            });
            callListenersRef.current.push(unsubCallerIce);

            const callStatusRef = ref(db, `calls/${call.callId}`);
            const unsubCallStatus = onValue(callStatusRef, (snapshot) => {
                if (!snapshot.exists()) {
                    endCall();
                }
            });
            callListenersRef.current.push(unsubCallStatus);


        } catch (error) {
            console.error("Error answering call:", error);
            cleanup();
        }
    }, [userProfile, createPeerConnection, cleanup, db, endCall]);

    const rejectCall = useCallback(async (callId: string) => {
        setIncomingCall(null);
        await remove(ref(db, `calls/${callId}`));
    }, [db]);
    
    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(prev => !prev);
        }
    };

    const toggleCamera = () => {
        if (localStream && activeCall?.isVideo) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCameraOff(prev => !prev);
        }
    };


    return { localStream, remoteStream, incomingCall, activeCall, isMuted, isCameraOff, startCall, answerCall, rejectCall, endCall, toggleMute, toggleCamera };
};