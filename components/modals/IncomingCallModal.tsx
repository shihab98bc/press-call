
import React from 'react';
import { IncomingCall } from '../../types';
import IconButton from '../IconButton';
import { VoiceCallIcon, EndCallIcon } from '../icons';

interface IncomingCallModalProps {
    call: IncomingCall;
    onAccept: () => void;
    onReject: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ call, onAccept, onReject }) => {
    return (
        <div className="absolute inset-0 w-full h-full bg-black/50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-5 rounded-lg min-w-[300px] max-w-[90%] shadow-lg text-center">
                <h2 className="mb-2 text-xl font-bold text-[#111b21]">Incoming {call.isVideo ? 'Video' : 'Voice'} Call</h2>
                <div className="my-6">
                    <div className="text-6xl">{call.caller.emoji}</div>
                    <div className="text-lg font-medium mt-2">{call.caller.name}</div>
                </div>
                <div className="flex justify-center gap-8">
                    <IconButton onClick={onAccept} title="Accept" className="w-16 h-16 bg-[#4CAF50] hover:bg-[#4CAF50]/90">
                        <VoiceCallIcon />
                    </IconButton>
                    <IconButton onClick={onReject} title="Reject" className="w-16 h-16 bg-[#e91e63] hover:bg-[#e91e63]/90">
                        <EndCallIcon />
                    </IconButton>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;