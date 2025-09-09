// src/components/ChatWidget.tsx
import React from 'react';
import {
    Fab,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Box,
    Typography,
    useTheme,
    useMediaQuery,
    TextField,
    InputAdornment,
    Button,
    CircularProgress,
    Divider,
    Avatar,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { v4 as uuidv4 } from 'uuid';

export interface AgentMini {
    id: string;
    name: string;
    agent_id?: string;
    alias_id?: string | null;
    public_url?: string | undefined;
}

// дополните Props в ChatWidget.tsx
type Props = {
    agents: AgentMini[];
    apiUrl?: string;
    apiKey?: string;
    channelId?: string;
    openPublicUrl?: boolean;
    bottom?: number;
    right?: number;
    pollIntervalMs?: number;
    onOpenChat?: (agent: AgentMini) => void;
};


type ChatMessage = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    status: 'pending' | 'received';
    time: string;
};

const ChatWidget: React.FC<Props> = ({
                                         agents,
                                         apiUrl = '',
                                         apiKey,
                                         channelId,
                                         openPublicUrl = true,
                                         bottom = 24,
                                         right = 24,
                                         pollIntervalMs = 1500,
                                     }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [expanded, setExpanded] = React.useState(false); // controls transform
    const [view, setView] = React.useState<'list' | 'chat'>('list');
    const [activeAgent, setActiveAgent] = React.useState<AgentMini | null>(null);

    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = React.useState('');
    const [isSending, setIsSending] = React.useState(false);
    const [isPolling, setIsPolling] = React.useState(false);

    const messagesRef = React.useRef<HTMLDivElement | null>(null);
    const pollTimerRef = React.useRef<number | null>(null);

    const sessionKey = (agentId?: string) => `chat_widget_session_${agentId ?? 'global'}`;

    React.useEffect(() => {
        return () => {
            stopPolling();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    function openChatForAgent(agent: AgentMini) {
        setActiveAgent(agent);
        setView('chat');

        // session id
        let sessionId = sessionStorage.getItem(sessionKey(agent.id));
        if (!sessionId) {
            sessionId = uuidv4();
            sessionStorage.setItem(sessionKey(agent.id), sessionId);
        }

        setMessages([]);
        startPolling(sessionId);
    }

    function goBackToList() {
        setView('list');
        stopPolling();
        setActiveAgent(null);
        setMessages([]);
    }

    function getSessionId(): string | null {
        const aid = activeAgent?.id;
        if (!aid) return null;
        return sessionStorage.getItem(sessionKey(aid));
    }

    async function sendMessage() {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        const sessionId = getSessionId();
        if (!sessionId) {
            console.error('No session id for active agent');
            return;
        }

        const userMsg: ChatMessage = {
            id: uuidv4(),
            text: trimmed,
            sender: 'user',
            status: 'received',
            time: new Date().toISOString(),
        };

        const botPending: ChatMessage = {
            id: uuidv4(),
            text: '',
            sender: 'bot',
            status: 'pending',
            time: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg, botPending]);
        setInputValue('');
        setIsSending(true);

        try {
            if (!apiUrl) {
                // simulate response
                setTimeout(() => {
                    setMessages((prev) => {
                        const idx = prev.findIndex((m) => m.id === botPending.id);
                        if (idx === -1) return prev;
                        const copy = [...prev];
                        copy[idx] = { ...copy[idx], text: 'Simulated response (no apiUrl).', status: 'received', time: new Date().toISOString() };
                        return copy;
                    });
                    setIsSending(false);
                }, 700);
                return;
            }

            const payload = {
                sessionId,
                channelId: channelId ?? '',
                input: trimmed,
                responseMessageId: botPending.id,
            };

            const res = await fetch(`${apiUrl.replace(/\/$/, '')}/web-integration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey ? { 'x-api-key': apiKey } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                setMessages((prev) => {
                    const idx = prev.findIndex((m) => m.id === botPending.id);
                    if (idx === -1) return prev;
                    const copy = [...prev];
                    copy[idx] = { ...copy[idx], text: 'Error: sending failed.', status: 'received', time: new Date().toISOString() };
                    return copy;
                });
                setIsSending(false);
                return;
            }

            setIsSending(false);
        } catch (err) {
            setMessages((prev) => {
                const idx = prev.findIndex((m) => m.sender === 'bot' && m.status === 'pending');
                if (idx === -1) return prev;
                const copy = [...prev];
                copy[idx] = { ...copy[idx], text: 'Network error.', status: 'received', time: new Date().toISOString() };
                return copy;
            });
            setIsSending(false);
        }
    }

    function scrollToBottomSmooth() {
        setTimeout(() => {
            if (messagesRef.current) {
                messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 60);
    }

    function startPolling(sessionId: string) {
        stopPolling();
        if (!apiUrl) return;
        setIsPolling(true);
        pollOnce(sessionId);
        const id = window.setInterval(() => pollOnce(sessionId), pollIntervalMs);
        pollTimerRef.current = id;
    }

    function stopPolling() {
        if (pollTimerRef.current) {
            window.clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
        }
        setIsPolling(false);
    }

    async function pollOnce(sessionId: string) {
        if (!apiUrl) return;
        try {
            const url = new URL(`${apiUrl.replace(/\/$/, '')}/messages-poll`);
            url.searchParams.set('sessionId', sessionId);

            const res = await fetch(url.toString(), { method: 'GET', headers: { ...(apiKey ? { 'x-api-key': apiKey } : {}) } });
            if (!res.ok) return;

            const json = await res.json();
            let parsedMessages: any[] = [];

            if (Array.isArray(json)) parsedMessages = json;
            else if (Array.isArray((json as any).messages)) parsedMessages = (json as any).messages;
            else if (typeof (json as any).body === 'string') {
                try {
                    const b = JSON.parse((json as any).body);
                    if (Array.isArray(b.messages)) parsedMessages = b.messages;
                    else if (Array.isArray(b)) parsedMessages = b;
                } catch {}
            } else if (Array.isArray((json as any).data)) parsedMessages = (json as any).data;

            if (!parsedMessages || parsedMessages.length === 0) return;

            setMessages((current) => {
                let result = [...current];
                parsedMessages.forEach((m) => {
                    const text = m.text ?? m.message ?? m.body ?? '';
                    const pendingIndex = result.findIndex((x) => x.status === 'pending');
                    if (pendingIndex !== -1) {
                        result[pendingIndex] = { ...result[pendingIndex], text, status: 'received', time: new Date().toISOString() };
                    } else {
                        result.push({ id: uuidv4(), text, sender: 'bot', status: 'received', time: new Date().toISOString() });
                    }
                });
                return result;
            });

            scrollToBottomSmooth();
        } catch {
            // ignore
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isSending) sendMessage();
        }
    }

    // animation styles
    const collapsedSize = 56;
    const panelWidth = isMobile ? '100%' : 420;
    const panelHeight = isMobile ? '70vh' : '80vh';
    const borderRadiusCollapsed = 999;
    const borderRadiusExpanded = 12;

    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: `${bottom}px`,
                    right: `${right}px`,
                    zIndex: 2000,
                    // stack context for transform
                }}
            >
                <Box
                    // outer container that morphs
                    sx={{
                        position: 'relative',
                        width: expanded ? panelWidth : `${collapsedSize}px`,
                        height: expanded ? panelHeight : `${collapsedSize}px`,
                        transition: 'width 320ms cubic-bezier(.22,.9,.35,1), height 320ms cubic-bezier(.22,.9,.35,1), border-radius 320ms',
                        borderRadius: expanded ? `${borderRadiusExpanded}px` : `${borderRadiusCollapsed}px`,
                        overflow: 'hidden',
                        boxShadow: expanded ? 8 : 6,
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        transformOrigin: isMobile ? 'bottom center' : 'bottom right',
                    }}
                >
                    {/* Fab (visible when collapsed) */}
                    {!expanded && (
                        <Fab
                            color="primary"
                            aria-label="open-chat-widget"
                            onClick={() => setExpanded(true)}
                            sx={{
                                width: collapsedSize,
                                height: collapsedSize,
                                minHeight: collapsedSize,
                                borderRadius: '50%',
                                boxShadow: 6,
                            }}
                        >
                            <ChatIcon />
                        </Fab>
                    )}

                    {/* Top bar when expanded */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: expanded ? 1 : 0,
                            py: expanded ? 0.5 : 0,
                            minHeight: expanded ? 48 : 0,
                            transition: 'opacity 240ms',
                            opacity: expanded ? 1 : 0,
                            pointerEvents: expanded ? 'auto' : 'none',
                            borderBottom: expanded ? '1px solid rgba(0,0,0,0.06)' : 'none',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                            {view === 'chat' && (
                                <>
                                    <IconButton size="small" onClick={goBackToList}>
                                        <ArrowBackIcon />
                                    </IconButton>
                                    <Avatar sx={{ width: 32, height: 32 }}>{(activeAgent?.name || 'A').slice(0, 1).toUpperCase()}</Avatar>
                                    <Box>
                                        <Typography variant="subtitle2">{activeAgent?.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {activeAgent?.alias_id ? 'Connected' : 'No alias'}
                                        </Typography>
                                    </Box>
                                </>
                            )}

                            {view === 'list' && (
                                <>
                                    <Typography variant="h6" sx={{ ml: 1 }}>
                                        Chat widget
                                    </Typography>
                                </>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {isPolling ? <CircularProgress size={18} /> : null}
                            <IconButton size="small" onClick={() => setExpanded(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Inner content: agent list or chat */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: expanded ? 'flex' : 'none',
                            flexDirection: 'column',
                            minHeight: 0,
                        }}
                    >
                        {view === 'list' && (
                            <Box sx={{ p: 1, overflow: 'auto' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Select an agent to chat with
                                </Typography>

                                <List dense>
                                    {agents.length === 0 && (
                                        <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                                            No agents
                                        </Typography>
                                    )}

                                    {agents.map((agent) => (
                                        <ListItem
                                            key={agent.id}
                                            divider
                                            secondaryAction={
                                                agent.alias_id ? (
                                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                        {openPublicUrl && agent.public_url && (
                                                            <IconButton
                                                                edge="end"
                                                                aria-label="open-public"
                                                                onClick={() => window.open(agent.public_url, '_blank', 'noopener')}
                                                                title="Open public link"
                                                                size="small"
                                                            >
                                                                <OpenInNewIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                        <IconButton
                                                            edge="end"
                                                            aria-label="open-chat"
                                                            onClick={() => openChatForAgent(agent)}
                                                            title="Open chat"
                                                            size="small"
                                                        >
                                                            <ChatIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                                        create alias
                                                    </Typography>
                                                )
                                            }
                                        >
                                            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>{(agent.name || 'A').slice(0, 1).toUpperCase()}</Avatar>
                                            <ListItemText primary={agent.name} secondary={agent.alias_id ? 'Ready to chat' : 'Alias not created'} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}

                        {view === 'chat' && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        overflow: 'auto',
                                        p: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                    }}
                                    ref={messagesRef}
                                >
                                    {messages.length === 0 && (
                                        <Box sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                                            <Typography variant="body2">No messages yet — send the first message</Typography>
                                        </Box>
                                    )}

                                    {messages.map((m) => (
                                        <Box
                                            key={m.id}
                                            sx={{
                                                display: 'flex',
                                                gap: 1,
                                                alignItems: 'flex-end',
                                                justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            {m.sender === 'bot' && <Avatar sx={{ width: 30, height: 30, mt: 0.5 }}>B</Avatar>}
                                            <Box
                                                sx={{
                                                    maxWidth: '78%',
                                                    p: 1,
                                                    borderRadius: 2,
                                                    backgroundColor: m.sender === 'user' ? 'primary.main' : 'background.paper',
                                                    color: m.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                                                    boxShadow: 1,
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                <Typography variant="body2">{m.text}</Typography>
                                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: 'right', color: 'text.secondary' }}>
                                                    {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            </Box>
                                            {m.sender === 'user' && <Avatar sx={{ width: 30, height: 30 }}>U</Avatar>}
                                        </Box>
                                    ))}
                                </Box>

                                <Divider />

                                <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <TextField
                                        placeholder="Type your message..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={onKeyDown}
                                        multiline
                                        minRows={1}
                                        maxRows={4}
                                        fullWidth
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Button variant="contained" endIcon={<SendIcon />} onClick={() => sendMessage()} disabled={isSending}>
                                                        {isSending ? 'Sending' : 'Send'}
                                                    </Button>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default ChatWidget;
