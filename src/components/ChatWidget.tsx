import React from 'react';
import {
    Fab, Box, Avatar, Typography, IconButton, TextField,
    InputAdornment, Button, Divider
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

export interface AgentMini {
    id: string;
    name?: string;
    alias_id?: string | null;
}

type Props = {
    agent?: AgentMini;
    apiUrl?: string;
    apiKey?: string;
    channelId?: string;
    bottom?: number;
    right?: number;
};

type ChatMessage = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    time: string;
    isTyping?: boolean; // Добавлено для индикатора "Печатает..."
};

const ChatWidget: React.FC<Props> = ({
                                         agent,
                                         apiUrl = 'https://3bpvxit706.execute-api.us-west-2.amazonaws.com/dev',
                                         apiKey,
                                         channelId,
                                         bottom = 24,
                                         right = 24,
                                     }) => {
    const [expanded, setExpanded] = React.useState(false);
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = React.useState('');
    const [isSending, setIsSending] = React.useState(false);
    const [sessionId] = React.useState(`public-${Date.now()}`);

    const agentId = agent?.id || 'default';
    const agentName = agent?.name || 'Agent';
    const isOnline = Boolean(agent?.alias_id);

    // Проверка параметров при монтировании
    React.useEffect(() => {
        if (!agentId || !apiKey) {
            setMessages((prev) => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    text: 'Error: Не переданы agentId или apiKey.',
                    sender: 'bot',
                    time: new Date().toISOString(),
                },
            ]);
        }
    }, [agentId, apiKey]);

    async function sendMessage() {
        const text = inputValue.trim();
        if (!text || !agentId || !apiKey || !sessionId) {
            setMessages((prev) => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    text: 'Error: Не хватает данных для отправки сообщения.',
                    sender: 'bot',
                    time: new Date().toISOString(),
                },
            ]);
            return;
        }

        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            text,
            sender: 'user',
            time: new Date().toISOString(),
        };
        const typingMsg: ChatMessage = {
            id: `typing-${Date.now()}`,
            text: 'Печатает...',
            sender: 'bot',
            time: new Date().toISOString(),
            isTyping: true,
        };

        // Добавляем сообщение пользователя и "Печатает..."
        setMessages((prev) => [...prev, userMsg, typingMsg]);
        setInputValue('');
        setIsSending(true);

        try {
            const response = await axios.post(
                `${apiUrl.replace(/\/$/, '')}/public-send`,
                {
                    message: text,
                    agentId,
                    sessionId,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: apiKey,
                    },
                }
            );
            const raw = response.data;
            const data = typeof raw?.body === 'string' ? JSON.parse(raw.body) : raw;
            setMessages((prev) =>
                prev.filter((msg) => !msg.isTyping).concat({
                    id: `msg-${Date.now()}`,
                    text: data?.response || 'Нет ответа от сервера',
                    sender: 'bot',
                    time: new Date().toISOString(),
                })
            );
        } catch (err: unknown) {
            let msg = 'Unknown Error';
            if (axios.isAxiosError(err)) {
                msg = err.response?.data?.error || err.message;
            } else if (err instanceof Error) {
                msg = err.message;
            }
            setMessages((prev) =>
                prev.filter((msg) => !msg.isTyping).concat({
                    id: `error-${Date.now()}`,
                    text: `Error: ${msg}`,
                    sender: 'bot',
                    time: new Date().toISOString(),
                })
            );
        } finally {
            setIsSending(false);
        }
    }

    return (
        <Box sx={{ position: 'fixed', bottom, right, zIndex: 2000 }}>
            {!expanded && (
                <Fab color="primary" onClick={() => setExpanded(true)}>
                    <ChatIcon />
                </Fab>
            )}
            {expanded && (
                <Box
                    sx={{
                        width: 360,
                        height: '70vh',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 6,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1,
                            borderBottom: '1px solid #eee',
                        }}
                    >
                        <Avatar sx={{ mr: 1 }}>
                            {agentName?.[0]?.toUpperCase() || 'A'}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2">{agentName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isOnline ? 'Online' : 'Offline'}
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setExpanded(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                        {messages.map((m) => (
                            <Box
                                key={m.id}
                                sx={{ textAlign: m.sender === 'user' ? 'right' : 'left', mb: 1 }}
                            >
                                <Typography
                                    sx={{
                                        display: 'inline-block',
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 2,
                                        bgcolor: m.sender === 'user' ? 'primary.main' : 'grey.200',
                                        color: m.sender === 'user' ? 'white' : 'black',
                                        fontStyle: m.isTyping ? 'italic' : 'normal',
                                    }}
                                >
                                    {m.text}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                    <Divider />
                    <Box sx={{ p: 1 }}>
                        <TextField
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && !isSending && sendMessage()
                            }
                            placeholder="Type a message"
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button
                                            variant="contained"
                                            endIcon={<SendIcon />}
                                            onClick={sendMessage}
                                            disabled={isSending}
                                        >
                                            Send
                                        </Button>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default ChatWidget;