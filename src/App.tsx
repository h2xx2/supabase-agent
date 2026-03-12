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
import { useTranslation } from "react-i18next";

interface Agent {
    key: React.ReactNode;
    id: string;
    user_id: string;
    name: string;
    instructions: string;
    created_at: string;
    agent_id: string;
    status?: string;
    public_url?: string;
    call_count?: number;
    call_count_year?: number;
    knowledge_base_id?: string;
    http_action_enabled: boolean;
    email_action_enabled: boolean;
    generation_image_action_enabled: boolean;
    process_image_action_enabled: boolean;
}

const Page = {
    AGENTS: "AGENTS",
    SETTINGS: "SETTINGS",
    PRIVACY_POLICY: "PRIVACY_POLICY",
    TERMS_AND_CONDITIONS: "TERMS_AND_CONDITIONS",
} as const;

type PageKey = keyof typeof Page;
interface AppProps {
    setChatOpened?: (value: boolean) => void;
    setAgentDeployed?: (value: boolean) => void;
    // если у вас есть другие пропсы от Root — добавьте их здесь
}

const App: React.FC<AppProps> = ({ setChatOpened: setChatOpenedFromRoot, setAgentDeployed }) => {
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
    const [enableImageGenerationAction, setEnableImageGenerationAction] = useState(false);
    const [enablePhotoProccessAction, setPhotoProccessAction] = useState(false);
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
    const [page, setPage] = useState<PageKey>(Page.AGENTS);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const { currentStep, setCurrentStep } = useTour()
    const { setIsOpen } = useTour();
    const [termsDialogOpen, setTermsDialogOpen] = useState(false);
    const messageListRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLDivElement | null>(null);
    const { t } = useTranslation();
    const fileUrlMap = useRef<Record<string, string>>({});


    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const SUPPORTED_EXTENSIONS = [
        '.pdf', '.txt', '.doc', '.docx', '.csv', '.xls', '.xlsx',

        '.png', '.jpg', '.jpeg', '.webp'
    ];
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
    const [messageListHeight, setMessageListHeight] = useState<number>(0);
    const tour = useTour() as any;

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
            throw new Error('The authorization token is missing from the cookie');
        }
        return token;
    };

    const getUserIdFromToken = (token: string): string => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub;
        } catch (error) {
            console.error('Token decoding error:', error);
            throw new Error('It is not possible to extract the user_id from the token');
        }
    };

    useEffect(() => {
        if (user) {
            const loadAgents = async () => {
                try {
                    const agentsData = await fetchAgents();
                    setAgents(agentsData);
                } catch (error: any) {
                    console.error('Error loading agents:', error);
                    setErrorMessage(t('app.msgErrFailedLoadAgent'));
                }
            };
            loadAgents();
            const interval = setInterval(loadAgents, 15000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const tourCompleted = localStorage.getItem('tourCompleted') === 'true';
        if (user && !termsDialogOpen) {
            try {
                setIsOpen(true);
            } catch (e) {
                console.warn('Cannot open tour programmatically', e);
            }
        } else {
            if (!user || termsDialogOpen) {
                try { setIsOpen(false); } catch (e) { /* ignore */ }
            }
        }
    }, [user, termsDialogOpen, setIsOpen]);




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
            console.error('Error receiving agents:', error);
            setErrorMessage(
                error.message === 'The authorization token is missing from the cookie'
                    ? t('loginRequired')
                    : t('app.msgErrFailedLoadAgent')
            );
            return [];
        }
    };

    const handleCloseChat = () => {
        setChatOpen(false);
        setAttachedFile(null);
        setAttachedFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (typeof setChatOpenedFromRoot === 'function') {
            try { setChatOpenedFromRoot(false); } catch (e) { /* ignore */ }
        }

        try {
            if (tour && tour.isOpen) {
                tour.setCurrentStep(13);
            }
        } catch (e) {
            console.warn('Cannot move tour to deploy step', e);
        }
    };


    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    const handleSignOut = async () => {
        try {
            const token = cookies.authToken;
            if (token) {
                await axios.post(
                    `${import.meta.env.VITE_API_GATEWAY_URL}/auth/signout`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            }
        } catch (error: any) {
            console.error('Exit error:', error);
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

    const handleOpenEditDialog = (agent: Agent) => {
        setEditAgent(agent);
        setEditEnableHttpAction(!!agent.http_action_enabled);
        setEditEnableEmailAction(!!agent.email_action_enabled);
        setEnableImageGenerationAction(!!agent.generation_image_action_enabled);
        setPhotoProccessAction(!!agent.process_image_action_enabled);
        setEditFile(null);
        setDeleteKnowledgeBase(false);
        setInitialKnowledgeBaseFile(agent.knowledge_base_id ? t('app.initialKnowledgeBaseFile') : null);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditAgent(null);
        setErrorMessage(null);
        setEditEnableHttpAction(false);
        setEditEnableEmailAction(false);
        setEnableImageGenerationAction(false);
        setPhotoProccessAction(false);
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
            setErrorMessage(t('nameInstructionsRequired'));
            return;
        }

        const sanitizedName = editAgent.name.replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, '');
        if (!sanitizedName) {
            setErrorMessage(t('invalidAgentName'));
            return;
        }

        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            const user_id = getUserIdFromToken(token);
            const fileData = editFile ? await convertFileToBase64(editFile) : null;
            const fileName = editFile ? editFile.name : null;
            if (deleteKnowledgeBase && fileData) {
                setErrorMessage(t('app.cannotSelectNewFileWhileDeleting'));
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
                    http_action_enabled: editEnableHttpAction,
                    email_action_enabled: editEnableEmailAction,
                    generation_image_action_enabled: enableImageGenerationAction,
                    process_image_action_enabled: enablePhotoProccessAction,
                    file_base: fileData,
                    file_name: fileName,
                    delete_vector_store: deleteKnowledgeBase,
                }),
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            await fetchAgents();
            handleCloseEditDialog();
        } catch (error: any) {
            console.error('Error updating agent:', error);
            setErrorMessage(
                error.message === 'The authorization token is missing from the cookie'
                    ? t('loginRequired')
                    : t('app.errorUpdatingAgent', {message: error.message || 'Unknown error'})
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
            if (!presignedUrl) throw new Error('Couldn\'t get a link to the file');

            const fileResponse = await fetch(presignedUrl);
            const blob = await fileResponse.blob();
            const fileName =
                presignedUrl.split('/').pop()?.split('?')[0] || t('app.knowledgeBasePdf');

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error when downloading the knowledge base:', error);
            setErrorMessage(t('app.couldntDownloadKbFile'));
        } finally {
            setGlobalLoading(false);
        }
    };

    const sendChatMessage = async (text: string) => {
        if (!text.trim() && !attachedFile) return;
        if (!selectedAgent?.agent_id) return;

        const userText = text.trim();
        const hasFile = !!attachedFile;
        const fileNameForDisplay = attachedFileName || 'file';

        // Формируем сообщение пользователя
        const userMessage: MessageModel = {
            message: userText || fileNameForDisplay, // текст или имя файла
            sentTime: new Date().toISOString(),
            sender: 'user',
            direction: 'outgoing',
            position: 'single',
            // Добавляем кастомное поле — chatscope его не трогает, но мы сможем использовать
            attachedFileName: hasFile ? fileNameForDisplay : undefined,
        };

        // Сразу показываем сообщение в чате
        setChatMessages(prev => [...prev, userMessage]);

        let sessionId = sessionIds[selectedAgent.agent_id] || null;

        try {
            const token = getAuthToken();
            let image = null;
            let file = null;

            if (attachedFile) {

                const formData = new FormData();
                formData.append("file", attachedFile);

                const upload = await axios.post(
                    `${import.meta.env.VITE_API_GATEWAY_URL}/upload-s3`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const key = upload.data.key;
                const type = attachedFile.type;

                if (type.startsWith("image/")) {
                    image = key;
                } else {
                    file = key;
                }
            }
            setAttachedFile(null);
            setAttachedFileName(null);
            console.log({
                message: userText,
                agentId: selectedAgent.agent_id,
                responseId: sessionId,
                user_id: user?.id,
                imageKey: image,
                fileKey: file
            });
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/send`,
                {
                    message: userText,
                    agentId: selectedAgent.agent_id,
                    responseId: sessionId,
                    user_id: user?.id,
                    imageKey: image,
                    fileKey: file
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const botMessage: MessageModel = {
                message: response.data.message,
                sentTime: new Date().toISOString(),
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
                attachedFileName: 'Generated image.png'
            };
            if (response.data.image?.url) {
                fileUrlMap.current[botMessage.sentTime] = response.data.image.url;
            }
            setChatMessages(prev => [...prev, botMessage]);
            setSessionIds(prev => ({ ...prev, [selectedAgent.agent_id]: response.data.response_id }));

            // Очищаем файл только после успешной отправки

            if (fileInputRef.current) fileInputRef.current.value = '';

            // Сохраняем сообщение в истории (включая имя файла)
            await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/save-message`, {
                agent_id: selectedAgent.agent_id,
                response_id: sessionId,
                response: response.data.message,
                message: userText || `[File: ${image || file}]`,
                sender: 'user',
                user_id: user?.id,
            }, { headers: { Authorization: `Bearer ${token}` } });

            await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/save-call`, {
                agent_id: selectedAgent.agent_id,
                user_id: user?.id,
                status: 'success',
            }, { headers: { Authorization: `Bearer ${token}` } });

        } catch (error: any) {
            console.error('Error sending message with file:', error);

            let errorText = t('app.failedSendMsg');
            if (error.response?.data?.error) {
                errorText = error.response.data.error;
            } else if (error.message) {
                errorText = `Error: ${error.message}`;
            }

            const errMsg: MessageModel = {
                message: errorText,
                sentTime: new Date().toISOString(),
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };
            setChatMessages(prev => [...prev, errMsg]);

            try {
                const token = getAuthToken();
                await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/save-call`, {
                    agent_id: selectedAgent.agent_id,
                    user_id: user?.id,
                    status: 'failure',
                }, { headers: { Authorization: `Bearer ${token}` } });
            } catch { /* ignore */ }
        }
    };

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
            t('app.unsupportedFileType', { extensions: SUPPORTED_EXTENSIONS.join(', ') })
            e.target.value = '';
            return;
        }

        if (file.size > 3 * 1024 * 1024) { // ~9.5 MB
            alert(t('app.fileTooLarge'));
            e.target.value = '';
            return;
        }

        setAttachedFile(file);
        setAttachedFileName(file.name);
        e.target.value = ''; // чтобы можно было выбрать тот же файл снова
    };

    const handleOpenChat = (agent: Agent) => {
        // ваш существующий код открытия чата
        setSelectedAgent(agent);
        setChatMessages([]);
        setSessionIds((prev) => {
            const newSessionIds = { ...prev };
            if (agent.agent_id) delete newSessionIds[agent.agent_id];
            return newSessionIds;
        });
        setChatOpen(true);

        // уведомим Root (если он передал функцию)
        if (typeof setChatOpenedFromRoot === 'function') {
            try { setChatOpenedFromRoot(true); } catch (e) { /* ignore */ }
        }

        // переводим тур на шаг chat-dialog (index 11)
        try {
            if (tour && tour.isOpen) tour.setCurrentStep(11);
        } catch (e) {
            console.warn('Tour not available or cannot set step', e);
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
            setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, public_url: publicUrl } : a)));
            alert(t('app.publicInfo', { publicUrl, apkKey }));

            // Если Root передал setAgentDeployed — уведомим его, иначе просто продолжим
            if (typeof setAgentDeployed === 'function') {
                try { setAgentDeployed(true); } catch (e) { /* ignore */ }
            }

            // Перейти на шаг public-link (index 14)
            try {
                if (tour && tour.isOpen) {
                    tour.setCurrentStep(14);
                }
            } catch (e) {
                console.warn('Cannot move tour to public-link step', e);
            }
        } catch (error: any) {
            console.error('Error when dispatching the chat:', error);
            setErrorMessage(
                error.message === 'The authorization token is missing from the cookie'
                    ? t('loginRequired')
                    : t('app.dispatchError', { message: error.message || 'Unknown error' })
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
            console.error('Error when revoking the chat:', error);
            setErrorMessage(
                error.message === 'The authorization token is missing from the cookie'
                    ? t('loginRequired')
                    : t('app.revokeError', { message: error.message || 'Unknown error' })
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
            setErrorMessage(t('app.deleteMissingData'));
            handleCloseDeleteDialog();
            return;
        }

        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/delete-agent`,
                JSON.stringify({
                    agent_id: agentToDelete.agent_id,
                    user_id: user.id,
                }),
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            setAgents(agents.filter((a) => a.id !== agentToDelete.id));
            handleCloseDeleteDialog();
        } catch (error: any) {
            console.error('Error deleting the agent:', error);
            setErrorMessage(
                error.message === 'The authorization token is missing from the cookie'
                    ? t('loginRequired')
                    : t('app.deleteError', { message: error.message || 'Unknown error' })
            );
        } finally {
            setGlobalLoading(false);
        }
    };

    const pageContent = (page: PageKey) => {
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
                                        { t("app.agent") }
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
                                            { t("app.actions") }
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
                                                                    <strong>{ t("app.knowledgeBaseFile") }</strong>{' '}
                                                                    <a
                                                                        href="#"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            downloadKnowledgeBase(agent);
                                                                        }}
                                                                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                                    >
                                                                        { t("app.downloadKnowledgeBase") }
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
                                                                <strong>{ t("app.monthRequestsCount") }</strong> {agent.call_count || 0}
                                                            </Typography>
                                                            <Typography
                                                                sx={{
                                                                    fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                    color: 'text.secondary',
                                                                    mt: 0.5,
                                                                    textAlign: 'left',
                                                                }}
                                                            >
                                                                <strong>{ t("app.yearRequestsCount") }</strong> {agent.call_count_year || 0}
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
                                                                <strong>{ t("app.publicLink") }</strong>{' '}
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
                                                                                        { t("app.buttonChat") }
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
                                                                                            { t("app.buttonDeploy") }
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
                                                                                            { t("app.buttonRevoke") }
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
                                                                                        { t("app.buttonEdit") }
                                                                                    </Button>
                                                                                </>
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
                                                                                { t("buttonDelete") }
                                                                            </Button>
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
                                                                                    data-tour="open-chat-button"
                                                                                >
                                                                                    { t("app.buttonChat") }
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
                                                                                        data-tour="deploy-button"
                                                                                    >
                                                                                        { t("app.buttonDeploy") }
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
                                                                                        { t("app.buttonRevoke") }
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
                                                                                    { t("app.buttonEdit") }
                                                                                </Button>
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
                                                                    { t("buttonDelete") }
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
                                                                data-tour="integration-script"
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
                                                                    { t("app.integrationScript") }
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
  src="https://d30ow9hy6abq9r.cloudfront.net/embed.umd.js"
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
  src="https://d30ow9hy6abq9r.cloudfront.net/embed.umd.js"
  data-agent-name="${agent.name}"
  data-agent-id="${agent.agent_id}"
  data-api-key="${agent.key}"
  data-bottom-desktop="25"
  data-right-desktop="25"
  data-bottom-mobile="10"
  data-right-mobile="10"
></script>`)
                                                                            .then(() => {
                                                                                alert(t('app.scriptCopied'));
                                                                            })
                                                                            .catch((err) => {
                                                                                console.error('Copy error:', err);
                                                                                alert(t('app.scriptCopyError'));
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
                                                                    { t("app.copyScript") }
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
                                            { t("app.noAgents") }
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
                                    <ListItemText primary={ t('page.addAgents') } sx={{ textAlign: 'left' }} />
                                </ListItemButton>

                                <Divider />

                                <ListItemButton onClick={() => {
                                    toggleDrawer();
                                    setPage(Page.AGENTS);
                                }}>
                                    <ListItemIcon>
                                        <ViewListIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={ t(`page.${Page.AGENTS}`) } sx={{ textAlign: 'left' }} />
                                </ListItemButton>

                                <ListItemButton onClick={() => {
                                    toggleDrawer();
                                    setPage(Page.SETTINGS);
                                }}>
                                    <ListItemIcon>
                                        <SettingsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={ t(`page.${Page.SETTINGS}`) } sx={{ textAlign: 'left' }} />
                                </ListItemButton>

                                <ListItemButton onClick={() => {
                                    toggleDrawer();
                                    setPage(Page.PRIVACY_POLICY);
                                }}>
                                    <ListItemIcon>
                                        <PolicyIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={ t(`page.${Page.PRIVACY_POLICY}`) } sx={{ textAlign: 'left' }} />
                                </ListItemButton>

                                <ListItemButton onClick={() => {
                                    toggleDrawer();
                                    setPage(Page.TERMS_AND_CONDITIONS);
                                }}>
                                    <ListItemIcon>
                                        <DescriptionIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={ t(`page.${Page.TERMS_AND_CONDITIONS}`) } sx={{ textAlign: 'left' }} />
                                </ListItemButton>
                            </List>
                        </Drawer>

                        {pageContent(page)}
                    </>)}
                    <Copyright />

                    <TermsAndConditionAcceptanceDialog
                        isUserLoggedIn={!!user}
                        user={user}
                        onUpdateUser={(updatedProfile) => setUser({ ...user, profile: updatedProfile })}
                        onDialogStateChange={setTermsDialogOpen}
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
                            { t("app.editAgent") }
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
                                        { t("generalSettings") }
                                    </Typography>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        label={ t("labelName") }
                                        type="text"
                                        fullWidth
                                        value={editAgent.name}
                                        onChange={(e) => setEditAgent({ ...editAgent, name: e.target.value })}
                                        helperText={ t("helperTextName") }
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
                                        label={ t("labelInstructions") }
                                        type="text"
                                        fullWidth
                                        multiline
                                        rows={deviceType === 'mobile' ? 3 : 4}
                                        value={editAgent.instructions}
                                        onChange={(e) => setEditAgent({ ...editAgent, instructions: e.target.value })}
                                        helperText={ t("helperTextInstructions") }
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
                                            label={ t("labelHttpAction") }
                                            sx={{ '& .MuiTypography-root': { fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' } }}
                                        />
                                        <FormControlLabel
                                            control={<Checkbox checked={editEnableEmailAction} onChange={(e) => setEditEnableEmailAction(e.target.checked)} />}
                                            label={ t("labelEmailAction") }
                                            sx={{ '& .MuiTypography-root': { fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' } }}
                                        />
                                        <FormControlLabel
                                            control={<Checkbox checked={enableImageGenerationAction} onChange={(e) => setEnableImageGenerationAction(e.target.checked)} />}
                                            label={ t("labelGenerationAction") }
                                            sx={{ '& .MuiTypography-root': { fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' } }}
                                        />
                                        <FormControlLabel
                                            control={<Checkbox checked={enablePhotoProccessAction} onChange={(e) => setPhotoProccessAction(e.target.checked)} />}
                                            label={ t("labelProcessingAction") }
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
                                        { t("knowledgeBase") }
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
                                            { t("app.fileMessage", { initialKnowledgeBaseFile }) }
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
                                        label={ t('app.labelDeleteKnowledgeBase') }
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
                                            ? t('app.kbDeleting')
                                            : t('app.kbUploadInfo')}
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
                                { t("cancel") }
                            </Button>
                            <Button
                                onClick={handleEditAgent}
                                color="primary"
                                sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}
                            >
                                { t("buttonSave") }
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
                            { t('app.confirmDeletion') }
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
                                { t("app.deleteAgentConfirm", { name: agentToDelete?.name }) }
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'center' }}>
                            <Button
                                onClick={handleCloseDeleteDialog}
                                color="primary"
                                sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}
                            >
                                { t('cancel') }
                            </Button>
                            <Button
                                onClick={handleDeleteAgent}
                                color="error"
                                sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}
                            >
                                { t('buttonDelete') }
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
                                    <IconButton onClick={() => handleCloseChat()} sx={{ mr: 1 }} data-tour="chat-close">
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
                                        { t("app.chatWith", { name: selectedAgent.name }) }
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
                                    {chatMessages.map((msg, index) => {
                                        const hasFile = !!(msg as any).attachedFileName;
                                        const textMessage = msg.message?.trim();
                                        const isUserMessage = msg.direction === 'outgoing';

                                        if (isUserMessage && hasFile && textMessage) {
                                            return (
                                                <React.Fragment key={index}>
                                                    <Message
                                                        model={{
                                                            message: textMessage,
                                                            direction: 'outgoing',
                                                            position: 'single',
                                                            sender: 'user',
                                                        }}
                                                    />

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
                                                                    sx={{
                                                                        maxWidth: '150px',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                    }}
                                                                >
                                                                    {(msg as any).attachedFileName}
                                                                </Typography>
                                                            </Box>
                                                        </Message.CustomContent>
                                                    </Message>
                                                </React.Fragment>
                                            );
                                        }

                                        if (isUserMessage && hasFile && !textMessage) {
                                            return (
                                                <Message
                                                    key={index}
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
                                                            }}
                                                        >
                                                            <DescriptionIcon sx={{ fontSize: 22, color: '#1976d2' }} />
                                                            <Typography
                                                                fontWeight="600"
                                                                fontSize="0.85rem"
                                                                color="#0d47a1"
                                                                noWrap
                                                                sx={{
                                                                    maxWidth: '150px',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                }}
                                                            >
                                                                {(msg as any).attachedFileName}
                                                            </Typography>
                                                        </Box>
                                                    </Message.CustomContent>
                                                </Message>
                                            );
                                        }

                                        if (!isUserMessage && hasFile) {
                                            const fileUrl = fileUrlMap.current[msg.sentTime];

                                            return (
                                                <React.Fragment key={index}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        {/* Текст ответа бота */}
                                                        {msg.message && (
                                                            <Message
                                                                model={{
                                                                    message: msg.message,
                                                                    direction: 'incoming',
                                                                    position: 'single',
                                                                    sender: 'bot',
                                                                }}
                                                            />
                                                        )}

                                                        {/* Изображение от бота */}
                                                        {fileUrl && (
                                                            <Message
                                                                model={{
                                                                    message: '',
                                                                    direction: 'incoming',
                                                                    position: 'single',
                                                                    sender: 'bot',
                                                                }}
                                                            >
                                                                <Message.CustomContent>
                                                                    <Box
                                                                        component="img"
                                                                        src={fileUrl}
                                                                        alt="Generated image"
                                                                        onClick={() => window.open(fileUrl, '_blank')}
                                                                        sx={{
                                                                            width: '100%',
                                                                            maxWidth: 400,
                                                                            height: 'auto',
                                                                            maxHeight: 300,
                                                                            borderRadius: 2,
                                                                            cursor: 'pointer',
                                                                            boxShadow: 2,
                                                                            objectFit: 'contain',
                                                                        }}
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.src = '/placeholder-image.png'; // или data URL
                                                                        }}
                                                                    />
                                                                </Message.CustomContent>
                                                            </Message>
                                                        )}
                                                    </Box>
                                                </React.Fragment>
                                            );
                                        }

                                        return (
                                            <Message
                                                key={index}
                                                model={{
                                                    message: msg.message,
                                                    direction: msg.direction,
                                                    position: 'single',
                                                    sender: msg.sender,
                                                }}
                                            />
                                        );
                                    })}
                                </MessageList>

                                <Box
                                    sx={{
                                        flexShrink: 0,
                                        background: '#fff',
                                        borderTop: 1,
                                        borderColor: 'grey.300',
                                        p: 1,
                                        pb: `max(env(safe-area-inset-bottom, 12px), 12px)`,
                                        boxSizing: 'border-box',
                                    }}
                                    data-tour="chat-dialog"
                                >
                                    {/* Превью прикреплённого файла */}
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
                                                        { t('readySend') }
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
                                        accept=".pdf,.txt,.doc,.docx,.csv,.xls,.xlsx, .png, .jpg, .jpeg, .webp"
                                        onChange={handleFileSelected}
                                        style={{ display: 'none' }}
                                    />

                                    <MessageInput
                                        placeholder={ t('pHolderWriteMsg') }
                                        onSend={sendChatMessage}
                                        attachButton={true}
                                        onAttachClick={() => fileInputRef.current?.click()}
                                        sendButton={true}
                                        autoFocus={deviceType !== 'mobile'}
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