
import React, { useState, useRef, useEffect } from 'react';
import { Contact, Message } from '../types';
import IconButton from '../components/IconButton';
import { BackIcon, VoiceCallIcon, VideoCallIcon, MenuIcon, SendIcon } from '../components/icons';

interface ChatViewProps {
    chatPartner: Contact;
    messages: Message[];
    currentUserId: string;
    onBack: () => void;
    onSendMessage: (text: string) => void;
    onStartCall: (isVideo: boolean) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ chatPartner, messages, currentUserId, onBack, onSendMessage, onStartCall }) => {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSend = () => {
        if (inputText.trim()) {
            onSendMessage(inputText);
            setInputText('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="flex flex-col w-full h-full bg-[#e5ddd5] bg-[url('https://i.imgur.com/eF90t67.png')] bg-opacity-5">
            <header className="flex items-center p-2 bg-[#005c97] text-[#f0f2f5] gap-2">
                <IconButton onClick={onBack} title="Back"><BackIcon /></IconButton>
                <div className="flex items-center flex-1 gap-3">
                    <span className="text-3xl">{chatPartner.emoji}</span>
                    <span className="font-medium">{chatPartner.name}</span>
                </div>
                <div className="flex">
                    <IconButton onClick={() => onStartCall(false)} title="Voice Call"><VoiceCallIcon /></IconButton>
                    <IconButton onClick={() => onStartCall(true)} title="Video Call"><VideoCallIcon /></IconButton>
                    <IconButton title="More options"><MenuIcon /></IconButton>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
                {messages.map((msg) => (
                    <div
                        key={msg.key}
                        className={`py-2 px-3 rounded-xl max-w-[75%] break-words ${
                            msg.sender === currentUserId
                                ? 'self-end bg-[#e1f6fb] rounded-br-md'
                                : 'self-start bg-white shadow-sm rounded-bl-md'
                        }`}
                    >
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>
            <footer className="flex items-center p-2 bg-[#f0f2f5] gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message"
                    className="flex-1 py-2.5 px-4 border-none rounded-full text-base focus:outline-none"
                />
                <IconButton onClick={handleSend} title="Send" className="w-11 h-11 bg-[#008069]">
                    <SendIcon />
                </IconButton>
            </footer>
        </div>
    );
};

export default ChatView;