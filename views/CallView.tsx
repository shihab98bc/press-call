
import React, { useRef, useEffect } from 'react';
import { ActiveCall } from '../types';
import IconButton from '../components/IconButton';
import { EndCallIcon, MicOnIcon, MicOffIcon, CameraOnIcon, CameraOffIcon } from '../components/icons';

interface CallViewProps {
    call: ActiveCall;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    onEndCall: () => void;
    isMuted: boolean;
    isCameraOff: boolean;
    onToggleMute: () => void;
    onToggleCamera: () => void;
}

const CallView: React.FC<CallViewProps> = ({ call, localStream, remoteStream, onEndCall, isMuted, isCameraOff, onToggleMute, onToggleCamera }) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);
    
    const callerName = call.caller.name;
    const callerEmoji = call.caller.emoji;

    return (
        <div className="absolute inset-0 w-full h-full bg-[#222] text-white flex flex-col z-40">
            {call.isVideo ? (
                <>
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover absolute top-0 left-0" />
                    <video ref={localVideoRef} autoPlay playsInline muted className="absolute w-32 h-44 bottom-32 right-5 rounded-lg border-2 border-white shadow-lg" />
                </>
            ) : (
                <audio ref={remoteVideoRef as any} autoPlay />
            )}
            <div className={`absolute inset-0 flex flex-col justify-end items-center p-8 bg-gradient-to-t from-black/70 to-transparent ${!call.isVideo && '!justify-around !bg-[#005c97]'}`}>
                <div className="text-center">
                    <div className="text-7xl">{callerEmoji}</div>
                    <div className="text-2xl mt-2">{callerName}</div>
                    {!remoteStream && <p className="mt-2 opacity-80">{call.status === 'dialing' ? 'Calling...' : 'Connecting...'}</p>}
                </div>

                <div className="flex gap-8 mt-8">
                    {call.isVideo && (
                        <IconButton onClick={onToggleCamera} title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"} className="w-16 h-16 bg-white/20 hover:bg-white/30">
                            {isCameraOff ? <CameraOffIcon /> : <CameraOnIcon />}
                        </IconButton>
                    )}
                     <IconButton onClick={onToggleMute} title={isMuted ? "Unmute" : "Mute"} className="w-16 h-16 bg-white/20 hover:bg-white/30">
                        {isMuted ? <MicOffIcon /> : <MicOnIcon />}
                    </IconButton>
                    <IconButton onClick={onEndCall} title="End Call" className="w-16 h-16 bg-[#e91e63] hover:bg-[#e91e63]/90">
                        <EndCallIcon />
                    </IconButton>
                </div>
            </div>
        </div>
    );
};

export default CallView;