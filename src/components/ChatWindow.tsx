import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import {
    MessageList,
    Message,
    MessageInput,
    type MessageModel,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

interface ChatWindowProps {
    open: boolean;
    onClose: () => void;
    title: string;
    messages: MessageModel[];
    onSendMessage: (text: string, file?: File | null) => void;
    deviceType: 'mobile' | 'tablet' | 'desktop';
}

const ChatWindow: React.FC<ChatWindowProps> = ({
                                                   open,
                                                   onClose,
                                                   title,
                                                   messages,
                                                   onSendMessage,
                                                   deviceType,
                                               }) => {
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const [messageListHeight, setMessageListHeight] = useState<number>(0);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

    const messageListRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const SUPPORTED_EXTENSIONS = ['.pdf', '.txt', '.doc', '.docx', '.csv', '.xls', '.xlsx', '.jpg','.jpeg','.png', '.webp'];
    // 1. Handle Visual Viewport (Virtual Keyboard on Mobile)
    useEffect(() => {
        const updateKeyboardOffset = () => {
            const viewport = window.visualViewport;
            if (!viewport) return;
            const bottomInset = window.innerHeight - (viewport.height + viewport.offsetTop);
            setKeyboardOffset(bottomInset > 0 ? bottomInset : 0);
        };

        window.visualViewport?.addEventListener('resize', updateKeyboardOffset);
        window.visualViewport?.addEventListener('scroll', updateKeyboardOffset);
        updateKeyboardOffset();

        return () => {
            window.visualViewport?.removeEventListener('resize', updateKeyboardOffset);
            window.visualViewport?.removeEventListener('scroll', updateKeyboardOffset);
        };
    }, []);

    // 2. Calculate Available Height for Messages
    useEffect(() => {
        if (!open) {
            setMessageListHeight(0);
            return;
        }
        const viewportH = viewportHeight;
        const headerHeight = 48;
        const inputHeight = 56;
        const bottomOffset = deviceType === 'mobile' ? keyboardOffset : 0;
        const availableHeight = viewportH - headerHeight - inputHeight - bottomOffset;
        setMessageListHeight(availableHeight > 0 ? availableHeight : 0);
    }, [viewportHeight, keyboardOffset, deviceType, open]);

    // 3. Lock Body Scroll
    useEffect(() => {
        if (open && (deviceType === 'mobile' || deviceType === 'tablet')) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
    }, [open, deviceType]);

    // 4. Handle Resize
    useEffect(() => {
        const handleVisualResize = () => {
            const h = window.visualViewport?.height || window.innerHeight;
            setViewportHeight(h);
        };
        handleVisualResize();
        window.visualViewport?.addEventListener('resize', handleVisualResize);
        window.addEventListener('orientationchange', handleVisualResize);
        return () => {
            window.visualViewport?.removeEventListener('resize', handleVisualResize);
            window.removeEventListener('orientationchange', handleVisualResize);
        };
    }, []);

    // 5. Scroll to bottom on new message
    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (!file) {
            setAttachedFile(null);
            setAttachedFileName(null);
            return;
        }
        const lower = file.name.toLowerCase();
        const allowed = SUPPORTED_EXTENSIONS.some(ext => lower.endsWith(ext));
        if (!allowed) {
            alert(`Unsupported file type. Allowed: ${SUPPORTED_EXTENSIONS.join(', ')}`);
            e.target.value = '';
            return;
        }
        if (file.size > 3 * 1024 * 1024) {
            alert('File too large. Maximum ~3 MB');
            e.target.value = '';
            return;
        }
        setAttachedFile(file);
        setAttachedFileName(file.name);
        e.target.value = '';
    };

    const handleSend = (text: string) => {
        onSendMessage(text, attachedFile);
        setAttachedFile(null);
        setAttachedFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!open) return null;

    return (
        <>
            {/* Desktop Overlay */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1300,
                }}
                onClick={onClose}
            />

            {/* Chat Container */}
            <Box
                role="dialog"
                aria-label={title}
                sx={{
                    position: 'fixed',
                    zIndex: 1400,
                    bottom: 0,
                    right: 0,
                    top: 'auto',
                    width: { xs: '100vw', md: '36vw' },
                    maxWidth: { md: 800 },
                    height: { xs: `${viewportHeight}px`, md: '100vh' },
                    backgroundColor: '#fff',
                    boxShadow: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: { md: 'transform 0.3s ease-in-out' },
                    WebkitTextSizeAdjust: '100%',
                    touchAction: 'pan-y',
                    overscrollBehavior: 'contain',
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        p: deviceType === 'mobile' ? 1 : 2,
                        borderBottom: 1,
                        borderColor: 'grey.300',
                    }}
                >
                    <IconButton onClick={onClose} sx={{ mr: 1 }}>
                        <CloseIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.125rem' : '1.25rem',
                            flexGrow: 1,
                            textAlign: 'left',
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                {/* Messages */}
                <MessageList
                    ref={messageListRef}
                    style={{
                        height: messageListHeight > 0 ? messageListHeight : 0,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: deviceType === 'mobile' ? '8px' : '10px',
                        paddingBottom: keyboardOffset > 0 ? `${keyboardOffset}px` : '0px',
                    }}
                >
                    {messages.map((msg, index) => {
                        // Custom logic for file display from App.tsx
                        const hasFile = !!(msg as any).attachedFileName;
                        const textMessage = msg.message?.trim();
                        const isUserMessage = msg.direction === 'outgoing';

                        if (isUserMessage && hasFile) {
                            return (
                                <React.Fragment key={index}>
                                    {textMessage && (
                                        <Message model={{ ...msg, position: 'single' }} />
                                    )}
                                    <Message
                                        model={{
                                            message: '',
                                            direction: 'outgoing',
                                            position: 'single',
                                            sender: 'user',
                                        }}
                                    >
                                        <Message.CustomContent>
                                            <Box
                                                sx={{
                                                    background: '#f5fbff',
                                                    border: '1px solid #90caf9',
                                                    borderRadius: 2,
                                                    py: 1,
                                                    px: 1.5,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    maxWidth: '220px',
                                                    boxShadow: '0 1px 3px rgba(25,118,210,0.12)',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                <DescriptionIcon sx={{ fontSize: 22, color: '#1976d2' }} />
                                                <Typography
                                                    fontWeight="600"
                                                    fontSize="0.85rem"
                                                    color="#0d47a1"
                                                    noWrap
                                                    sx={{ maxWidth: '150px' }}
                                                >
                                                    {(msg as any).attachedFileName}
                                                </Typography>
                                            </Box>
                                        </Message.CustomContent>
                                    </Message>
                                </React.Fragment>
                            );
                        }

                        return <Message key={index} model={msg} />;
                    })}
                </MessageList>

                {/* Input Area */}
                <Box
                    sx={{
                        flexShrink: 0,
                        background: '#fff',
                        borderTop: 1,
                        borderColor: 'grey.300',
                        p: 1,
                        pb: `max(env(safe-area-inset-bottom, 12px), 12px)`,
                    }}
                >
                    {attachedFileName && (
                        <Box
                            sx={{
                                mx: 2,
                                mb: 1,
                                p: 1.5,
                                backgroundColor: '#f5f5f5',
                                borderRadius: 2,
                                border: '1px dashed #90caf9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <DescriptionIcon color="primary" />
                                <Box>
                                    <Typography fontSize="0.9rem" fontWeight="medium" noWrap>
                                        {attachedFileName}
                                    </Typography>
                                    <Typography fontSize="0.75rem" color="text.secondary">
                                        Ready to send
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setAttachedFile(null);
                                    setAttachedFileName(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt,.doc,.docx,.csv,.xls,.xlsx,.jpg,.jpeg,.png, .webp"
                        onChange={handleFileSelected}
                        style={{ display: 'none' }}
                    />

                    <MessageInput
                        placeholder="Enter a message...."
                        onSend={handleSend}
                        attachButton={true}
                        onAttachClick={() => fileInputRef.current?.click()}
                        sendButton={true}
                        autoFocus={deviceType !== 'mobile'}
                    />
                </Box>
            </Box>
        </>
    );
};

export default ChatWindow;