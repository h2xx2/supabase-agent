import React, { useState, useEffect, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { GlobalStyles } from '@mui/material';
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
    CircularProgress,
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
// @ts-ignore
import ChatWidget from "./components/ChatWidget.tsx";
import TermsAndConditionAcceptanceDialog from "./components/TermsAndConditionAcceptanceDialog";

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

interface Blueprint {
    blueprint_name: string;
    agent_name: string;
    agent_instructions: string;
    email_action: boolean;
    http_request_action: boolean;
    kb_required: boolean;
    kb_filename?: string | null;
    kb_content?: string | null;
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

    const messageListRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLDivElement | null>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
    const [messageListHeight, setMessageListHeight] = useState<number>(0);

    const blueprints: Blueprint[] = [
        {
            blueprint_name: 'Translator',
            agent_name: 'German Translator',
            agent_instructions:
                'Translate all incoming messages to German. Do not ask users any questions. Just respond with the translated sentence.',
            email_action: false,
            http_request_action: false,
            kb_required: false,
            kb_filename: null,
            kb_content: null,
        },
        {
            blueprint_name: 'Personal Assistant',
            agent_name: 'Personal Assistant of John Doe',
            agent_instructions:
                'You are the personal assistant of John Doe, the CEO of JD Inc. JD Inc. performs the Software Development with the following technologies: \n' +
                ' - Web Development (React, Angular, NodeJS) \n' +
                ' - Cloud Computing (AWS) \n' +
                ' - iOS/Android Software Development \n' +
                ' - AI / LLM \n' +
                'John Doe is available for the scheduled meetings on the following days: \n' +
                ' - Wednesday 10:00 - 14:00 \n' +
                ' - Friday 11:00 - 15:00 \n\n' +
                '- If the user will ask for the guidance regarding what JD Inc. does - provide him the necessary answers. \n' +
                '- If the user will ask the preliminary feasibility of the project - ask the project details and say that John Doe will contact him back. In the meantime send the email to john.doe@example.com with the provided project details.\n' +
                '- If the user will ask to schedule the meeting with John Doe - request the following information from user: \n' +
                '  - email \n' +
                '  - first and last name \n' +
                '  - topic of the discussion \n' +
                '  - desired day and time (verify it according to John Doe availability) \n' +
                'Once the information above is provided - send the meeting invitation to john.doe@example.com.',
            email_action: true,
            http_request_action: false,
            kb_required: false,
            kb_filename: null,
            kb_content: null,
        },
        {
            blueprint_name: 'Sales Agent',
            agent_name: 'Smartphones Sales Agent',
            agent_instructions:
                'You are a sales agent guiding the user over the available smartphones in the shop. The info about the available smartphones is stored in the knowledge base attached.\n\n' +
                'Be polite, introduce yourself first.\n\n' +
                'Make sure the list of selected smartphones is included in the recommendations response.\n\n' +
                'Try to be proactive and always offer something out of the available options.\n\n' +
                'Once user has chosen the smartphone do the following:\n' +
                ' - Ask user for his first name, last name and email\n' +
                ' - Generate the text of the commercial offer\n' +
                ' - Send the commercial offer using the available email action to example@example.com and to user\'s email',
            email_action: true,
            http_request_action: false,
            kb_required: true,
            kb_filename: 'smartphones_inventory.txt',
            kb_content:
                'ID,Product Name,Brand,Model,Price (USD),Stock,Rating,Screen Size (inches),Battery (mAh),RAM (GB),Storage (GB),Camera (MP),5G,Category\n' +
                '1,iPhone 16 Pro Max,Apple,AP-1000,450,30,4.1,5.9,4106,16,512,143,Yes,Smartphones\n' +
                '2,iPhone 16,Apple,AP-1001,900,57,4.1,7.0,4894,6,512,198,Yes,Smartphones\n' +
                '3,Galaxy S25 Ultra,Samsung,SA-1002,1300,98,4.4,6.2,3764,12,128,153,Yes,Smartphones\n' +
                '4,Galaxy S25,Samsung,SA-1003,550,46,5.0,6.7,5456,6,64,98,No,Smartphones\n' +
                '5,Galaxy Z Fold6,Samsung,SA-1004,1450,27,4.6,6.6,4665,8,128,159,Yes,Smartphones\n' +
                '6,Pixel 9 Pro,Google,GO-1005,1400,57,4.4,5.8,4411,12,512,53,Yes,Smartphones\n' +
                '7,Pixel 9,Google,GO-1006,600,10,4.8,5.6,4252,12,1024,191,Yes,Smartphones\n' +
                '8,OnePlus 13 Pro,OnePlus,ON-1007,1100,5,4.3,6.2,5796,4,256,148,No,Smartphones\n' +
                '9,OnePlus 13,OnePlus,ON-1008,1350,100,4.7,6.3,4590,12,256,104,Yes,Smartphones\n' +
                '10,Xiaomi 14 Ultra,Xiaomi,XI-1009,1050,57,4.6,6.7,3633,12,64,90,No,Smartphones\n' +
                '11,Xiaomi 14,Xiaomi,XI-1010,850,86,4.6,5.8,4832,4,1024,113,Yes,Smartphones\n' +
                '12,Xperia 1 VI,Sony,SO-1011,1050,61,4.1,5.7,5114,6,1024,17,No,Smartphones\n' +
                '13,Xperia 5 VI,Sony,SO-1012,1400,75,4.5,5.5,5937,12,512,155,Yes,Smartphones\n' +
                '14,Edge 50 Ultra,Motorola,MO-1013,1450,47,4.2,6.5,4608,8,512,52,No,Smartphones\n' +
                '15,Edge 50 Pro,Motorola,MO-1014,500,9,4.3,6.1,5305,4,64,118,Yes,Smartphones\n' +
                '16,Find X7 Ultra,Oppo,OP-1015,600,63,4.7,5.7,4119,8,256,74,Yes,Smartphones\n' +
                '17,Find X7,Oppo,OP-1016,900,79,4.7,5.6,4594,8,128,123,No,Smartphones\n' +
                '18,X100 Pro,Vivo,VI-1017,1050,68,4.6,6.1,5782,12,64,148,No,Smartphones\n' +
                '19,X100,Vivo,VI-1018,1050,95,4.7,6.5,3886,16,128,164,Yes,Smartphones\n' +
                '20,ROG Phone 8 Pro,Asus,AS-1019,1400,70,4.7,5.6,5911,12,128,154,Yes,Smartphones\n' +
                '21,Zenfone 11 Ultra,Asus,AS-1020,850,24,4.3,5.6,4125,12,1024,134,Yes,Smartphones\n' +
                '22,GT 6 Pro,Realme,RE-1021,700,56,4.4,6.0,5481,8,128,33,No,Smartphones\n' +
                '23,GT 6,Realme,RE-1022,550,18,4.4,6.1,4890,12,256,181,No,Smartphones\n' +
                '24,P70 Pro,Huawei,HU-1023,550,11,4.1,5.9,5269,4,256,25,No,Smartphones\n' +
                '25,P70,Huawei,HU-1024,800,11,4.1,6.1,3516,8,1024,25,Yes,Smartphones\n' +
                '26,Magic 6 Pro,Honor,HO-1025,700,15,4.4,6.6,4712,6,1024,169,Yes,Smartphones\n' +
                '27,Magic 6,Honor,HO-1026,1450,65,5.0,6.3,5503,12,1024,104,No,Smartphones\n' +
                '28,Phone 3,Nothing,NO-1027,1400,43,4.5,6.0,4641,4,64,58,Yes,Smartphones\n' +
                '29,Phone 2a,Nothing,NO-1028,1250,65,4.7,5.9,5489,8,1024,98,No,Smartphones\n' +
                '30,F6 Pro,Poco,PO-1029,1300,61,4.6,5.9,4813,4,256,168,No,Smartphones\n' +
                '31,F6,Poco,PO-1030,1150,36,4.9,5.7,4474,16,512,192,Yes,Smartphones\n' +
                '32,Note 13 Pro+,Redmi,RE-1031,1050,60,4.4,6.4,5207,12,128,153,Yes,Smartphones\n' +
                '33,Note 13 Pro,Redmi,RE-1032,1050,87,4.9,6.5,5513,12,128,60,No,Smartphones\n' +
                '34,Zero Ultra,Infinix,IN-1033,450,34,4.4,5.6,5454,16,1024,198,Yes,Smartphones\n' +
                '35,Zero 5G,Infinix,IN-1034,1050,58,4.6,6.6,4505,12,1024,124,No,Smartphones\n' +
                '36,Phantom X3 Pro,Tecno,TE-1035,1400,60,4.2,5.9,4001,8,1024,131,Yes,Smartphones\n' +
                '37,Phantom X3,Tecno,TE-1036,850,12,4.8,6.0,3997,8,64,114,No,Smartphones\n' +
                '38,XR21,Nokia,NO-1037,1300,30,4.1,6.7,5846,8,128,97,Yes,Smartphones\n' +
                '39,G400,Nokia,NO-1038,950,90,4.6,6.8,5490,4,512,151,Yes,Smartphones\n' +
                '40,Fairphone 5,Fairphone,FA-1039,1450,10,4.7,6.9,5888,16,64,149,Yes,Smartphones\n' +
                '41,Fairphone 4,Fairphone,FA-1040,450,74,4.7,6.2,5612,4,64,88,Yes,Smartphones\n' +
                '42,Axon 60 Ultra,ZTE,ZT-1041,850,8,4.9,5.8,3933,16,1024,19,No,Smartphones\n' +
                '43,Axon 60,ZTE,ZT-1042,850,46,4.4,6.4,5313,4,256,39,No,Smartphones\n' +
                '44,21 Pro,Meizu,ME-1043,700,87,5.0,6.1,4213,12,128,49,No,Smartphones\n' +
                '45,21,Meizu,ME-1044,400,53,4.7,6.8,4138,8,256,103,No,Smartphones\n' +
                '46,Legion Phone Duel 3,Lenovo,LE-1045,650,97,4.1,6.2,5956,6,1024,133,Yes,Smartphones\n' +
                '47,Legion Phone Duel 2,Lenovo,LE-1046,550,27,5.0,6.9,4797,8,1024,178,Yes,Smartphones\n' +
                '48,AQUOS R8 Pro,Sharp,SH-1047,850,42,4.8,6.9,4740,4,512,191,Yes,Smartphones\n' +
                '49,AQUOS R8,Sharp,SH-1048,1000,100,4.7,6.5,4523,6,64,82,No,Smartphones\n' +
                '50,Pixel 9,Google,GO-1049,1150,67,4.0,5.6,5538,12,256,16,Yes,Smartphones',
        },
        {
            blueprint_name: 'Cities Game',
            agent_name: 'Cities Agent',
            agent_instructions:
                'You are an agent to play in Cities with the user. User will write you the name of the city. You have to write back the name starting with the last letter of the city name user has provided. Then user have to do the same, and vice versa, until no more options left, or user surrenders.',
            email_action: false,
            http_request_action: false,
            kb_required: false,
            kb_filename: null,
            kb_content: null,
        },
        {
            blueprint_name: 'Joke Agent',
            agent_name: 'Joke Agent',
            agent_instructions:
                'You are an agent to tell a joke to the user. Whatever the user will say - try to make a corresponding joke. Do not ask for any clarification, just generate the best joke you can.',
            email_action: false,
            http_request_action: false,
            kb_required: false,
            kb_filename: null,
            kb_content: null,
        },
        {
            blueprint_name: 'Barista',
            agent_name: 'Barista Agent',
            agent_instructions:
                'Rules: \n\n' +
                ' - You are a coffee maker agent who is to take an order from customer and to submit send it over email in a human-readable format for further processing\n' +
                ' - The email address is example@example.com. You can send it using the action available for you as an agent.\n' +
                ' - Once the order is taken - please first send the email, then reply to user that the preparation of the coffee has been started\n\n' +
                'Coffee machine supports the following coffee types:\n' +
                ' - espresso\n' +
                ' - americano\n' +
                ' - latte\n' +
                ' - cappuccino\n\n' +
                'the cup size is: \n' +
                ' - 40 ml (for espresso only)\n' +
                ' - 150 ml\n' +
                ' - 250 ml\n' +
                ' - 350 ml\n\n' +
                'Sugar amount:\n' +
                ' - 0\n' +
                ' - 1 spoon\n' +
                ' - 2 spoons\n' +
                ' - 3 spoons',
            email_action: true,
            http_request_action: false,
            kb_required: false,
            kb_filename: null,
            kb_content: null,
        },
        {
            blueprint_name: 'YouAgentMe Help',
            agent_name: 'YouAgentMe Help Agent',
            agent_instructions:
                'You are the agent consulting the user on the features of the web service\n' +
                'Service Name: youagent.me\n' +
                'Service Functions:\n' +
                ' - Create AI Agent\n' +
                ' - Edit AI Agent\n' +
                ' - Deploy the chat with the ai agent to be publicly available through the pre-signed URL\n' +
                ' - Revoke the deployment of AI Agent\n' +
                ' - Delete AI Agent\n' +
                'The agent has the following attributes:\n' +
                ' - Name\n' +
                ' - Instructions\n' +
                ' - Knowledge Base file [optional]\n' +
                ' - HTTP request action (true/false) [optional]\n' +
                ' - Email Action (true/false) [optional]\n' +
                'The agent chats with the end user according to the functions provided by the youagent.me user.\n' +
                'The service has the following payment plans:\n' +
                '1) Free\n' +
                ' - Unlimited agents\n' +
                ' - Up to 200 requests (messages) per month (for all agents of the user)\n' +
                ' - $0/month\n' +
                '2) Personal\n' +
                ' - Unlimited agents\n' +
                ' - Up to 10,000 requests (messages) per month (for all agents of the user)\n' +
                ' - $10/month\n' +
                '3) Custom\n' +
                ' - Unlimited agents\n' +
                ' - Number of requests is negotiable\n' +
                ' - Price is negotiable\n\n' +
                'If user would like to upgrade to either Personal or Custom plan - please propose his to create the plan upgrade request. Collect first and last name of the user and his email address. And send the request details to sergei.nntu@gmail.com and to user\'s email address.',
            email_action: true,
            http_request_action: false,
            kb_required: false,
            kb_filename: null,
            kb_content: null,
        },
    ];

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

    const fetchAgentStatus = async (agentId: string): Promise<string> => {
        try {
            const token = getAuthToken();
            const user_id = user?.id;
            if (!user_id) throw new Error('user_id отсутствует');
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/get-agent-status`,
                { agentId, user_id },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            return response.data.statusInDb || 'UNKNOWN';
        } catch (error: any) {
            console.error('Ошибка при получении статуса агента:', error);
            throw error;
        }
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

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewAgent({ name: '', instructions: '' });
        setErrorMessage(null);
        setEnableHttpAction(false);
        setEnableEmailAction(false);
        setNewFile(null);
        setSelectedBlueprint('');
        setInitialKnowledgeBaseFile(null);
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

        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            const user_id = getUserIdFromToken(token);
            const blueprint = blueprints.find((b) => b.blueprint_name === selectedBlueprint);
            const fileData = newFile ? await convertFileToBase64(newFile) : blueprint?.kb_content ? `data:text/plain;base64,${btoa(blueprint.kb_content)}` : null;
            const fileName = newFile ? newFile.name : blueprint?.kb_filename || null;

            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/create-agent`,
                JSON.stringify({
                    name: sanitizedName,
                    instructions: newAgent.instructions,
                    user_id,
                    enableHttpAction,
                    enableEmailAction,
                    file: fileData,
                    fileName,
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

            await createAlias(createdAgentId, sanitizedName);
            const agentsData = await fetchAgents();
            setAgents(agentsData);
            handleCloseAddDialog();
        } catch (error: any) {
            console.error('Ошибка при создании агента или алиаса:', error);
            setErrorMessage(
                error.message === 'Токен авторизации отсутствует в куки'
                    ? 'Пожалуйста, войдите в систему'
                    : `Ошибка при создании агента или алиаса: ${error.message || 'Неизвестная ошибка'}`
            );
        } finally {
            setGlobalLoading(false);
        }
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
                                                            backgroundColor: '#f5f5f5',
                                                            fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                            py: 1,
                                                            wordBreak: 'break-word',
                                                            textAlign: 'left',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem',
                                                                textAlign: 'left',
                                                            }}
                                                        >
                                                            <strong>Public link:</strong>{' '}
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
                                page
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

                    <TermsAndConditionAcceptanceDialog {...{isUserLoggedIn: !!user}}/>

                    <Dialog
                        open={openAddDialog}
                        onClose={handleCloseAddDialog}
                        fullWidth
                        maxWidth={deviceType === 'mobile' ? 'xs' : 'sm'}
                    >
                        <DialogTitle
                            sx={{
                                fontSize: deviceType === 'mobile' ? '1.25rem' : deviceType === 'tablet' ? '1.375rem' : '1.25rem',
                                textAlign: 'left',
                            }}
                        >
                            Add new agent
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
                                variant="h6"
                                sx={{
                                    mb: 2,
                                    fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.1rem',
                                    textAlign: 'left',
                                }}
                            >
                                Blueprints
                            </Typography>
                            <Select
                                value={selectedBlueprint}
                                onChange={(e) => {
                                    const blueprintName = e.target.value as string;
                                    const blueprint = blueprints.find((b) => b.blueprint_name === blueprintName);
                                    if (blueprint) {
                                        setNewAgent({ name: blueprint.agent_name, instructions: blueprint.agent_instructions });
                                        setEnableHttpAction(blueprint.http_request_action);
                                        setEnableEmailAction(blueprint.email_action);
                                        setNewFile(null);
                                        setInitialKnowledgeBaseFile(blueprint.kb_filename ? `Preloaded: ${blueprint.kb_filename}` : null);
                                    } else {
                                        setNewAgent({ name: '', instructions: '' });
                                        setEnableHttpAction(false);
                                        setEnableEmailAction(false);
                                        setInitialKnowledgeBaseFile(null);
                                    }
                                    setSelectedBlueprint(blueprintName);
                                }}
                                fullWidth
                                displayEmpty
                                sx={{
                                    mb: 2,
                                    '& .MuiSelect-select': {
                                        fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                        textAlign: 'left',
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <em>Select a blueprint</em>
                                </MenuItem>
                                {blueprints.map((blueprint) => (
                                    <MenuItem key={blueprint.blueprint_name} value={blueprint.blueprint_name}>
                                        {blueprint.blueprint_name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {initialKnowledgeBaseFile && (
                                <Typography
                                    variant="caption"
                                    color="textSecondary"
                                    sx={{
                                        mb: 2,
                                        display: 'block',
                                        fontSize: deviceType === 'mobile' ? '0.8rem' : deviceType === 'tablet' ? '0.85rem' : '0.8rem',
                                        textAlign: 'left',
                                    }}
                                >
                                    <strong>Preloaded Knowledge Base:</strong>{' '}
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const blueprint = blueprints.find((b) => b.blueprint_name === selectedBlueprint);
                                            if (blueprint) downloadBlueprintKnowledgeBase(blueprint);
                                        }}
                                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        {initialKnowledgeBaseFile}
                                    </a>
                                </Typography>
                            )}
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
                                value={newAgent.name}
                                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                                helperText="Use only letters, digits, _ or -"
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
                                value={newAgent.instructions}
                                onChange={(e) => setNewAgent({ ...newAgent, instructions: e.target.value })}
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
                                    control={<Checkbox checked={enableHttpAction} onChange={(e) => setEnableHttpAction(e.target.checked)} />}
                                    label="Enable HTTP-action"
                                    sx={{ '& .MuiTypography-root': { fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' } }}
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={enableEmailAction} onChange={(e) => setEnableEmailAction(e.target.checked)} />}
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
                            <input
                                type="file"
                                accept=".pdf,.txt"
                                onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)}
                                style={{
                                    margin: '16px 0',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem',
                                }}
                            />
                            <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{
                                    fontSize: deviceType === 'mobile' ? '0.8rem' : deviceType === 'tablet' ? '0.85rem' : '0.8rem',
                                    textAlign: 'left',
                                }}
                            >
                                Upload a file (PDF or TXT) to create a knowledge base. If the file is not selected, the knowledge base will not be created or will use the preloaded blueprint knowledge base.
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'center' }}>
                            <Button
                                onClick={handleCloseAddDialog}
                                color="primary"
                                sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddAgent}
                                color="primary"
                                sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}
                            >
                                Add
                            </Button>
                        </DialogActions>
                    </Dialog>

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
                                    <IconButton onClick={() => setChatOpen(false)} sx={{ mr: 1 }}>
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
                {user && (
                    <ChatWidget
                        agents={agents.map(a => ({ id: a.id, name: a.name, agent_id: a.agent_id, alias_id: a.alias_id, public_url: a.public_url }))}
                        onOpenChat={(agent) => {
                            // найдем полного агента по id и вызовем существующий handleOpenChat
                            const full = agents.find(x => x.id === agent.id);
                            if (full) handleOpenChat(full);
                        }}
                        openPublicUrl={true} // опция — покажет иконку для открытия public_url (если он есть)
                    />
                )}
            </Box>
        </>
    );
};

export default App;