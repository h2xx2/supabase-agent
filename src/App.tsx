import React, { useState, useEffect, useRef } from 'react';
import { useCookies } from 'react-cookie';
import {Accordion, AccordionSummary, AccordionDetails, GlobalStyles, Link} from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTour } from '@reactour/tour'
import {
    Typography,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
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
    Alert,
    Checkbox,
    FormControlLabel,
    Divider,
    useMediaQuery,
    useTheme,
    Select,
    MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewListIcon from '@mui/icons-material/ViewList';
import PolicyIcon from '@mui/icons-material/Policy';
import DescriptionIcon from '@mui/icons-material/Description';
import Auth from './components/Auth';
import GlobalLoader from './components/GlobalLoader';
import {
    MessageList,
    Message,
    MessageInput,
    type MessageModel,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import axios from 'axios';
import AppNavbar from './components/AppNavbar';
import Settings from './components/Settings';
import Copyright from './components/Copyright';
import PrivacyPolicy from "./components/PrivacyPolicy.tsx";
import TermsAndConditions from "./components/TermsAndConditions";
import TermsAndConditionAcceptanceDialog from "./components/TermsAndConditionAcceptanceDialog";
import AddAgentDialog from "./components/CreateAgent.tsx";

interface Agent {
    key: React.ReactNode;
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

const Page = {
    AGENTS: "My Agents",
    SETTINGS: "Settings",
    PRIVACY_POLICY: "Privacy Policy",
    TERMS_AND_CONDITIONS: "Terms and Conditions",
};

const App: React.FC = () => {
    const [cookies, , removeCookie] = useCookies(['authToken']);
    const [globalLoading, setGlobalLoading] = useState(false);
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [chatMessages, setChatMessages] = useState<MessageModel[]>([]);
    const [sessionIds, setSessionIds] = useState<Record<string, string>>({});
    const [initialKnowledgeBaseFile, setInitialKnowledgeBaseFile] = useState<string | null>(null);
    const [deleteKnowledgeBase, setDeleteKnowledgeBase] = useState(false);
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const [selectedBlueprint, setSelectedBlueprint] = useState<string>('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
    const [page, setPage] = useState<string>(Page.AGENTS);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const { currentStep, setCurrentStep } = useTour()
    const { setIsOpen } = useTour();

    const messageListRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLDivElement | null>(null);

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

    useEffect(() => {
        setIsOpen(true);
    }, [setIsOpen]);

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

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const getAuthToken = (): string => {
        const token = cookies.authToken;
        if (!token) {
            throw new Error('Токен авторизации отсутствует в куки');
        }
        return token;
    };

    const getUserIdFromToken = (token: string): string => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub;
        } catch (error) {
            console.error('Ошибка декодирования токена:', error);
            throw new Error('Невозможно извлечь user_id из токена');
        }
    };
    const [hasJumpedToAgentCard, setHasJumpedToAgentCard] = useState(false);

    useEffect(() => {
        if (agents.length > 0 && !hasJumpedToAgentCard) {
            try {
                setCurrentStep(9); // шаг "agent-card"
                setHasJumpedToAgentCard(true); // Устанавливаем флаг, чтобы не повторять
            } catch (e) {
                console.warn('Не удалось установить шаг тура:', e);
            }
        }
    }, [agents, setCurrentStep]);

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

    useEffect(() => {
        setIsTourOpen(true);
    }, []);


    const fetchAgents = async (): Promise<Agent[]> => {
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/agents`,
                { user_id: user?.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.agents || [];
        } catch (error: any) {
            console.error('Ошибка при получении агентов:', error);
            setErrorMessage(
                error.message === 'Токен авторизации отсутствует в куки'
                    ? 'Пожалуйста, войдите в систему'
                    : 'Не удалось загрузить агентов'
            );
            return [];
        }
    };

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    const handleSignOut = async () => {
        try {
            const token = cookies.authToken;
            if (token) {
                await axios.post(
                    `${import.meta.env.VITE_API_GATEWAY_URL}/signout`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            }
        } catch (error: any) {
            console.error('Ошибка при выходе:', error);
        } finally {
            setUser(null);
            setAgents([]);
            setSelectedAgent(null);
            setChatOpen(false);
            setChatMessages([]);
            setSessionIds({});
            removeCookie('authToken', { path: '/' });
        }
    };

    const handleOpenAddDialog = () => {
        console.log('handleOpenAddDialog вызван');
        setPage(Page.AGENTS);
        setOpenAddDialog(true);
        setErrorMessage(null);
        setEnableHttpAction(false);
        setEnableEmailAction(false);
        setNewFile(null);
        setSelectedBlueprint('');
        setNewAgent({ name: '', instructions: '' });
        setInitialKnowledgeBaseFile(null);
    };

    const createAlias = async (agentId: string, agentName: string) => {
        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            const user_id = getUserIdFromToken(token);
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/create-alias`,
                { agentId, agentName, user_id },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            await fetchAgents();
        } catch (error: any) {
            console.error('Ошибка при создании алиаса:', error);
            setErrorMessage(
                error.message === 'Токен авторизации отсутствует в куки'
                    ? 'Пожалуйста, войдите в систему'
                    : `Ошибка при создании алиаса: ${error.message || 'Неизвестная ошибка'}`
            );
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleOpenEditDialog = (agent: Agent) => {
        setEditAgent(agent);
        setEditEnableHttpAction(!!agent.http_action_enabled);
        setEditEnableEmailAction(!!agent.email_action_enabled);
        setEditFile(null);
        setDeleteKnowledgeBase(false);
        setInitialKnowledgeBaseFile(agent.knowledge_base_id ? 'Knowledge base file exists' : null);
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
        if (
            !editAgent ||
            !editAgent.id ||
            !editAgent.agent_id ||
            !editAgent.name.trim() ||
            !editAgent.instructions.trim() ||
            editAgent.instructions.length < 40
        ) {
            setErrorMessage('Имя и инструкции (мин. 40 символов) обязательны');
            return;
        }

        const sanitizedName = editAgent.name.replace(/[^a-zA-Z0-9_-]/g, '');
        if (!sanitizedName) {
            setErrorMessage('Недопустимое имя агента');
            return;
        }

        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            const user_id = getUserIdFromToken(token);
            const fileData = editFile ? await convertFileToBase64(editFile) : null;
            const fileName = editFile ? editFile.name : null;
            if (deleteKnowledgeBase && fileData) {
                setErrorMessage('Нельзя выбрать новый файл при удалении базы знаний');
                return;
            }

            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/update-agent`,
                JSON.stringify({
                    id: editAgent.id,
                    agent_id: editAgent.agent_id,
                    name: sanitizedName,
                    instructions: editAgent.instructions,
                    user_id,
                    enableHttpAction: editEnableHttpAction,
                    enableEmailAction: editEnableEmailAction,
                    file: fileData,
                    fileName,
                    deleteKnowledgeBase: deleteKnowledgeBase,
                }),
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            await fetchAgents();
            handleCloseEditDialog();
        } catch (error: any) {
            console.error('Ошибка при обновлении агента:', error);
            setErrorMessage(
                error.message === 'Токен авторизации отсутствует в куки'
                    ? 'Пожалуйста, войдите в систему'
                    : `Ошибка при обновлении агента: ${error.message || 'Неизвестная ошибка'}`
            );
        } finally {
            setGlobalLoading(false);
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

    const downloadKnowledgeBase = async (agent: any) => {
        if (!agent.knowledge_base_id || !agent.agent_id) return;

        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            const response = await axios.get(
                `${import.meta.env.VITE_API_GATEWAY_URL}/download-knowledge-base?knowledge_base_id=${agent.knowledge_base_id}&agent_id=${agent.agent_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const presignedUrl = response.data.url;
            if (!presignedUrl) throw new Error('Не удалось получить ссылку на файл');

            const fileResponse = await fetch(presignedUrl);
            const blob = await fileResponse.blob();
            const fileName =
                presignedUrl.split('/').pop()?.split('?')[0] || 'knowledge_base.pdf';

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Ошибка при скачивании базы знаний:', error);
            setErrorMessage('Не удалось скачать файл базы знаний');
        } finally {
            setGlobalLoading(false);
        }
    };

    const downloadBlueprintKnowledgeBase = (blueprint: Blueprint) => {
        if (!blueprint.kb_content || !blueprint.kb_filename) return;

        const blob = new Blob([blueprint.kb_content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', blueprint.kb_filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
    };

    const sendChatMessage = async (text: string) => {
        if (!text.trim() || !selectedAgent?.agent_id || !selectedAgent.alias_id) return;
        const newMessage: MessageModel = {
            message: text,
            sentTime: new Date().toISOString(),
            sender: 'user',
            direction: 'outgoing',
            position: 'single',
        };
        setChatMessages((prev) => [...prev, newMessage]);
        let sessionId = sessionIds[selectedAgent.agent_id] || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setSessionIds((prev) => ({ ...prev, [selectedAgent.agent_id]: sessionId }));
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/send`,
                {
                    message: text,
                    agentId: selectedAgent.agent_id,
                    aliasId: selectedAgent.alias_id,
                    sessionId,
                    user_id: user?.id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const botMessage: MessageModel = {
                message: response.data.response,
                sentTime: new Date().toISOString(),
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };
            setChatMessages((prev) => [...prev, botMessage]);

            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/save-message`,
                {
                    agent_id: selectedAgent.agent_id,
                    session_id: sessionId,
                    message: text,
                    sender: 'user',
                    user_id: user?.id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/save-call`,
                {
                    agent_id: selectedAgent.agent_id,
                    user_id: user?.id,
                    status: 'success',
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error: any) {
            console.error('Ошибка при отправке сообщения:', error);
            let errorMessageText = 'Ошибка: Неизвестная ошибка';
            if (error.response) {
                if (error.response.status === 403 && error.response.data.error) {
                    errorMessageText = error.response.data.error;
                } else if (error.response.data.error) {
                    errorMessageText = `Ошибка: ${error.response.data.error}`;
                } else {
                    errorMessageText = `Ошибка: ${error.response.statusText || 'Неизвестная ошибка'}`;
                }
            } else if (error.message === 'Токен авторизации отсутствует в куки') {
                errorMessageText = 'Пожалуйста, войдите в систему';
            } else {
                errorMessageText = `Ошибка: ${error.message || 'Неизвестная ошибка'}`;
            }

            const errorMessage: MessageModel = {
                message: errorMessageText,
                sentTime: new Date().toISOString(),
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };
            setChatMessages((prev) => [...prev, errorMessage]);

            try {
                const token = getAuthToken();
                await axios.post(
                    `${import.meta.env.VITE_API_GATEWAY_URL}/save-call`,
                    {
                        agent_id: selectedAgent.agent_id,
                        user_id: user?.id,
                        status: 'failure',
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (saveError) {
                console.error('Ошибка при сохранении вызова:', saveError);
            }
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

    const deployChat = async (agent: Agent) => {
        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/deploy-chat`,
                { agentId: agent.agent_id, user_id: user?.id },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            const { publicUrl, apkKey } = response.data;
            setAgents(agents.map((a) => (a.id === agent.id ? { ...a, public_url: publicUrl } : a)));
            alert(`Публичная URL: ${publicUrl}\nAPK Key: ${apkKey}\nСкопируйте и используйте для доступа!`);
        } catch (error: any) {
            console.error('Ошибка при деплое чата:', error);
            setErrorMessage(
                error.message === 'Токен авторизации отсутствует в куки'
                    ? 'Пожалуйста, войдите в систему'
                    : `Ошибка при деплое чата: ${error.message || 'Неизвестная ошибка'}`
            );
        } finally {
            setGlobalLoading(false);
        }
    };

    const revokeChat = async (agent: Agent) => {
        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/revoke-chat`,
                { agentId: agent.agent_id, user_id: user?.id },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setAgents(agents.map((a) => (a.id === agent.id ? { ...a, public_url: undefined } : a)));
            await fetchAgents();
        } catch (error: any) {
            console.error('Ошибка при revoke чата:', error);
            setErrorMessage(
                error.message === 'Токен авторизации отсутствует в куки'
                    ? 'Пожалуйста, войдите в систему'
                    : `Ошибка при revoke чата: ${error.message || 'Неизвестная ошибка'}`
            );
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleOpenDeleteDialog = (agent: Agent) => {
        setAgentToDelete(agent);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setAgentToDelete(null);
    };

    const handleDeleteAgent = async () => {
        if (!agentToDelete?.agent_id || !agentToDelete.id || !user?.id) {
            setErrorMessage('Невозможно удалить агента: отсутствуют необходимые данные');
            handleCloseDeleteDialog();
            return;
        }

        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/delete-agent`,
                JSON.stringify({
                    agentId: agentToDelete.agent_id,
                    user_id: user.id,
                }),
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            setAgents(agents.filter((a) => a.id !== agentToDelete.id));
            handleCloseDeleteDialog();
        } catch (error: any) {
            console.error('Ошибка при удалении агента:', error);
            setErrorMessage(
                error.message === 'Токен авторизации отсутствует в куки'
                    ? 'Пожалуйста, войдите в систему'
                    : `Ошибка при удалении агента: ${error.message || 'Неизвестная ошибка'}`
            );
        } finally {
            setGlobalLoading(false);
        }
    };

    const pageContent = (page: any) => {
        switch(page) {
            case Page.AGENTS: return (
                <Box
                    sx={{
                        mt: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 3 : 4,
                        width: '100%',
                        overflowX: 'hidden',
                    }}
                >
                    {errorMessage && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2,
                                width: '100%',
                                fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                textAlign: 'left',
                            }}
                        >
                            {errorMessage}
                        </Alert>
                    )}
                    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
                        <Table
                            sx={{
                                width: '100%',
                                tableLayout: 'fixed',
                                wordBreak: 'break-word',
                                overflowX: 'hidden',
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            fontWeight: 'bold',
                                            color: 'grey',
                                            fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                            width: deviceType === 'mobile' ? '100%' : '80%',
                                            textAlign: 'left',
                                        }}
                                    >
                                        Agent
                                    </TableCell>
                                    {deviceType !== 'mobile' && (
                                        <TableCell
                                            sx={{
                                                fontWeight: 'bold',
                                                color: 'grey',
                                                fontSize: deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                width: '20%',
                                                textAlign: 'center',
                                            }}
                                        >
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
                                                <TableCell
                                                    sx={{
                                                        fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                        py: 1,
                                                        verticalAlign: 'top',
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: deviceType === 'mobile' ? 'column' : 'row',
                                                            gap: deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 1.5 : 2,
                                                            alignItems: deviceType === 'mobile' ? 'flex-start' : 'flex-start',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                flex: 1,
                                                                width: deviceType === 'mobile' ? '100%' : '80%',
                                                            }}
                                                            data-tour="agent-card"
                                                        >
                                                            <Typography
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.125rem' : '1.25rem',
                                                                    textAlign: 'left',
                                                                }}
                                                            >
                                                                {agent.name}
                                                            </Typography>
                                                            <Typography
                                                                sx={{
                                                                    fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                    color: 'text.secondary',
                                                                    mt: 0.5,
                                                                    wordBreak: 'break-word',
                                                                    textAlign: 'left',
                                                                }}
                                                            >
                                                                {agent.instructions}
                                                            </Typography>
                                                            {agent.knowledge_base_id && (
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                        color: 'text.secondary',
                                                                        mt: 0.5,
                                                                        textAlign: 'left',
                                                                    }}
                                                                >
                                                                    <strong>Knowledge Base File:</strong>{' '}
                                                                    <a
                                                                        href="#"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            downloadKnowledgeBase(agent);
                                                                        }}
                                                                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                                    >
                                                                        Download Knowledge Base
                                                                    </a>
                                                                </Typography>
                                                            )}
                                                            <Typography
                                                                sx={{
                                                                    fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                    color: 'text.secondary',
                                                                    mt: 0.5,
                                                                    textAlign: 'left',
                                                                }}
                                                            >
                                                                <strong>Month requests count:</strong> {agent.call_count || 0}
                                                            </Typography>
                                                            <Typography
                                                                sx={{
                                                                    fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                    color: 'text.secondary',
                                                                    mt: 0.5,
                                                                    textAlign: 'left',
                                                                }}
                                                            >
                                                                <strong>Year requests count:</strong> {agent.call_count_year || 0}
                                                            </Typography>
                                                            {agent.public_url && (
                                                            <Typography
                                                                sx={{
                                                                    fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                    color: 'text.secondary',
                                                                    mt: 0.5,
                                                                    textAlign: 'left',
                                                                }}
                                                                data-tour="public-link"
                                                            >
                                                                <strong>Public Link:</strong>{' '}
                                                                <Link
                                                                    href={agent.public_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    sx={{ color: '#1976d2', textDecoration: 'none' }}
                                                                >
                                                                    {agent.public_url}
                                                                </Link>
                                                            </Typography>
                                                                )}
                                                        </Box>
                                                        {deviceType === 'mobile' && (
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'row',
                                                                    gap: deviceType === 'mobile' ? 1 : 1.5,
                                                                    mt: 1,
                                                                    flexWrap: 'wrap',
                                                                    justifyContent: 'flex-start',
                                                                }}
                                                            >
                                                                <>
                                                                    {agent.agent_id && (
                                                                        <>
                                                                            {agent.alias_id ? (
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
                                                                                            height: 32,
                                                                                        }}
                                                                                        data-tour="open-chat-button"
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
                                                                                                height: 32,
                                                                                            }}
                                                                                            data-tour="deploy-button"
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
                                                                                                height: 32,
                                                                                            }}
                                                                                        >
                                                                                            Revoke
                                                                                        </Button>
                                                                                    )}
                                                                                    <Button
                                                                                        variant="contained"
                                                                                        color="warning"
                                                                                        onClick={() => handleOpenEditDialog(agent)}
                                                                                        sx={{
                                                                                            fontSize: deviceType === 'mobile' ? '0.8rem' : '0.85rem',
                                                                                            px: deviceType === 'mobile' ? 1 : 1.5,
                                                                                            py: deviceType === 'mobile' ? 0.5 : 0.75,
                                                                                            minWidth: 80,
                                                                                            height: 32,
                                                                                        }}
                                                                                    >
                                                                                        Edit
                                                                                    </Button>
                                                                                </>
                                                                            ) : (
                                                                                <Button
                                                                                    variant="contained"
                                                                                    color="secondary"
                                                                                    onClick={() => createAlias(agent.agent_id, agent.name)}
                                                                                    sx={{
                                                                                        fontSize: deviceType === 'mobile' ? '0.8rem' : '0.85rem',
                                                                                        px: deviceType === 'mobile' ? 1 : 1.5,
                                                                                        py: deviceType === 'mobile' ? 0.5 : 0.75,
                                                                                        minWidth: 80,
                                                                                        height: 32,
                                                                                    }}
                                                                                >
                                                                                    Create Alias
                                                                                </Button>
                                                                            )}
                                                                            <Button
                                                                                variant="contained"
                                                                                color="error"
                                                                                onClick={() => handleOpenDeleteDialog(agent)}
                                                                                sx={{
                                                                                    fontSize: deviceType === 'mobile' ? '0.8rem' : '0.85rem',
                                                                                    px: deviceType === 'mobile' ? 1 : 1.5,
                                                                                    py: deviceType === 'mobile' ? 0.5 : 0.75,
                                                                                    minWidth: 80,
                                                                                    height: 32,
                                                                                }}
                                                                            >
                                                                                Delete
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                {deviceType !== 'mobile' && (
                                                    <TableCell
                                                        sx={{
                                                            fontSize: deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                            py: 1,
                                                            verticalAlign: 'top',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: deviceType === 'tablet' ? 1.25 : 1.5,
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <>
                                                                {agent.agent_id && (
                                                                    <>
                                                                        {agent.alias_id ? (
                                                                            <>
                                                                                <Button
                                                                                    variant="contained"
                                                                                    color="primary"
                                                                                    onClick={() => handleOpenChat(agent)}
                                                                                    sx={{
                                                                                        fontSize: deviceType === 'tablet' ? '0.85rem' : '0.9rem',
                                                                                        px: deviceType === 'tablet' ? 1.5 : 2,
                                                                                        py: deviceType === 'tablet' ? 0.75 : 1,
                                                                                        width: deviceType === 'tablet' ? 140 : 160,
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
                                                                                            width: deviceType === 'tablet' ? 140 : 160,
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
                                                                                            width: deviceType === 'tablet' ? 140 : 160,
                                                                                        }}
                                                                                    >
                                                                                        Revoke
                                                                                    </Button>
                                                                                )}
                                                                                <Button
                                                                                    variant="contained"
                                                                                    color="warning"
                                                                                    onClick={() => handleOpenEditDialog(agent)}
                                                                                    sx={{
                                                                                        fontSize: deviceType === 'tablet' ? '0.85rem' : '0.9rem',
                                                                                        px: deviceType === 'tablet' ? 1.5 : 2,
                                                                                        py: deviceType === 'tablet' ? 0.75 : 1,
                                                                                        width: deviceType === 'tablet' ? 140 : 160,
                                                                                    }}
                                                                                >
                                                                                    Edit
                                                                                </Button>
                                                                            </>
                                                                        ) : (
                                                                            <Button
                                                                                variant="contained"
                                                                                color="secondary"
                                                                                onClick={() => createAlias(agent.agent_id, agent.name)}
                                                                                sx={{
                                                                                    fontSize: deviceType === 'tablet' ? '0.85rem' : '0.9rem',
                                                                                    px: deviceType === 'tablet' ? 1.5 : 2,
                                                                                    py: deviceType === 'tablet' ? 0.75 : 1,
                                                                                    width: deviceType === 'tablet' ? 140 : 160,
                                                                                }}
                                                                            >
                                                                                Create Alias
                                                                            </Button>
                                                                        )}
                                                                    </>
                                                                )}
                                                                <Button
                                                                    variant="contained"
                                                                    color="error"
                                                                    onClick={() => handleOpenDeleteDialog(agent)}
                                                                    sx={{
                                                                        fontSize: deviceType === 'tablet' ? '0.85rem' : '0.9rem',
                                                                        px: deviceType === 'tablet' ? 1.5 : 2,
                                                                        py: deviceType === 'tablet' ? 0.75 : 1,
                                                                        width: deviceType === 'tablet' ? 140 : 160,
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </>
                                                        </Box>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                            {agent.public_url && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={deviceType === 'mobile' ? 1 : 2}
                                                        sx={{
                                                            backgroundColor: 'transparent',
                                                            fontSize:
                                                                deviceType === 'mobile'
                                                                    ? '0.9rem'
                                                                    : deviceType === 'tablet'
                                                                        ? '0.95rem'
                                                                        : '1rem',
                                                            py: 1,
                                                            textAlign: 'left',
                                                        }}
                                                    >
                                                        <Accordion sx={{ mt: 0, width: '100%' }}>
                                                            <AccordionSummary
                                                                expandIcon={<ExpandMoreIcon />}
                                                                aria-controls="script-content"
                                                                id="script-header"
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    backgroundColor: '#f0f0f0',
                                                                }}
                                                                data-tour="add-button"
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 'bold',
                                                                        fontSize:
                                                                            deviceType === 'mobile'
                                                                                ? '0.9rem'
                                                                                : deviceType === 'tablet'
                                                                                    ? '0.95rem'
                                                                                    : '1rem',
                                                                    }}
                                                                >
                                                                    Integration Script
                                                                </Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails
                                                                sx={{
                                                                    backgroundColor: '#e0e0e0',
                                                                    p: 1,
                                                                    borderRadius: '4px',
                                                                }}
                                                            >
                                                                <Box
                                                                    component="pre"
                                                                    sx={{
                                                                        fontSize:
                                                                            deviceType === 'mobile'
                                                                                ? '0.8rem'
                                                                                : deviceType === 'tablet'
                                                                                    ? '0.85rem'
                                                                                    : '0.9rem',
                                                                        whiteSpace: 'pre-wrap',   // перенос строк
                                                                        wordBreak: 'break-word',  // ломаем длинные слова
                                                                        overflowX: 'auto',        // горизонтальный скролл, если совсем не помещается
                                                                        mb: 1,
                                                                        maxWidth: '100%',         // ограничиваем ширину
                                                                    }}
                                                                >
                                                                    {`<script
  src="https://d1w17tu7s7ktlv.cloudfront.net/embed.umd.js"
  data-agent-name="${agent.name}"
  data-agent-id="${agent.agent_id}"
  data-api-key="${agent.key}"
  data-bottom-desktop="25"
  data-right-desktop="25"
  data-bottom-mobile="10"
  data-right-mobile="10"
></script>`}
                                                                </Box>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={() => {
                                                                        navigator.clipboard
                                                                            .writeText(`<script
  src="https://d1w17tu7s7ktlv.cloudfront.net/embed.umd.js"
  data-agent-name="${agent.name}"
  data-agent-id="${agent.agent_id}"
  data-api-key="${agent.key}"
  data-bottom-desktop="25"
  data-right-desktop="25"
  data-bottom-mobile="10"
  data-right-mobile="10"
></script>`)
                                                                            .then(() => {
                                                                                alert('The script has been copied to the clipboard!');
                                                                            })
                                                                            .catch((err) => {
                                                                                console.error('Copy error:', err);
                                                                                alert('Error when copying the script');
                                                                            });
                                                                    }}
                                                                    sx={{
                                                                        fontSize:
                                                                            deviceType === 'mobile'
                                                                                ? '0.8rem'
                                                                                : deviceType === 'tablet'
                                                                                    ? '0.85rem'
                                                                                    : '0.9rem',
                                                                        textTransform: 'none',
                                                                    }}
                                                                >
                                                                    Copy script
                                                                </Button>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={deviceType === 'mobile' ? 1 : 2} sx={{ textAlign: 'left' }}>
                                            No agents
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>
            );
            case Page.SETTINGS: return <Settings {...{
                callCount: agents.reduce((callCount, agent) => {
                    callCount.month += agent.call_count || 0;
                    callCount.year += agent.call_count_year || 0;
                    return callCount;
                }, {month: 0, year: 0}),
                deviceType,
                user,
                setGlobalLoading
            }} />
            case Page.PRIVACY_POLICY:
                return (
                    <PrivacyPolicy {...{deviceType}}/>
                );
            case Page.TERMS_AND_CONDITIONS:
                return <TermsAndConditions />;
            default: return <></>

        }
    }

    // @ts-ignore
    return (
        <>
            <GlobalStyles
                styles={{
                    'html, body': {
                        overflowX: 'hidden',
                        width: '100%',
                        maxWidth: '100%',
                    },
                    '#root': {
                        overflowX: 'hidden',
                        width: '100%',
                        maxWidth: '100%',
                    },
                }}
            />
            {/*<ChatWidget*/}
            {/*    agents={agents}*/}
            {/*    user={user}*/}
            {/*    deviceType={deviceType}*/}
            {/*    getAuthToken={getAuthToken} // Передайте функцию для авторизованных чатов, если нужно*/}
            {/*/>*/}
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
                data-tour="welcome"
            >
                {globalLoading && <GlobalLoader />}

                <Container
                    sx={{
                        mt: 10,
                        flex: 1,
                        maxWidth: deviceType === 'mobile' ? '100% !important' : deviceType === 'tablet' ? '90% !important' : '80% !important',
                        px: deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 2 : 3,
                        boxSizing: 'border-box',
                        overflowX: 'hidden',
                    }}
                >
                    {!user ? (
                        <Auth onAuthChange={setUser} onSignOut={handleSignOut} />
                    ) : (<>
                        <AppNavbar
                            {...{
                                deviceType,
                                onToggleDrawer: toggleDrawer,
                                onSignOut: handleSignOut,
                                page,
                                onNewAgent: () => setOpenAddDialog(true)
                            }}
                        />


                        <Drawer
                            open={drawerOpen}
                            onClose={toggleDrawer}
                            sx={{
                                '& .MuiDrawer-paper': {
                                    width: deviceType === 'mobile' ? '70vw' : deviceType === 'tablet' ? '50vw' : 250,
                                    boxSizing: 'border-box',
                                },
                            }}
                        >
                            <List dense>
                                <ListItemButton onClick={() => {
                                    toggleDrawer();
                                    handleOpenAddDialog();
                                }}>
                                    <ListItemIcon>
                                        <AddIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Add agent" sx={{ textAlign: 'left' }} />
                                </ListItemButton>

                                <Divider />

                                <ListItemButton onClick={() => {
                                    toggleDrawer();
                                    setPage(Page.AGENTS);
                                }}>
                                    <ListItemIcon>
                                        <ViewListIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Agents" sx={{ textAlign: 'left' }} />
                                </ListItemButton>

                                <ListItemButton onClick={() => {
                                    toggleDrawer();
                                    setPage(Page.SETTINGS);
                                }}>
                                    <ListItemIcon>
                                        <SettingsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={Page.SETTINGS} sx={{ textAlign: 'left' }} />
                                </ListItemButton>

                                <ListItemButton onClick={() => {
                                    toggleDrawer();
                                    setPage(Page.PRIVACY_POLICY);
                                }}>
                                    <ListItemIcon>
                                        <PolicyIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={Page.PRIVACY_POLICY} sx={{ textAlign: 'left' }} />
                                </ListItemButton>

                                <ListItemButton onClick={() => {
                                    toggleDrawer();
                                    setPage(Page.TERMS_AND_CONDITIONS);
                                }}>
                                    <ListItemIcon>
                                        <DescriptionIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={Page.TERMS_AND_CONDITIONS} sx={{ textAlign: 'left' }} />
                                </ListItemButton>
                            </List>
                        </Drawer>

                        {pageContent(page)}
                    </>)}
                    <Copyright />

                    <TermsAndConditionAcceptanceDialog
                        isUserLoggedIn={!!user}
                        user={user} // Передаем весь объект user
                        onUpdateUser={(updatedProfile) => setUser({ ...user, profile: updatedProfile })}
                    />

                    <AddAgentDialog
                        open={openAddDialog}
                        onClose={() => setOpenAddDialog(false)}
                        onAddAgent={() => setOpenAddDialog(false)}
                        deviceType={deviceType}
                        getAuthToken={getAuthToken}
                        userId={user?.id || ''}
                        setGlobalLoading={setGlobalLoading}
                        setErrorMessage={setErrorMessage}
                        setAgents={setAgents}
                        fetchAgents={fetchAgents}
                        setAgentCreated={(value: boolean) => {
                            // когда диалог сообщает, что агент создан — продвигаем тур
                            if (value) {
                                try {
                                    // 9 — тот индекс шага, на который вы раньше пытались переходить
                                    setCurrentStep(9);
                                } catch (e) {
                                    console.warn('Не удалось установить шаг тура:', e);
                                }
                            }
                        }}
                    />


                    <Dialog
                        open={openEditDialog}
                        onClose={handleCloseEditDialog}
                        fullWidth
                        maxWidth={deviceType === 'mobile' ? 'xs' : 'sm'}
                    >
                        <DialogTitle
                            sx={{
                                fontSize: deviceType === 'mobile' ? '1.25rem' : deviceType === 'tablet' ? '1.375rem' : '1.25rem',
                                textAlign: 'left',
                            }}
                        >
                            Edit agent
                        </DialogTitle>
                        <DialogContent sx={{ textAlign: 'left', overflowX: 'hidden' }}>
                            {errorMessage && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 2,
                                        width: '100%',
                                        fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                        textAlign: 'left',
                                    }}
                                >
                                    {errorMessage}
                                </Alert>
                            )}
                            {editAgent && (
                                <>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 2,
                                            fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.1rem',
                                            textAlign: 'left',
                                        }}
                                    >
                                        General settings
                                    </Typography>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        label="Name"
                                        type="text"
                                        fullWidth
                                        value={editAgent.name}
                                        onChange={(e) => setEditAgent({ ...editAgent, name: e.target.value })}
                                        helperText="Use only letters, numbers, _ or -"
                                        sx={{
                                            mb: 2,
                                            '& .MuiInputBase-input': {
                                                fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                                textAlign: 'left',
                                            },
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
                                        helperText="Minimum length 40 characters"
                                        sx={{
                                            mb: 2,
                                            '& .MuiInputBase-input': {
                                                fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                                textAlign: 'left',
                                            },
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: deviceType === 'mobile' ? 'column' : 'row',
                                            gap: deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 1.5 : 2,
                                            mb: 2,
                                            justifyContent: 'flex-start',
                                        }}
                                    >
                                        <FormControlLabel
                                            control={<Checkbox checked={editEnableHttpAction} onChange={(e) => setEditEnableHttpAction(e.target.checked)} />}
                                            label="Enable HTTP-action"
                                            sx={{ '& .MuiTypography-root': { fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' } }}
                                        />
                                        <FormControlLabel
                                            control={<Checkbox checked={editEnableEmailAction} onChange={(e) => setEditEnableEmailAction(e.target.checked)} />}
                                            label="Enable Email-action"
                                            sx={{ '& .MuiTypography-root': { fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' } }}
                                        />
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 2,
                                            fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.1rem',
                                            textAlign: 'left',
                                        }}
                                    >
                                        Knowledge base (optional)
                                    </Typography>
                                    {initialKnowledgeBaseFile && (
                                        <Alert
                                            severity="info"
                                            sx={{
                                                mb: 2,
                                                width: '100%',
                                                fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                                textAlign: 'left',
                                            }}
                                        >
                                            {initialKnowledgeBaseFile}. You can upload a new file to update or leave it as is.
                                        </Alert>
                                    )}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={deleteKnowledgeBase}
                                                onChange={(e) => {
                                                    setDeleteKnowledgeBase(e.target.checked);
                                                    if (e.target.checked) setEditFile(null);
                                                }}
                                            />
                                        }
                                        label="Delete knowledge base"
                                        sx={{ '& .MuiTypography-root': { fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' } }}
                                    />
                                    {!deleteKnowledgeBase && (
                                        <input
                                            type="file"
                                            accept=".pdf,.txt"
                                            onChange={(e) => setEditFile(e.target.files ? e.target.files[0] : null)}
                                            style={{
                                                margin: '16px 0',
                                                width: '100%',
                                                boxSizing: 'border-box',
                                                fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                            }}
                                            disabled={deleteKnowledgeBase}
                                        />
                                    )}
                                    <Typography
                                        variant="caption"
                                        color="textSecondary"
                                        sx={{
                                            fontSize: deviceType === 'mobile' ? '0.8rem' : deviceType === 'tablet' ? '0.85rem' : '0.8rem',
                                            textAlign: 'left',
                                        }}
                                    >
                                        {deleteKnowledgeBase
                                            ? 'Selected knowledge base deleting. File selection is not possible.'
                                            : 'Upload a new file (PDF or TXT) to update the knowledge base. If no file is selected, the current knowledge base will remain unchanged.'}
                                    </Typography>
                                </>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'center' }}>
                            <Button
                                onClick={handleCloseEditDialog}
                                color="primary"
                                sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEditAgent}
                                color="primary"
                                sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}
                            >
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={openDeleteDialog}
                        onClose={handleCloseDeleteDialog}
                        fullWidth
                        maxWidth={deviceType === 'mobile' ? 'xs' : 'sm'}
                    >
                        <DialogTitle
                            sx={{
                                fontSize: deviceType === 'mobile' ? '1.25rem' : deviceType === 'tablet' ? '1.375rem' : '1.25rem',
                                textAlign: 'left',
                            }}
                        >
                            Confirm Deletion
                        </DialogTitle>
                        <DialogContent sx={{ textAlign: 'left', overflowX: 'hidden' }}>
                            {errorMessage && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 2,
                                        width: '100%',
                                        fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                        textAlign: 'left',
                                    }}
                                >
                                    {errorMessage}
                                </Alert>
                            )}
                            <Typography
                                sx={{
                                    fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.1rem' : '1rem',
                                    textAlign: 'left',
                                }}
                            >
                                Are you sure you want to delete the agent "{agentToDelete?.name}"? This action cannot be undone.
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'center' }}>
                            <Button
                                onClick={handleCloseDeleteDialog}
                                color="primary"
                                sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteAgent}
                                color="error"
                                sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}
                            >
                                Delete
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
                                aria-label={`Чат с ${selectedAgent?.name}`}
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
                                    <IconButton onClick={() => setChatOpen(false)} sx={{ mr: 1 }} data-tour="chat-close">
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
                                    data-tour="chat-dialog"
                                >
                                    <MessageInput
                                        ref={inputRef}
                                        placeholder="Enter a message..."
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