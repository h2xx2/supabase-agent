import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
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
    // Добавляем состояние для sessionId
    const [sessionIds, setSessionIds] = useState<Record<string, string>>({});

    const fetchAgentStatus = useCallback(async (agentId: string) => {
        try {
            console.log('Запрос статуса для agentId:', agentId);
            const response = await fetch(`https://7663xw5ty5.execute-api.us-west-2.amazonaws.com/version/get-agent-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ agentId }),
            });
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status} - ${await response.text()}`);
            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
                if (typeof result.body === 'string') {
                    result = JSON.parse(result.body);
                }
                const status = result.body?.status || result.status || 'UNKNOWN';
                console.log(`Извлеченный статус для ${agentId}: ${status}`);
                return status;
            } catch (parseError) {
                console.error('Ошибка парсинга:', parseError, 'Текст ответа:', responseText);
                throw new Error('Невалидный JSON в ответе от сервера');
            }
        } catch (error) {
            console.error('Ошибка при получении статуса:', error);
            return 'UNKNOWN';
        }
    }, []);

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
        const { data, error } = await supabase
            .from('Agents')
            .select('*')
            .eq('user_id', user?.id);
        if (error) {
            console.error('Ошибка при получении агентов:', error.message);
            setErrorMessage('Ошибка при загрузке агентов: ' + error.message);
            return;
        }
        if (data) {
            const updatedAgents = await Promise.all(data.map(async (agent) => {
                if (!agent.status || ['CREATING', 'NOT_PREPARED', 'PREPARING'].includes(agent.status.toUpperCase())) {
                    const status = await fetchAgentStatus(agent.agent_id);
                    if (status !== 'UNKNOWN') {
                        const { error: updateError, data: updateData } = await supabase
                            .from('Agents')
                            .update({ status })
                            .eq('agent_id', agent.agent_id)
                            .select();
                        if (updateError) {
                            console.error('Ошибка обновления статуса в Supabase:', updateError);
                            setErrorMessage(`Ошибка обновления статуса для агента ${agent.agent_id}: ${updateError.message}`);
                        } else if (updateData && updateData.length > 0) {
                            return { ...agent, ...updateData[0] };
                        }
                    }
                    return { ...agent, status };
                }
                return agent;
            }));
            setAgents(updatedAgents);
        }
    };

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

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
        if (!newAgent.name.trim() || !newAgent.instructions.trim()) {
            setErrorMessage('Имя и инструкции обязательны');
            return;
        }
        if (newAgent.instructions.length < 40) {
            setErrorMessage('Инструкции должны содержать минимум 40 символов');
            return;
        }
        const sanitizedName = newAgent.name.replace(/[^a-zA-Z0-9_-]/g, '');
        if (!sanitizedName) {
            setErrorMessage('Имя агента должно содержать только буквы, цифры, _ или -');
            return;
        }
        if (!user?.id) {
            setErrorMessage('Пользователь не аутентифицирован');
            return;
        }
        setLoadingAgentId(null);
        const requestBody = {
            name: sanitizedName,
            instructions: newAgent.instructions,
            user_id: user.id,
        };
        try {
            setLoadingAgentId('new-agent');
            const response = await fetch(import.meta.env.VITE_API_GATEWAY_URL || 'https://7663xw5ty5.execute-api.us-west-2.amazonaws.com/version/create-agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
                if (typeof result.body === 'string') {
                    result = JSON.parse(result.body);
                }
            } catch (parseError) {
                console.error('Ошибка парсинга:', parseError, responseText);
                throw new Error('Невалидный JSON в ответе от сервера');
            }
            if (!response.ok) {
                throw new Error(result.error || 'Ошибка при создании агента');
            }
            const agentId = result.agentId;
            const status = result.status;
            if (!agentId) {
                throw new Error('agentId отсутствует в ответе от сервера');
            }
            const { error } = await supabase.from('Agents').insert({
                user_id: user.id,
                name: sanitizedName,
                instructions: newAgent.instructions,
                agent_id: agentId,
                alias_id: null,
                status: status,
            });
            if (error) {
                throw new Error(`Ошибка при создании агента в Supabase: ${error.message}`);
            }
            await fetchAgents();
            setLoadingAgentId(null);
            handleCloseAddDialog();
        } catch (error) {
            console.error('Ошибка при создании:', error);
            setErrorMessage(error.message || 'Произошла ошибка при создании агента');
            setLoadingAgentId(null);
        }
    };

    const createAlias = async (agentId: string, agentName: string) => {
        try {
            setLoadingAgentId(agentId);
            const response = await fetch(`https://7663xw5ty5.execute-api.us-west-2.amazonaws.com/version/create-alias`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ agentId, agentName }),
            });
            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
                let body;
                if (typeof result.body === 'string') {
                    body = JSON.parse(result.body);
                } else {
                    body = result.body;
                }
                const aliasId = body.aliasId;
                if (!aliasId) {
                    throw new Error('aliasId отсутствует в ответе от сервера');
                }
                const { error, data } = await supabase
                    .from('Agents')
                    .update({ alias_id: aliasId })
                    .eq('agent_id', agentId)
                    .select();
                if (error) {
                    throw new Error(`Ошибка при сохранении alias в Supabase: ${error.message}`);
                }
                if (data && data.length > 0) {
                    setAgents((prevAgents) =>
                        prevAgents.map((agent) =>
                            agent.agent_id === agentId ? { ...agent, ...data[0] } : agent
                        )
                    );
                }
                setLoadingAgentId(null);
            } catch (parseError) {
                console.error('Ошибка парсинга:', parseError, responseText);
                setErrorMessage('Ошибка обработки ответа от сервера');
                setLoadingAgentId(null);
            }
        } catch (error) {
            console.error('Ошибка в createAlias:', error);
            setErrorMessage(error.message || 'Произошла ошибка при создании алиаса');
            setLoadingAgentId(null);
        }
    };

    // Обновленная функция отправки сообщения в чат
    const sendChatMessage = async (text: string) => {
        if (!text.trim() || !selectedAgent?.agent_id || !selectedAgent.alias_id) return;

        const newMessage: MessageModel = {
            message: text,
            sentTime: new Date().toISOString(),
            sender: 'user',
            direction: 'outgoing',
            position: 'single',
        };

        setChatMessages([...chatMessages, newMessage]);

        // Получаем или создаем sessionId для текущего агента
        let sessionId = sessionIds[selectedAgent.agent_id];
        if (!sessionId) {
            sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Уникальный sessionId
            setSessionIds((prev) => ({ ...prev, [selectedAgent.agent_id]: sessionId }));
        }

        try {
            const response = await axios.post('https://7663xw5ty5.execute-api.us-west-2.amazonaws.com/version/send', {
                message: text,
                agentId: selectedAgent.agent_id,
                aliasId: selectedAgent.alias_id,
                sessionId: sessionId, // Передаем sessionId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = typeof response.data.body === 'string'
                ? JSON.parse(response.data.body)
                : response.data;

            const botReply = data.response || 'No response from server';

            const botMessage: MessageModel = {
                message: botReply,
                sentTime: new Date().toISOString(),
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };

            setChatMessages((prev) => [...prev, botMessage]);
        } catch (error: unknown) {
            let errorMessageText = 'Unknown error';
            if (axios.isAxiosError(error)) {
                errorMessageText = error.response?.data?.error || error.message || 'Axios error';
            } else if (error instanceof Error) {
                errorMessageText = error.message;
            }
            console.error('Error sending message:', errorMessageText);

            const errorMessage: MessageModel = {
                message: `Error: ${errorMessageText}`,
                sentTime: new Date().toISOString(),
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };
            setChatMessages((prev) => [...prev, errorMessage]);
        }
    };

    // Обработчик открытия чата
    const handleOpenChat = (agent: Agent) => {
        if (agent.agent_id && agent.alias_id) {
            setSelectedAgent(agent);
            setChatMessages([]);
            // Сбрасываем sessionId для нового чата, если нужно начать заново
            setSessionIds((prev) => {
                const newSessionIds = { ...prev };
                delete newSessionIds[agent.agent_id]; // Сбрасываем sessionId для нового чата
                return newSessionIds;
            });
            setChatOpen(true);
        }
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
                        <Button color="inherit" onClick={() => supabase.auth.signOut().then(handleSignOut)}>
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