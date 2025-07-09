import React, { useState, useEffect, useCallback } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Container,
    IconButton,
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    CircularProgress,
    Alert,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Auth from './components/Auth';
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    type MessageModel,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import axios from 'axios';

interface Agent {
    id: string;
    user_id: string;
    name: string;
    instructions: string;
    created_at: string;
    agent_id: string;
    alias_id: string | null;
    status?: string;
}

const App: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newAgent, setNewAgent] = useState({ name: '', instructions: '' });
    const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [chatMessages, setChatMessages] = useState<MessageModel[]>([]);
    const [sessionIds, setSessionIds] = useState<Record<string, string>>({});

    const fetchAgentStatus = async (agentId: string): Promise<string> => {
        const token = await getAuthToken();
        const user_id = user?.id; // Убедись, что user доступен в этом контексте

        if (!user_id) throw new Error('user_id отсутствует');

        const response = await axios.post(
            `${import.meta.env.VITE_API_GATEWAY_URL}/get-agent-status`,
            { agentId, user_id },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.status;
    };

    useEffect(() => {
        if (user) {
            const loadAgents = async () => {
                try {
                    await fetchAgents();
                } catch (error) {
                    console.error('Ошибка при загрузке агентов:', error);
                    setErrorMessage('Не удалось загрузить агентов');
                }
            };
            loadAgents();
            const interval = setInterval(loadAgents, 15000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchAgents = async () => {
        try {
            const token = await getAuthToken();
            console.log('Fetching agents with token:', token);
            const response = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/agents`,
                { user_id: user?.id },
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );
            setAgents(response.data.agents);
        } catch (error) {
            console.error('Ошибка при получении агентов:', error);
            setErrorMessage('Ошибка при загрузке агентов');
        }
    };


    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    const handleSignOut = () => {
        setUser(null);
        setAgents([]);
    };

    const handleOpenAddDialog = () => {
        setOpenAddDialog(true);
        setErrorMessage(null);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewAgent({ name: '', instructions: '' });
        setErrorMessage(null);
    };

    const handleAddAgent = async () => {
        if (!newAgent.name.trim() || !newAgent.instructions.trim() || newAgent.instructions.length < 40) {
            setErrorMessage('Имя и инструкции (мин. 40 символов) обязательны');
            return;
        }

        const sanitizedName = newAgent.name.replace(/[^a-zA-Z0-9_-]/g, '');
        if (!sanitizedName) {
            setErrorMessage('Недопустимое имя агента');
            return;
        }

        setLoadingAgentId('new-agent');
        const token = await getAuthToken();

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/create-agent`,
                JSON.stringify({
                    name: sanitizedName,
                    instructions: newAgent.instructions,
                    user_id: user?.id,
                }),
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const createdAgentId = response.data.agentId; // предполагается, что API возвращает agentId
            if (!createdAgentId) throw new Error('agentId не получен из ответа');

            // ⏳ Ждать пока статус станет PREPARED
            const waitForPrepared = async (agentId: string, retries = 20, delayMs = 4000) => {
                for (let i = 0; i < retries; i++) {
                    const status = await fetchAgentStatus(agentId);
                    console.log(`Статус агента ${agentId}: ${status}`);
                    if (status === 'PREPARED') {
                        return true; // Статус готов
                    }
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                }
                return false; // Статус не стал PREPARED за отведённое время
            };


            await waitForPrepared();
            await fetchAgents();
            setLoadingAgentId(null);
            handleCloseAddDialog();

        } catch (error) {
            console.error('Ошибка при создании агента:', error);
            setErrorMessage('Ошибка при создании агента');
            setLoadingAgentId(null);
        }
    };


    const createAlias = async (agentId: string, agentName: string) => {
        setLoadingAgentId(agentId);
        const token = await getAuthToken();
        try {
            console.log('Creating alias with token:', token); // Отладка
            const response = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/create-alias`, {
                agentId, agentName,
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            await fetchAgents();
            setLoadingAgentId(null);
        } catch (error) {
            console.error('Ошибка при создании алиаса:', error);
            setErrorMessage('Ошибка при создании алиаса');
            setLoadingAgentId(null);
        }
    };

    const sendChatMessage = async (text: string) => {
        if (!text.trim() || !selectedAgent?.agent_id || !selectedAgent.alias_id) return;
        const newMessage: MessageModel = { message: text, sentTime: new Date().toISOString(), sender: 'user', direction: 'outgoing', position: 'single' };
        setChatMessages([...chatMessages, newMessage]);
        let sessionId = sessionIds[selectedAgent.agent_id] || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setSessionIds((prev) => ({ ...prev, [selectedAgent.agent_id]: sessionId }));
        const token = await getAuthToken();
        try {
            console.log('Sending message with token:', token); // Отладка
            const response = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/send`, {
                message: text, agentId: selectedAgent.agent_id, aliasId: selectedAgent.alias_id, sessionId,
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            const botMessage: MessageModel = { message: response.data.response, sentTime: new Date().toISOString(), sender: 'bot', direction: 'incoming', position: 'single' };
            setChatMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            const errorMessage: MessageModel = { message: `Error: ${error.message}`, sentTime: new Date().toISOString(), sender: 'bot', direction: 'incoming', position: 'single' };
            setChatMessages((prev) => [...prev, errorMessage]);
        }
    };

    const handleOpenChat = (agent: Agent) => {
        if (agent.agent_id && agent.alias_id) {
            setSelectedAgent(agent);
            setChatMessages([]);
            setSessionIds((prev) => {
                const newSessionIds = { ...prev };
                delete newSessionIds[agent.agent_id];
                return newSessionIds;
            });
            setChatOpen(true);
        }
    };

    const getAuthToken = async (): Promise<string> => {
        const token = localStorage.getItem('authToken');
        console.log('Current auth token:', token, 'at', new Date().toISOString());
        if (!token) {
            console.warn('No auth token found in localStorage');
        }
        return token || 'temporary-token'; // Заглушка, замените на реальную логику
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed">
                <Toolbar>
                    {user && (
                        <IconButton color="inherit" onClick={toggleDrawer} edge="start" sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Мои Агенты
                    </Typography>
                    {user && (
                        <Button color="inherit" onClick={handleSignOut}>
                            Выйти
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            <Drawer open={drawerOpen} onClose={toggleDrawer}>
                <List sx={{ width: 250 }}>
                    <ListItem button onClick={handleOpenAddDialog}>
                        <ListItemText primary="Добавить" />
                    </ListItem>
                    <ListItem onClick={toggleDrawer}>
                        <ListItemText primary="Закрыть" />
                    </ListItem>
                </List>
            </Drawer>
            <Container sx={{ mt: 10, flex: 1 }}>
                <Auth onAuthChange={setUser} onSignOut={handleSignOut} />
                {user ? (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5">Ваши агенты</Typography>
                        {errorMessage && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errorMessage}
                            </Alert>
                        )}
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Имя</TableCell>
                                    <TableCell>Инструкции</TableCell>
                                    <TableCell>ID агента</TableCell>
                                    <TableCell>Статус</TableCell>
                                    <TableCell>Alias ID</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {agents.length > 0 ? (
                                    agents.map((agent) => (
                                        <TableRow key={agent.id}>
                                            <TableCell>{agent.name}</TableCell>
                                            <TableCell>{agent.instructions}</TableCell>
                                            <TableCell>{agent.agent_id}</TableCell>
                                            <TableCell>{agent.status || 'UNKNOWN'}</TableCell>
                                            <TableCell>{agent.alias_id || 'Не создан'}</TableCell>
                                            <TableCell>
                                                {loadingAgentId === agent.agent_id || loadingAgentId === 'new-agent' ? (
                                                    <CircularProgress size={24} />
                                                ) : (
                                                    <>
                                                        {!agent.alias_id && agent.status === 'PREPARED' ? (
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={() => createAlias(agent.agent_id, agent.name)}
                                                                sx={{ mr: 1 }}
                                                            >
                                                                Создать Alias
                                                            </Button>
                                                        ) : null}
                                                        {agent.agent_id && agent.alias_id && (
                                                            <Button
                                                                variant="contained"
                                                                color="secondary"
                                                                onClick={() => handleOpenChat(agent)}
                                                            >
                                                                Чат
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6}>Нет агентов</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                ) : (
                    <Box sx={{ mt: 4 }}>
                        <Typography>Пожалуйста, войдите для просмотра агентов</Typography>
                    </Box>
                )}
                <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
                    <DialogTitle>Добавить нового агента</DialogTitle>
                    <DialogContent>
                        {errorMessage && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errorMessage}
                            </Alert>
                        )}
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Имя"
                            type="text"
                            fullWidth
                            value={newAgent.name}
                            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                            helperText="Используйте только буквы, цифры, _ или -"
                        />
                        <TextField
                            margin="dense"
                            label="Инструкции"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            value={newAgent.instructions}
                            onChange={(e) => setNewAgent({ ...newAgent, instructions: e.target.value })}
                            helperText="Минимальная длина 40 символов"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddDialog} color="primary">
                            Отмена
                        </Button>
                        <Button onClick={handleAddAgent} color="primary">
                            Добавить
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
            <Drawer
                anchor="right"
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: '35vw',
                        maxWidth: '80vw',
                    },
                }}
            >
                {selectedAgent && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'grey.300' }}>
                            Чат с {selectedAgent.name}
                        </Typography>
                        <ChatContainer style={{ flex: 1 }}>
                            <MessageList>
                                {chatMessages.map((msg, index) => (
                                    <Message key={index} model={msg} />
                                ))}
                            </MessageList>
                            <MessageInput
                                placeholder="Введите сообщение..."
                                onSend={sendChatMessage}
                                attachButton={false}
                            />
                        </ChatContainer>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
};

export default App;