import React, { useState, useEffect, useRef } from 'react';
import { GlobalStyles } from '@mui/material';
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
    useMediaQuery,
    useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Auth from './components/Auth';
import {
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
    // States
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
    const [newFile, setNewFile] = useState<File | null>(null);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [chatMessages, setChatMessages] = useState<MessageModel[]>([]);
    const [sessionIds, setSessionIds] = useState<Record<string, string>>({});
    const [initialKnowledgeBaseFile, setInitialKnowledgeBaseFile] = useState<string | null>(null);
    const [deleteKnowledgeBase, setDeleteKnowledgeBase] = useState(false);
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const messageListRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLDivElement | null>(null);
    const newFileInputRef = useRef<HTMLInputElement | null>(null);
    const editFileInputRef = useRef<HTMLInputElement | null>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
    const [messageListHeight, setMessageListHeight] = useState<number>(0);

    useEffect(() => {
        if (!chatOpen) {
            setMessageListHeight(0);
            return;
        }

        const viewportH = viewportHeight;
        const headerHeight = 48;
        const inputHeight = 56;
        const bottomOffset = deviceType === 'mobile' ? keyboardOffset : 0;
        const availableHeight = viewportH - headerHeight - inputHeight - bottomOffset;
        setMessageListHeight(availableHeight > 0 ? availableHeight : 0);
    }, [viewportHeight, keyboardOffset, deviceType, chatOpen]);

    // Update keyboard offset
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

    // Prevent background scrolling when chat is open
    useEffect(() => {
        if (chatOpen && (deviceType === 'mobile' || deviceType === 'tablet')) {
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
    }, [chatOpen, deviceType]);

    // Update viewport height
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

    // Auto-scroll messages to bottom
    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [chatMessages]);

    // Networking and agent logic
    const fetchAgentStatus = async (agentId: string): Promise<string> => {
        const token = await getAuthToken();
        const user_id = user?.id;
        if (!user_id) throw new Error('user_id missing');
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
                    console.error('Error loading agents:', error);
                    setErrorMessage('Error loading agents');
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
            console.error('Error receiving agents:', error);
            setErrorMessage('Error receiving agents');
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
            setErrorMessage('Name and instructions (min. 40 characters) are required');
            return;
        }

        const sanitizedName = newAgent.name.replace(/[^a-zA-Z0-9_-]/g, '');
        if (!sanitizedName) {
            setErrorMessage('Invalid agent name');
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
            if (!createdAgentId) throw new Error('agentId not received from response');

            const waitForPrepared = async (agentId: string) => {
                for (let i = 0; i < 20; i++) {
                    const status = await fetchAgentStatus(agentId);
                    if (status === 'PREPARED') return true;
                    await new Promise((resolve) => setTimeout(resolve, 4000));
                }
                return false;
            };

            const isPrepared = await waitForPrepared(createdAgentId);
            if (!isPrepared) throw new Error('Agent status did not become PREPARED');

            await fetchAgents();
            setLoadingAgentId(null);
            handleCloseAddDialog();
        } catch (error: any) {
            console.error('Error creating agent:', error);
            setErrorMessage(`Error creating agent: ${error.message || 'Unknown error'}`);
            setLoadingAgentId(null);
        }
    };

    const createAlias = async (agentId: string, agentName: string) => {
        setLoadingAgentId(agentId);
        const token = await getAuthToken();
        try {
            if (!user?.id) throw new Error('user_id missing');
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/create-alias`,
                { agentId, agentName, user_id: user.id },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            await fetchAgents();
            setLoadingAgentId(null);
        } catch (error: any) {
            console.error('Error creating alias:', error);
            setErrorMessage(`Error creating alias: ${error.message || 'Unknown error'}`);
            setLoadingAgentId(null);
        }
    };

    const handleOpenEditDialog = (agent: Agent) => {
        setEditAgent(agent);
        setEditEnableHttpAction(agent.enableHttpAction || false);
        setEditEnableEmailAction(agent.enableEmailAction || false);
        setEditFile(null);
        setDeleteKnowledgeBase(false);
        setInitialKnowledgeBaseFile(agent.knowledge_base_id ? 'A knowledge base file was previously uploaded' : null);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditAgent(null);
        setErrorMessage(null);
        setEditEnableHttpAction(false);
        setEditEnableEmailAction(false);
        setEditFile(null);
        setDeleteKnowledgeBase(false);
        setInitialKnowledgeBaseFile(null);
    };

    const handleEditAgent = async () => {
        if (!editAgent || !editAgent.id || !editAgent.agent_id || !editAgent.name.trim() || !editAgent.instructions.trim() || editAgent.instructions.length < 40) {
            setErrorMessage('Name and instructions (min. 40 characters) are required');
            return;
        }

        const sanitizedName = editAgent.name.replace(/[^a-zA-Z0-9_-]/g, '');
        if (!sanitizedName) {
            setErrorMessage('Invalid agent name');
            return;
        }

        setLoadingAgentId(editAgent.id);
        const token = await getAuthToken();

        try {
            const fileData = editFile ? await convertFileToBase64(editFile) : null;
            if (deleteKnowledgeBase && fileData) {
                setErrorMessage('You cannot select a new file when deleting the knowledge base.');
                setLoadingAgentId(null);
                return;
            }

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
                    deleteKnowledgeBase: deleteKnowledgeBase,
                }),
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            await fetchAgents();
            setLoadingAgentId(null);
            handleCloseEditDialog();
        } catch (error: any) {
            console.error('Error updating agent:', error);
            setErrorMessage(`Error updating agent: ${error.message || 'Unknown error'}`);
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
        setChatMessages((prev) => [...prev, newMessage]);
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
            console.error('Error sending message:', error);
            const errorMessage: MessageModel = { message: `Error: ${error.message || 'Unknown error'}`, sentTime: new Date().toISOString(), sender: 'bot', direction: 'incoming', position: 'single' };
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
            alert(`Public URL: ${publicUrl}\nAPI Key: ${apkKey}\nCopy and use it for access!`);
        } catch (error: any) {
            console.error('Error deploying chat:', error);
            setErrorMessage(`Error deploying chat: ${error.message || 'Unknown error'}`);
        } finally {
            setLoadingAgentId(null);
        }
    };

    const revokeChat = async (agent: Agent) => {
        setLoadingAgentId(agent.id);
        try {
            const token = await getAuthToken();
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/revoke-chat`,
                { agentId: agent.agent_id, user_id: user?.id },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setAgents(agents.map(a => a.id === agent.id ? { ...a, public_url: undefined } : a));
            await fetchAgents();
        } catch (error: any) {
            console.error('Error revoking chat:', error);
            setErrorMessage(`Error revoking chat: ${error.message || 'Unknown error'}`);
        } finally {
            setLoadingAgentId(null);
        }
    };

    return (
        <>
            <GlobalStyles styles={{
                'html, body': {
                    overflowX: 'hidden',
                    width: '100%',
                    maxWidth: '100%',
                },
                '#root': {
                    overflowX: 'hidden',
                    width: '100%',
                    maxWidth: '100%',
                }
            }}/>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    backgroundColor: '#fff',
                }}
            >
                <AppBar position="fixed" sx={{ width: '100%' }}>
                    <Toolbar>
                        {user && (
                            <IconButton color="inherit" onClick={toggleDrawer} edge="start" sx={{ mr: 2 }}>
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Typography variant="h6" sx={{
                            flexGrow: 1,
                            fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.125rem' : '1.25rem',
                            textAlign: 'left'
                        }}>
                            My Agents
                        </Typography>
                        {user && (
                            <Button color="inherit" onClick={handleSignOut}
                                    sx={{ fontSize: deviceType === 'mobile' ? '0.8rem' : deviceType === 'tablet' ? '0.85rem' : '0.9rem' }}>
                                Sign Out
                            </Button>
                        )}
                    </Toolbar>
                </AppBar>

                <Drawer open={drawerOpen} onClose={toggleDrawer} sx={{
                    '& .MuiDrawer-paper': {
                        width: deviceType === 'mobile' ? '70vw' : deviceType === 'tablet' ? '50vw' : 250,
                        boxSizing: 'border-box'
                    }
                }}>
                    <List>
                        <ListItem component="button" onClick={handleOpenAddDialog}>
                            <ListItemText primary="Add Agent" sx={{ textAlign: 'left' }} />
                        </ListItem>
                        <ListItem component="button" onClick={toggleDrawer}>
                            <ListItemText primary="Close" sx={{ textAlign: 'left' }} />
                        </ListItem>
                    </List>
                </Drawer>

                <Container sx={{
                    mt: 10,
                    flex: 1,
                    maxWidth: deviceType === 'mobile' ? '100% !important' : deviceType === 'tablet' ? '90% !important' : '80% !important',
                    px: deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 2 : 3,
                    boxSizing: 'border-box',
                    overflowX: 'hidden',
                }}>
                    {!user ? (
                        <Auth onAuthChange={setUser} onSignOut={handleSignOut} />
                    ) : (
                        <Box sx={{
                            mt: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 3 : 4,
                            width: '100%',
                            overflowX: 'hidden'
                        }}>
                            <Typography variant={deviceType === 'mobile' ? 'h6' : deviceType === 'tablet' ? 'h5' : 'h5'}
                                        sx={{ textAlign: 'left' }}>
                                Your Agents
                            </Typography>
                            {errorMessage && (
                                <Alert severity="error" sx={{
                                    mb: 2,
                                    width: '100%',
                                    fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                    textAlign: 'left'
                                }}>
                                    {errorMessage}
                                </Alert>
                            )}
                            <Box sx={{ width: '100%', overflowX: 'hidden' }}>
                                <Table sx={{
                                    width: '100%',
                                    tableLayout: 'fixed',
                                    wordBreak: 'break-word',
                                    overflowX: 'hidden'
                                }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{
                                                fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                width: deviceType === 'mobile' ? '100%' : '80%',
                                                textAlign: 'left'
                                            }}>
                                                Agent
                                            </TableCell>
                                            {deviceType !== 'mobile' && (
                                                <TableCell sx={{
                                                    fontSize: deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                    width: '20%',
                                                    textAlign: 'center'
                                                }}>
                                                    Actions
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {agents.length > 0 ? (
                                            agents.map((agent) => (
                                                <React.Fragment key={agent.id}>
                                                    <TableRow>
                                                        <TableCell sx={{
                                                            fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                            py: 1,
                                                            verticalAlign: 'top',
                                                            textAlign: 'left'
                                                        }}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: deviceType === 'mobile' ? 'column' : 'row',
                                                                gap: deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 1.5 : 2,
                                                                alignItems: deviceType === 'mobile' ? 'flex-start' : 'flex-start'
                                                            }}>
                                                                <Box sx={{
                                                                    flex: 1,
                                                                    width: deviceType === 'mobile' ? '100%' : '80%'
                                                                }}>
                                                                    <Typography sx={{
                                                                        fontWeight: 'bold',
                                                                        fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.125rem' : '1.25rem',
                                                                        textAlign: 'left'
                                                                    }}>
                                                                        {agent.name}
                                                                    </Typography>
                                                                    <Typography sx={{
                                                                        fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                        color: 'text.secondary',
                                                                        mt: 0.5,
                                                                        wordBreak: 'break-word',
                                                                        textAlign: 'left'
                                                                    }}>
                                                                        {agent.instructions}
                                                                    </Typography>
                                                                    <Typography sx={{
                                                                        fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                        color: 'text.secondary',
                                                                        mt: 0.5,
                                                                        textAlign: 'left'
                                                                    }}>
                                                                        <strong>Monthly Calls:</strong> {agent.call_count || 0}
                                                                    </Typography>
                                                                    <Typography sx={{
                                                                        fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                        color: 'text.secondary',
                                                                        mt: 0.5,
                                                                        textAlign: 'left'
                                                                    }}>
                                                                        <strong>Yearly Calls:</strong> {agent.call_count_year || 0}
                                                                    </Typography>
                                                                </Box>
                                                                {deviceType === 'mobile' && (
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'row',
                                                                        gap: deviceType === 'mobile' ? 1 : 1.5,
                                                                        mt: 1,
                                                                        flexWrap: 'wrap',
                                                                        justifyContent: 'flex-start'
                                                                    }}>
                                                                        {loadingAgentId === agent.agent_id || loadingAgentId === 'new-agent' ? (
                                                                            <CircularProgress size={20} />
                                                                        ) : (
                                                                            <>
                                                                                {!agent.alias_id && agent.status === 'PREPARED' && (
                                                                                    <Button
                                                                                        variant="contained"
                                                                                        color="primary"
                                                                                        onClick={() => createAlias(agent.agent_id, agent.name)}
                                                                                        sx={{
                                                                                            fontSize: deviceType === 'mobile' ? '0.8rem' : '0.85rem',
                                                                                            px: deviceType === 'mobile' ? 1 : 1.5,
                                                                                            py: deviceType === 'mobile' ? 0.5 : 0.75,
                                                                                            minWidth: 80,
                                                                                            height: 32
                                                                                        }}
                                                                                    >
                                                                                        Create Alias
                                                                                    </Button>
                                                                                )}
                                                                                {agent.agent_id && agent.alias_id && (
                                                                                    <>
                                                                                        <Button
                                                                                            variant="contained"
                                                                                            color="primary"
                                                                                            onClick={() => handleOpenChat(agent)}
                                                                                            sx={{
                                                                                                fontSize: deviceType === 'mobile' ? '0.8rem' : '0.85rem',
                                                                                                px: deviceType === 'mobile' ? 1 : 1.5,
                                                                                                py: deviceType === 'mobile' ? 0.5 : 0.75,
                                                                                                minWidth: 80,
                                                                                                height: 32
                                                                                            }}
                                                                                        >
                                                                                            Chat
                                                                                        </Button>
                                                                                        {!agent.public_url ? (
                                                                                            <Button
                                                                                                variant="contained"
                                                                                                color="secondary"
                                                                                                onClick={() => deployChat(agent)}
                                                                                                sx={{
                                                                                                    fontSize: deviceType === 'mobile' ? '0.8rem' : '0.85rem',
                                                                                                    px: deviceType === 'mobile' ? 1 : 1.5,
                                                                                                    py: deviceType === 'mobile' ? 0.5 : 0.75,
                                                                                                    minWidth: 80,
                                                                                                    height: 32
                                                                                                }}
                                                                                            >
                                                                                                Deploy
                                                                                            </Button>
                                                                                        ) : (
                                                                                            <Button
                                                                                                variant="contained"
                                                                                                color="error"
                                                                                                onClick={() => revokeChat(agent)}
                                                                                                sx={{
                                                                                                    fontSize: deviceType === 'mobile' ? '0.8rem' : '0.85rem',
                                                                                                    px: deviceType === 'mobile' ? 1 : 1.5,
                                                                                                    py: deviceType === 'mobile' ? 0.5 : 0.75,
                                                                                                    minWidth: 80,
                                                                                                    height: 32
                                                                                                }}
                                                                                            >
                                                                                                Revoke
                                                                                            </Button>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                                {agent.alias_id && (
                                                                                    <Button
                                                                                        variant="contained"
                                                                                        color="warning"
                                                                                        onClick={() => handleOpenEditDialog(agent)}
                                                                                        sx={{
                                                                                            fontSize: deviceType === 'mobile' ? '0.8rem' : '0.8rem',
                                                                                            px: deviceType === 'mobile' ? 1 : 1.5,
                                                                                            py: deviceType === 'mobile' ? 0.5 : 0.75,
                                                                                            minWidth: 80,
                                                                                            height: 32
                                                                                        }}
                                                                                    >
                                                                                        Edit
                                                                                    </Button>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        {deviceType !== 'mobile' && (
                                                            <TableCell sx={{
                                                                fontSize: deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                py: 1,
                                                                verticalAlign: 'top',
                                                                textAlign: 'center'
                                                            }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: deviceType === 'tablet' ? 1.25 : 1.5,
                                                                    alignItems: 'center'
                                                                }}>
                                                                    {loadingAgentId === agent.agent_id || loadingAgentId === 'new-agent' ? (
                                                                        <CircularProgress size={24} />
                                                                    ) : (
                                                                        <>
                                                                            {!agent.alias_id && agent.status === 'PREPARED' && (
                                                                                <Button
                                                                                    variant="contained"
                                                                                    color="primary"
                                                                                    onClick={() => createAlias(agent.agent_id, agent.name)}
                                                                                    sx={{
                                                                                        fontSize: deviceType === 'tablet' ? '0.85rem' : '0.9rem',
                                                                                        px: deviceType === 'tablet' ? 1.5 : 2,
                                                                                        py: deviceType === 'tablet' ? 0.75 : 1,
                                                                                        width: deviceType === 'tablet' ? 140 : 160
                                                                                    }}
                                                                                >
                                                                                    Create Alias
                                                                                </Button>
                                                                            )}
                                                                            {agent.agent_id && agent.alias_id && (
                                                                                <>
                                                                                    <Button
                                                                                        variant="contained"
                                                                                        color="primary"
                                                                                        onClick={() => handleOpenChat(agent)}
                                                                                        sx={{
                                                                                            fontSize: deviceType === 'tablet' ? '0.85rem' : '0.9rem',
                                                                                            px: deviceType === 'tablet' ? 1.5 : 2,
                                                                                            py: deviceType === 'tablet' ? 0.75 : 1,
                                                                                            width: deviceType === 'tablet' ? 140 : 160
                                                                                        }}
                                                                                    >
                                                                                        Chat
                                                                                    </Button>
                                                                                    {!agent.public_url ? (
                                                                                        <Button
                                                                                            variant="contained"
                                                                                            color="secondary"
                                                                                            onClick={() => deployChat(agent)}
                                                                                            sx={{
                                                                                                fontSize: deviceType === 'tablet' ? '0.85rem' : '0.9rem',
                                                                                                px: deviceType === 'tablet' ? 1.5 : 2,
                                                                                                py: deviceType === 'tablet' ? 0.75 : 1,
                                                                                                width: deviceType === 'tablet' ? 140 : 160
                                                                                            }}
                                                                                        >
                                                                                            Deploy
                                                                                        </Button>
                                                                                    ) : (
                                                                                        <Button
                                                                                            variant="contained"
                                                                                            color="error"
                                                                                            onClick={() => revokeChat(agent)}
                                                                                            sx={{
                                                                                                fontSize: deviceType === 'tablet' ? '0.85rem' : '0.9rem',
                                                                                                px: deviceType === 'tablet' ? 1.5 : 2,
                                                                                                py: deviceType === 'tablet' ? 0.75 : 1,
                                                                                                width: deviceType === 'tablet' ? 140 : 160
                                                                                            }}
                                                                                        >
                                                                                            Revoke
                                                                                        </Button>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                            {agent.alias_id && (
                                                                                <Button
                                                                                    variant="contained"
                                                                                    color="warning"
                                                                                    onClick={() => handleOpenEditDialog(agent)}
                                                                                    sx={{
                                                                                        fontSize: deviceType === 'tablet' ? '0.85rem' : '0.9rem',
                                                                                        px: deviceType === 'tablet' ? 1.5 : 2,
                                                                                        py: deviceType === 'tablet' ? 0.75 : 1,
                                                                                        width: deviceType === 'tablet' ? 140 : 160
                                                                                    }}
                                                                                >
                                                                                    Edit
                                                                                </Button>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                    {agent.public_url && (
                                                        <TableRow>
                                                            <TableCell colSpan={deviceType === 'mobile' ? 1 : 2} sx={{
                                                                backgroundColor: '#f5f5f5',
                                                                fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                py: 1,
                                                                wordBreak: 'break-word',
                                                                textAlign: 'left'
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                    textAlign: 'left'
                                                                }}>
                                                                    <strong>Public URL:</strong>{' '}
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
                                                <TableCell colSpan={deviceType === 'mobile' ? 1 : 2} sx={{ textAlign: 'left' }}>
                                                    No agents available
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Box>
                    )}

                    <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth={deviceType === 'mobile' ? 'xs' : 'sm'}>
                        <DialogTitle sx={{
                            fontSize: deviceType === 'mobile' ? '1.25rem' : deviceType === 'tablet' ? '1.375rem' : '1.25rem',
                            textAlign: 'left'
                        }}>
                            Add New Agent
                        </DialogTitle>
                        <DialogContent sx={{ textAlign: 'left', overflowX: 'hidden' }}>
                            {errorMessage && (
                                <Alert severity="error" sx={{
                                    mb: 2,
                                    width: '100%',
                                    fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                    textAlign: 'left'
                                }}>
                                    {errorMessage}
                                </Alert>
                            )}
                            <Typography variant="h6" sx={{
                                mb: 2,
                                fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.1rem',
                                textAlign: 'left'
                            }}>
                                General Settings
                            </Typography>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Name"
                                type="text"
                                fullWidth
                                value={newAgent.name}
                                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                                helperText="Use only letters, numbers, underscores, or hyphens"
                                sx={{
                                    mb: 2,
                                    '& .MuiInputBase-input': {
                                        fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                        textAlign: 'left'
                                    }
                                }}
                            />
                            <TextField
                                margin="dense"
                                label="Instructions"
                                type="text"
                                fullWidth
                                multiline
                                rows={deviceType === 'mobile' ? 3 : 4}
                                value={newAgent.instructions}
                                onChange={(e) => setNewAgent({ ...newAgent, instructions: e.target.value })}
                                helperText="Minimum length is 40 characters"
                                sx={{
                                    mb: 2,
                                    '& .MuiInputBase-input': {
                                        fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                        textAlign: 'left'
                                    }
                                }}
                            />
                            <Box sx={{
                                display: 'flex',
                                flexDirection: deviceType === 'mobile' ? 'column' : 'row',
                                gap: deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 1.5 : 2,
                                mb: 2,
                                justifyContent: 'flex-start'
                            }}>
                                <FormControlLabel
                                    control={<Checkbox checked={enableHttpAction} onChange={(e) => setEnableHttpAction(e.target.checked)} />}
                                    label="Enable HTTP Action"
                                    sx={{ '& .MuiTypography-root': { fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' } }}
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={enableEmailAction} onChange={(e) => setEnableEmailAction(e.target.checked)} />}
                                    label="Enable Email Action"
                                    sx={{ '& .MuiTypography-root': { fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' } }}
                                />
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" sx={{
                                mb: 2,
                                fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.1rem',
                                textAlign: 'left'
                            }}>
                                Knowledge Base (Optional)
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{
                                        fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        padding: deviceType === 'mobile' ? '8px 12px' : '10px 14px',
                                    }}
                                >
                                    Select File
                                    <input
                                        type="file"
                                        accept=".pdf,.txt"
                                        hidden
                                        ref={newFileInputRef}
                                        onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)}
                                    />
                                </Button>
                                {newFile && (
                                    <Typography variant="caption" sx={{
                                        mt: 1,
                                        display: 'block',
                                        fontSize: deviceType === 'mobile' ? '0.8rem' : deviceType === 'tablet' ? '0.85rem' : '0.8rem',
                                        textAlign: 'left'
                                    }}>
                                        Selected: {newFile.name}
                                    </Typography>
                                )}
                            </Box>
                            <Typography variant="caption" color="textSecondary" sx={{
                                fontSize: deviceType === 'mobile' ? '0.8rem' : deviceType === 'tablet' ? '0.85rem' : '0.8rem',
                                textAlign: 'left'
                            }}>
                                Upload a PDF or TXT file to create a knowledge base. If no file is selected, no knowledge base will be created.
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'center' }}>
                            <Button onClick={handleCloseAddDialog} color="primary"
                                    sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddAgent} color="primary"
                                    sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}>
                                Create
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth={deviceType === 'mobile' ? 'xs' : 'sm'}>
                        <DialogTitle sx={{
                            fontSize: deviceType === 'mobile' ? '1.25rem' : deviceType === 'tablet' ? '1.375rem' : '1.25rem',
                            textAlign: 'left'
                        }}>
                            Edit Agent
                        </DialogTitle>
                        <DialogContent sx={{ textAlign: 'left', overflowX: 'hidden' }}>
                            {errorMessage && (
                                <Alert severity="error" sx={{
                                    mb: 2,
                                    width: '100%',
                                    fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                    textAlign: 'left'
                                }}>
                                    {errorMessage}
                                </Alert>
                            )}
                            {editAgent && (
                                <>
                                    <Typography variant="h6" sx={{
                                        mb: 2,
                                        fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.1rem',
                                        textAlign: 'left'
                                    }}>
                                        General Settings
                                    </Typography>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        label="Name"
                                        type="text"
                                        fullWidth
                                        value={editAgent.name}
                                        onChange={(e) => setEditAgent({ ...editAgent, name: e.target.value })}
                                        helperText="Use only letters, numbers, underscores, or hyphens"
                                        sx={{
                                            mb: 2,
                                            '& .MuiInputBase-input': {
                                                fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                                textAlign: 'left'
                                            }
                                        }}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Instructions"
                                        type="text"
                                        fullWidth
                                        multiline
                                        rows={deviceType === 'mobile' ? 3 : 4}
                                        value={editAgent.instructions}
                                        onChange={(e) => setEditAgent({ ...editAgent, instructions: e.target.value })}
                                        helperText="Minimum length is 40 characters"
                                        sx={{
                                            mb: 2,
                                            '& .MuiInputBase-input': {
                                                fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                                textAlign: 'left'
                                            }
                                        }}
                                    />
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: deviceType === 'mobile' ? 'column' : 'row',
                                        gap: deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 1.5 : 2,
                                        mb: 2,
                                        justifyContent: 'flex-start'
                                    }}>
                                        <FormControlLabel
                                            control={<Checkbox checked={editEnableHttpAction} onChange={(e) => setEditEnableHttpAction(e.target.checked)} />}
                                            label="Enable HTTP Action"
                                            sx={{ '& .MuiTypography-root': { fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' } }}
                                        />
                                        <FormControlLabel
                                            control={<Checkbox checked={editEnableEmailAction} onChange={(e) => setEditEnableEmailAction(e.target.checked)} />}
                                            label="Enable Email Action"
                                            sx={{ '& .MuiTypography-root': { fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' } }}
                                        />
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" sx={{
                                        mb: 2,
                                        fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.1rem',
                                        textAlign: 'left'
                                    }}>
                                        Knowledge Base (Optional)
                                    </Typography>
                                    {initialKnowledgeBaseFile && (
                                        <Alert severity="info" sx={{
                                            mb: 2,
                                            width: '100%',
                                            fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                            textAlign: 'left'
                                        }}>
                                            {initialKnowledgeBaseFile}. You can upload a new file to update or leave it unchanged.
                                        </Alert>
                                    )}
                                    <FormControlLabel
                                        control={<Checkbox checked={deleteKnowledgeBase} onChange={(e) => {
                                            setDeleteKnowledgeBase(e.target.checked);
                                            if (e.target.checked) setEditFile(null);
                                        }} />}
                                        label="Delete Knowledge Base"
                                        sx={{ '& .MuiTypography-root': { fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' } }}
                                    />
                                    {!deleteKnowledgeBase && (
                                        <Box sx={{ mt: 2, mb: 2 }}>
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                disabled={deleteKnowledgeBase}
                                                sx={{
                                                    fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                                    textTransform: 'none',
                                                    borderRadius: '8px',
                                                    padding: deviceType === 'mobile' ? '8px 12px' : '10px 14px',
                                                }}
                                            >
                                                Select File
                                                <input
                                                    type="file"
                                                    accept=".pdf,.txt"
                                                    hidden
                                                    ref={editFileInputRef}
                                                    onChange={(e) => setEditFile(e.target.files ? e.target.files[0] : null)}
                                                    disabled={deleteKnowledgeBase}
                                                />
                                            </Button>
                                            {editFile && (
                                                <Typography variant="caption" sx={{
                                                    mt: 1,
                                                    display: 'block',
                                                    fontSize: deviceType === 'mobile' ? '0.8rem' : deviceType === 'tablet' ? '0.85rem' : '0.8rem',
                                                    textAlign: 'left'
                                                }}>
                                                    Selected: {editFile.name}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                    <Typography variant="caption" color="textSecondary" sx={{
                                        fontSize: deviceType === 'mobile' ? '0.8rem' : deviceType === 'tablet' ? '0.85rem' : '0.8rem',
                                        textAlign: 'left'
                                    }}>
                                        {deleteKnowledgeBase
                                            ? 'Knowledge base deletion selected. No file can be uploaded.'
                                            : 'Upload a new PDF or TXT file to update the knowledge base. If no file is selected, the current knowledge base will remain unchanged.'}
                                    </Typography>
                                </>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'center' }}>
                            <Button onClick={handleCloseEditDialog} color="primary"
                                    sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}>
                                Cancel
                            </Button>
                            <Button onClick={handleEditAgent} color="primary"
                                    sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}>
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {chatOpen && selectedAgent && (
                        <>
                            <Box
                                sx={{
                                    display: { xs: 'none', md: 'block' },
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    overscrollBehavior: 'contain',
                                    touchAction: 'none',
                                    overflow: 'hidden',
                                    WebkitOverflowScrolling: 'touch',
                                    zIndex: 1300,
                                }}
                                onClick={() => setChatOpen(false)}
                            />
                            <Box
                                role="dialog"
                                aria-label={`Chat with ${selectedAgent?.name}`}
                                sx={{
                                    position: 'fixed',
                                    zIndex: 1400,
                                    bottom: 0,
                                    right: 0,
                                    top: 'auto',
                                    width: { xs: '100vw', md: '36vw' },
                                    maxWidth: { md: 800 },
                                    height: {
                                        xs: `${viewportHeight}px`,
                                        md: '100vh',
                                    },
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
                                <Box
                                    sx={{
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: deviceType === 'mobile' ? 1 : 2,
                                        borderBottom: 1,
                                        borderColor: 'grey.300',
                                        overscrollBehavior: 'contain',
                                        touchAction: 'none',
                                    }}
                                >
                                    <IconButton onClick={() => setChatOpen(false)} sx={{ mr: 1 }}>
                                        <CloseIcon />
                                    </IconButton>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontSize:
                                                deviceType === 'mobile'
                                                    ? '1rem'
                                                    : deviceType === 'tablet'
                                                        ? '1.125rem'
                                                        : '1.25rem',
                                            flexGrow: 1,
                                            textAlign: 'left',
                                        }}
                                    >
                                        Chat with {selectedAgent.name}
                                    </Typography>
                                </Box>
                                <MessageList
                                    ref={messageListRef}
                                    style={{
                                        height: messageListHeight > 0 ? messageListHeight : 0,
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                        padding: deviceType === 'mobile' ? '8px' : '10px',
                                        paddingBottom: keyboardOffset > 0 ? `${keyboardOffset}px` : '0px',
                                        WebkitTextSizeAdjust: '100%',
                                        touchAction: 'pan-y',
                                        overscrollBehavior: 'none',
                                    }}
                                >
                                    {chatMessages.map((msg, index) => (
                                        <Message key={index} model={msg} />
                                    ))}
                                </MessageList>
                                <Box
                                    sx={{
                                        flexShrink: 0,
                                        background: '#fff',
                                        borderTop: 1,
                                        borderColor: 'grey.200',
                                        padding: deviceType === 'mobile' ? '8px env(safe-area-inset-right, 8px) 8px env(safe-area-inset-left, 8px)' : '10px',
                                        paddingBottom: deviceType === 'mobile' ? 'env(safe-area-inset-bottom, 12px)' : '12px',
                                        transition: 'none',
                                        zIndex: 1500,
                                        overscrollBehavior: 'contain',
                                        touchAction: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    <MessageInput
                                        ref={inputRef}
                                        placeholder="Type your message..."
                                        onSend={sendChatMessage}
                                        attachButton={false}
                                        onFocus={() => {
                                            if (inputRef.current) {
                                                const textarea = inputRef.current.querySelector('textarea');
                                                if (textarea) {
                                                    textarea.style.fontSize = '16px';
                                                    textarea.style.padding = deviceType === 'mobile' ? '8px 12px' : '10px 14px';
                                                }
                                                setTimeout(() => {
                                                    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                                                }, 100);
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            fontSize: '16px',
                                            WebkitTextSizeAdjust: '100% !important',
                                            textSizeAdjust: '100% !important',
                                            touchAction: 'manipulation',
                                            lineHeight: '1.5',
                                            borderRadius: '8px',
                                            padding: deviceType === 'mobile' ? '8px 12px' : '10px 14px',
                                        }}
                                    />
                                </Box>
                            </Box>
                        </>
                    )}
                </Container>
            </Box>
        </>
    );
};

export default App;