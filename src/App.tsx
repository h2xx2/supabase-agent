import React, { useState, useEffect } from 'react';
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
    Checkbox,
    FormControlLabel,
    Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Auth from './components/Auth';
import {
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    type MessageModel,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import axios from 'axios';

interface Agent {
    enableEmailAction: boolean;
    enableHttpAction: boolean;
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
}

const App: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [newAgent, setNewAgent] = useState({ name: '', instructions: '' });
    const [editAgent, setEditAgent] = useState<Agent | null>(null);
    const [enableHttpAction, setEnableHttpAction] = useState(false);
    const [enableEmailAction, setEnableEmailAction] = useState(false);
    const [editEnableHttpAction, setEditEnableHttpAction] = useState(false);
    const [editEnableEmailAction, setEditEnableEmailAction] = useState(false);
    const [newFile, setNewFile] = useState<File | null>(null); // Для нового агента
    const [editFile, setEditFile] = useState<File | null>(null); // Для редактирования
    const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [chatMessages, setChatMessages] = useState<MessageModel[]>([]);
    const [sessionIds, setSessionIds] = useState<Record<string, string>>({});

    const fetchAgentStatus = async (agentId: string): Promise<string> => {
        const token = await getAuthToken();
        const user_id = user?.id;
        if (!user_id) throw new Error('user_id отсутствует');

        const response = await axios.post(
            `${import.meta.env.VITE_API_GATEWAY_URL}/get-agent-status`,
            { agentId, user_id },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        return response.data.statusInDb || 'UNKNOWN';
    };

    useEffect(() => {
        if (user) {
            const loadAgents = async () => {
                try {
                    const agentsData = await fetchAgents();
                    setAgents(agentsData);
                } catch (error: any) {
                    console.error('Ошибка при загрузке агентов:', error);
                    setErrorMessage('Не удалось загрузить агентов');
                }
            };
            loadAgents();
            const interval = setInterval(loadAgents, 15000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchAgents = async (): Promise<Agent[]> => {
        try {
            const token = await getAuthToken();
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/agents`,
                { user_id: user?.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.agents || [];
        } catch (error: any) {
            console.error('Ошибка при получении агентов:', error);
            setErrorMessage('Ошибка при загрузке агентов');
            return [];
        }
    };

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    const handleSignOut = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/signout`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (error: any) {
            console.error('Sign Out Error:', error);
        } finally {
            setUser(null);
            setAgents([]);
            setSelectedAgent(null);
            setChatOpen(false);
            setChatMessages([]);
            setSessionIds({});
            localStorage.removeItem('authToken');
        }
    };

    const handleOpenAddDialog = () => {
        setOpenAddDialog(true);
        setErrorMessage(null);
        setEnableHttpAction(false);
        setEnableEmailAction(false);
        setNewFile(null);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewAgent({ name: '', instructions: '' });
        setErrorMessage(null);
        setEnableHttpAction(false);
        setEnableEmailAction(false);
        setNewFile(null);
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
            const fileData = newFile ? await convertFileToBase64(newFile) : null;
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/create-agent`,
                JSON.stringify({
                    name: sanitizedName,
                    instructions: newAgent.instructions,
                    user_id: user?.id,
                    enableHttpAction,
                    enableEmailAction,
                    file: fileData,
                }),
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            const createdAgentId = response.data.agentId;
            if (!createdAgentId) throw new Error('agentId не получен из ответа');

            const waitForPrepared = async (agentId: string) => {
                for (let i = 0; i < 20; i++) {
                    const status = await fetchAgentStatus(agentId);
                    if (status === 'PREPARED') return true;
                    await new Promise((resolve) => setTimeout(resolve, 4000));
                }
                return false;
            };

            const isPrepared = await waitForPrepared(createdAgentId);
            if (!isPrepared) throw new Error('Статус агента не стал PREPARED');

            await fetchAgents();
            setLoadingAgentId(null);
            handleCloseAddDialog();
        } catch (error: any) {
            console.error('Ошибка при создании агента:', error);
            setErrorMessage(`Ошибка при создании агента: ${error.message || 'Неизвестная ошибка'}`);
            setLoadingAgentId(null);
        }
    };

    const createAlias = async (agentId: string, agentName: string) => {
        setLoadingAgentId(agentId);
        const token = await getAuthToken();
        try {
            if (!user?.id) throw new Error('user_id отсутствует');
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/create-alias`,
                { agentId, agentName, user_id: user.id },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            await fetchAgents();
            setLoadingAgentId(null);
        } catch (error: any) {
            console.error('Ошибка при создании алиаса:', error);
            setErrorMessage(`Ошибка при создании алиаса: ${error.message || 'Неизвестная ошибка'}`);
            setLoadingAgentId(null);
        }
    };

    const handleOpenEditDialog = (agent: Agent) => {
        setEditAgent(agent);
        setEditEnableHttpAction(agent.enableHttpAction || false);
        setEditEnableEmailAction(agent.enableEmailAction || false);
        setEditFile(null); // Сбрасываем файл
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditAgent(null);
        setErrorMessage(null);
        setEditEnableHttpAction(false);
        setEditEnableEmailAction(false);
        setEditFile(null);
    };

    const handleEditAgent = async () => {
        if (!editAgent || !editAgent.id || !editAgent.agent_id || !editAgent.name.trim() || !editAgent.instructions.trim() || editAgent.instructions.length < 40) {
            setErrorMessage('Имя и инструкции (мин. 40 символов) обязательны');
            return;
        }

        const sanitizedName = editAgent.name.replace(/[^a-zA-Z0-9_-]/g, '');
        if (!sanitizedName) {
            setErrorMessage('Недопустимое имя агента');
            return;
        }

        setLoadingAgentId(editAgent.id);
        const token = await getAuthToken();

        try {
            const fileData = editFile ? await convertFileToBase64(editFile) : null;
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/update-agent`,
                JSON.stringify({
                    id: editAgent.id,
                    agent_id: editAgent.agent_id,
                    name: sanitizedName,
                    instructions: editAgent.instructions,
                    user_id: user?.id,
                    enableHttpAction: editEnableHttpAction,
                    enableEmailAction: editEnableEmailAction,
                    file: fileData,
                }),
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            await fetchAgents();
            setLoadingAgentId(null);
            handleCloseEditDialog();
        } catch (error: any) {
            console.error('Ошибка при обновлении агента:', error);
            setErrorMessage(`Ошибка при обновлении агента: ${error.message || 'Неизвестная ошибка'}`);
            setLoadingAgentId(null);
        }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const sendChatMessage = async (text: string) => {
        if (!text.trim() || !selectedAgent?.agent_id || !selectedAgent.alias_id) return;
        const newMessage: MessageModel = { message: text, sentTime: new Date().toISOString(), sender: 'user', direction: 'outgoing', position: 'single' };
        setChatMessages([...chatMessages, newMessage]);
        let sessionId = sessionIds[selectedAgent.agent_id] || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setSessionIds((prev) => ({ ...prev, [selectedAgent.agent_id]: sessionId }));
        const token = await getAuthToken();
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/send`, {
                message: text,
                agentId: selectedAgent.agent_id,
                aliasId: selectedAgent.alias_id,
                sessionId,
                user_id: user?.id,
            }, { headers: { Authorization: `Bearer ${token}` } });

            const botMessage: MessageModel = { message: response.data.response, sentTime: new Date().toISOString(), sender: 'bot', direction: 'incoming', position: 'single' };
            setChatMessages((prev) => [...prev, botMessage]);

            await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/save-message`, {
                agent_id: selectedAgent.agent_id,
                session_id: sessionId,
                message: text,
                sender: 'user',
                user_id: user?.id,
            }, { headers: { Authorization: `Bearer ${token}` } });

            await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/save-call`, {
                agent_id: selectedAgent.agent_id,
                user_id: user?.id,
                status: 'success',
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error: any) {
            console.error('Ошибка при отправке сообщения:', error);
            const errorMessage: MessageModel = { message: `Ошибка: ${error.message || 'Неизвестная ошибка'}`, sentTime: new Date().toISOString(), sender: 'bot', direction: 'incoming', position: 'single' };
            setChatMessages((prev) => [...prev, errorMessage]);

            await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/save-call`, {
                agent_id: selectedAgent.agent_id,
                user_id: user?.id,
                status: 'failure',
            }, { headers: { Authorization: `Bearer ${token}` } });
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
        } else {
            console.warn('Agent ID or Alias ID missing:', agent);
        }
    };

    const getAuthToken = async (): Promise<string> => {
        const token = localStorage.getItem('authToken') || 'temporary-token';
        return token;
    };

    const deployChat = async (agent: Agent) => {
        setLoadingAgentId(agent.id);
        try {
            const token = await getAuthToken();
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/deploy-chat`,
                { agentId: agent.agent_id, user_id: user?.id },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            const { publicUrl, apkKey } = response.data;
            setAgents(agents.map(a => a.id === agent.id ? { ...a, public_url: publicUrl } : a));
            alert(`Публичная URL: ${publicUrl}\nAPK Key: ${apkKey}\nСкопируйте и используйте для доступа!`);
        } catch (error: any) {
            console.error('Ошибка при деплое чата:', error);
            setErrorMessage(`Ошибка при деплое чата: ${error.message || 'Неизвестная ошибка'}`);
        } finally {
            setLoadingAgentId(null);
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
                        <Button color="inherit" onClick={handleSignOut}>
                            Выйти
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            <Drawer open={drawerOpen} onClose={toggleDrawer}>
                <List sx={{ width: 250 }}>
                    <ListItem component="button" onClick={handleOpenAddDialog}>
                        <ListItemText primary="Добавить агента" />
                    </ListItem>
                    <ListItem component="button" onClick={toggleDrawer}>
                        <ListItemText primary="Закрыть" />
                    </ListItem>
                </List>
            </Drawer>
            <Container sx={{ mt: 10, flex: 1 }}>
                {!user ? (
                    <Auth onAuthChange={setUser} onSignOut={handleSignOut} />
                ) : (
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
                                    <TableCell>Вызовы (месяц)</TableCell>
                                    <TableCell>Вызовы (год)</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {agents.length > 0 ? (
                                    agents.map((agent) => (
                                        <React.Fragment key={agent.id}>
                                            <TableRow>
                                                <TableCell>{agent.name}</TableCell>
                                                <TableCell>{agent.instructions}</TableCell>
                                                <TableCell>{agent.agent_id}</TableCell>
                                                <TableCell>{agent.status || 'UNKNOWN'}</TableCell>
                                                <TableCell>{agent.alias_id || 'Не создан'}</TableCell>
                                                <TableCell>{agent.call_count || 0}</TableCell>
                                                <TableCell>{agent.call_count_year || 0}</TableCell>
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
                                                                <>
                                                                    <Button
                                                                        variant="contained"
                                                                        color="primary"
                                                                        onClick={() => handleOpenChat(agent)}
                                                                        sx={{ mr: 2, minWidth: 100, marginBottom: '10px' }}
                                                                    >
                                                                        Чат
                                                                    </Button>
                                                                    {!agent.public_url && (
                                                                        <Button
                                                                            variant="contained"
                                                                            color="secondary"
                                                                            onClick={() => deployChat(agent)}
                                                                            sx={{ minWidth: 100 }}
                                                                        >
                                                                            Deploy
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}
                                                            <Button
                                                                variant="contained"
                                                                color="warning"
                                                                onClick={() => handleOpenEditDialog(agent)}
                                                                sx={{ mr: 1, minWidth: 100 }}
                                                            >
                                                                Редактировать
                                                            </Button>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            {agent.public_url && (
                                                <TableRow>
                                                    <TableCell colSpan={8} sx={{ backgroundColor: '#f5f5f5' }}>
                                                        <Typography variant="body2">
                                                            <strong>Публичная ссылка:</strong>{' '}
                                                            <a href={agent.public_url} target="_blank" rel="noopener noreferrer">
                                                                {agent.public_url}
                                                            </a>
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8}>Нет агентов</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
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
                        {/* Раздел: Общие настройки агента */}
                        <Typography variant="h6" sx={{ mb: 2 }}>Общие настройки</Typography>
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
                        <FormControlLabel
                            control={<Checkbox checked={enableHttpAction} onChange={(e) => setEnableHttpAction(e.target.checked)} />}
                            label="Включить HTTP-action"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={enableEmailAction} onChange={(e) => setEnableEmailAction(e.target.checked)} />}
                            label="Включить Email-action"
                        />

                        {/* Разделитель */}
                        <Divider sx={{ my: 2 }} />

                        {/* Раздел: Настройки базы знаний (необязательно) */}
                        <Typography variant="h6" sx={{ mb: 2 }}>База знаний (необязательно)</Typography>
                        <input
                            type="file"
                            accept=".pdf,.txt"
                            onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)}
                            style={{ margin: '16px 0' }}
                        />
                        <Typography variant="caption" color="textSecondary">
                            Загрузите файл (PDF или TXT) для создания базы знаний. Если файл не выбран, база знаний не будет создана.
                        </Typography>
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
                <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                    <DialogTitle>Редактировать агента</DialogTitle>
                    <DialogContent>
                        {errorMessage && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errorMessage}
                            </Alert>
                        )}
                        {editAgent && (
                            <>
                                {/* Раздел: Общие настройки агента */}
                                <Typography variant="h6" sx={{ mb: 2 }}>Общие настройки</Typography>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Имя"
                                    type="text"
                                    fullWidth
                                    value={editAgent.name}
                                    onChange={(e) => setEditAgent({ ...editAgent!, name: e.target.value })}
                                    helperText="Используйте только буквы, цифры, _ или -"
                                />
                                <TextField
                                    margin="dense"
                                    label="Инструкции"
                                    type="text"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={editAgent.instructions}
                                    onChange={(e) => setEditAgent({ ...editAgent!, instructions: e.target.value })}
                                    helperText="Минимальная длина 40 символов"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={editEnableHttpAction} onChange={(e) => setEditEnableHttpAction(e.target.checked)} />}
                                    label="Включить HTTP-action"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={editEnableEmailAction} onChange={(e) => setEditEnableEmailAction(e.target.checked)} />}
                                    label="Включить Email-action"
                                />

                                {/* Разделитель */}
                                <Divider sx={{ my: 2 }} />

                                {/* Раздел: Настройки базы знаний (необязательно) */}
                                <Typography variant="h6" sx={{ mb: 2 }}>База знаний (необязательно)</Typography>
                                <input
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={(e) => setEditFile(e.target.files ? e.target.files[0] : null)}
                                    style={{ margin: '16px 0' }}
                                />
                                <Typography variant="caption" color="textSecondary">
                                    Загрузите новый файл (PDF или TXT) для обновления базы знаний. Если файл не выбран, текущая база знаний останется без изменений.
                                </Typography>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditDialog} color="primary">
                            Отмена
                        </Button>
                        <Button onClick={handleEditAgent} color="primary">
                            Сохранить
                        </Button>
                    </DialogActions>
                </Dialog>
                <Drawer
                    anchor="right"
                    open={chatOpen}
                    onClose={() => setChatOpen(false)}
                    sx={{ '& .MuiDrawer-paper': { width: '35vw', maxWidth: '80vw' } }}
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
            </Container>
        </Box>
    );
};

export default App;