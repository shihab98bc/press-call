
import React, { useContext } from 'react';
import { IconContext } from './IconContext';

interface IconProps {
    color?: string;
    size?: string;
}

export const AddFriendIcon: React.FC<IconProps> = ({ color, size }) => {
    const context = useContext(IconContext);
    return <svg viewBox="0 0 24 24" width={size || context.size} height={size || context.size} fill={color || context.color}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>;
};
export const MenuIcon: React.FC<IconProps> = ({ color, size }) => {
    const context = useContext(IconContext);
    return <svg viewBox="0 0 24 24" width={size || context.size} height={size || context.size} fill={color || context.color}><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>;
};
export const BackIcon: React.FC<IconProps> = ({ color, size }) => {
    const context = useContext(IconContext);
    return <svg viewBox="0 0 24 24" width={size || context.size} height={size || context.size} fill={color || context.color}><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>;
};
export const VoiceCallIcon: React.FC<IconProps> = ({ color, size }) => {
    const context = useContext(IconContext);
    return <svg viewBox="0 0 24 24" width={size || context.size} height={size || context.size} fill={color || context.color}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"></path></svg>;
};
export const VideoCallIcon: React.FC<IconProps> = ({ color, size }) => {
    const context = useContext(IconContext);
    return <svg viewBox="0 0 24 24" width={size || context.size} height={size || context.size} fill={color || context.color}><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path></svg>;
};
export const SendIcon: React.FC<IconProps> = ({ color, size }) => {
    const context = useContext(IconContext);
    return <svg viewBox="0 0 24 24" width={size || context.size} height={size || context.size} fill={color || context.color}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>;
};
export const EndCallIcon: React.FC<IconProps> = ({ color, size }) => {
    const context = useContext(IconContext);
    return <svg viewBox="0 0 24 24" width={size || context.size} height={size || context.size} fill={color || context.color}><path d="M12 9c-1.6 0-3.15.25-4.62.72v3.1c0 .34-.23.64-.56.7-.98.19-1.89.54-2.73 1.02-.28.16-.62.06-.78-.23-.9-1.58-1.31-3.34-1.31-5.18 0-5.52 4.48-10 10-10s10 4.48 10 10c0 1.84-.41 3.6-1.31 5.18-.16.29-.5.39-.78.23-.84-.48-1.75-.84-2.73-1.02-.33-.06-.56-.36-.56-.7v-3.1C15.15 9.25 13.6 9 12 9z"></path></svg>;
};
export const MicOnIcon: React.FC<IconProps> = ({ color, size }) => {
    const context = useContext(IconContext);
    return <svg viewBox="0 0 24 24" width={size || context.size} height={size || context.size} fill={color || context.color}><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"></path></svg>;
};
export const MicOffIcon: React.FC<IconProps> = ({ color, size }) => {
    const context = useContext(IconContext);
    return <svg viewBox="0 0 24 24" width={size || context.size} height={size || context.size} fill={color || context.color}><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.2-9.1c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2l-.01 6.2c0 .66-.53 1.2-1.19 1.2s-1.2-.54-1.2-1.2V4.9zm6.5 6.2c0 2.8-2.2 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path></svg>;
};
export const CameraOnIcon: React.FC<IconProps> = ({ color, size }) => {
    const context = useContext(IconContext);
    return <svg viewBox="0 0 24 24" width={size || context.size} height={size || context.size} fill={color || context.color}><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path></svg>;
};
export const CameraOffIcon: React.FC<IconProps> = ({ color, size }) => {
    const context = useContext(IconContext);
    return <svg viewBox="0 0 24 24" width={size || context.size} height={size || context.size} fill={color || context.color}><path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21 21 19.73 3.27 2z"></path></svg>;
};
