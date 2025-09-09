import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    IconButton,
    Drawer,
    Typography,
    ListItemText,
    Menu,
    MenuItem,
    useTheme,
    Fab,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import {
    MessageList,
    Message,
    MessageInput,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import axios from 'axios';

// Добавляем интерфейс Agent прямо здесь (из вашего App.tsx)
interface Agent {
    id: string;
    user_id: string;
    name: string;
    instructions: string;
    created_at: string;
    agent_id: string;
    alias_id: string | null;
    status?: string;
    public_url?: string;
    call_count?: number;
    call_count_year?: number;
    knowledge_base_id?: string;
    http_action_enabled: boolean;
    email_action_enabled: boolean;
}

interface ChatWidgetProps {
    agents: Agent[];
    user?: any;
    deviceType: string;
    getAuthToken: () => string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ agents, user, getAuthToken }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [sessionId, setSessionId] = useState<string>('');
    const messageListRef = useRef<HTMLDivElement>(null);

    // @ts-ignore
    const theme = useTheme();

    useEffect(() => {
        if (chatOpen && messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [chatMessages, chatOpen]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const openChat = (agent: Agent) => {
        setSelectedAgent(agent);
        setChatMessages([]);
        let sid = localStorage.getItem(`session_${agent.agent_id}`);
        if (!sid) {
            sid = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem(`session_${agent.agent_id}`, sid);
        }
        setSessionId(sid);
        setChatOpen(true);
        handleCloseMenu();
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || !selectedAgent?.agent_id || !selectedAgent.alias_id) return;

        const userMessage = {
            message: text,
            sentTime: new Date().toISOString(),
            sender: 'user',
            direction: 'outgoing',
            position: 'single',
        };
        setChatMessages((prev) => [...prev, userMessage]);

        try {
            const payload = {
                message: text,
                agentId: selectedAgent.agent_id,
                aliasId: selectedAgent.alias_id,
                sessionId,
                user_id: user?.id, // Если авторизован
            };
            const headers: any = { 'Content-Type': 'application/json' };
            if (user) {
                headers.Authorization = `Bearer ${getAuthToken()}`;
            }
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/send`,
                payload,
                { headers }
            );

            const botMessage = {
                message: response.data.response,
                sentTime: new Date().toISOString(),
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };
            setChatMessages((prev) => [...prev, botMessage]);
        } catch (error: any) {
            const errorMsg = {
                message: error.response?.data?.error || 'Ошибка отправки сообщения',
                sentTime: new Date().toISOString(),
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };
            setChatMessages((prev) => [...prev, errorMsg]);
        }
    };

    const toggleChat = () => {
        setChatOpen(!chatOpen);
    };

    return (
        <>
            <Fab
                color="primary"
                aria-label="chat"
                onClick={handleClick}
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1300,
                    boxShadow: 6,
                }}
            >
                <ChatIcon />
            </Fab>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                {agents.map((agent) => (
                    <MenuItem key={agent.id} onClick={() => openChat(agent)} disabled={!agent.alias_id}>
                        <ListItemText primary={agent.name} />
                    </MenuItem>
                ))}
            </Menu>

            <Drawer
                anchor="right"
                open={chatOpen}
                onClose={toggleChat}
                sx={{ '& .MuiDrawer-paper': { width: { xs: '100vw', sm: 400 } } }}
            >
                <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Chat with {selectedAgent?.name}</Typography>
                        <IconButton onClick={toggleChat}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <MessageList
                        ref={messageListRef}
                        style={{ flex: 1, overflowY: 'auto', padding: 2 }}
                    >
                        {chatMessages.map((msg, index) => (
                            <Message key={index} model={msg} />
                        ))}
                    </MessageList>
                    <MessageInput
                        placeholder="Type your message..."
                        onSend={sendMessage}
                        attachButton={false}
                    />
                </Box>
            </Drawer>
        </>
    );
};

export default ChatWidget;