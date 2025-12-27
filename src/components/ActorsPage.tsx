import React, {useEffect, useState} from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Alert,
    useMediaQuery,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    IconButton,
    Paper,
    TableContainer
} from '@mui/material';
import ActorRow, {type Actor } from './ActorRow';
import ChatWindow from './ChatWindow';
import { type MessageModel } from '@chatscope/chat-ui-kit-react';
import axios from "axios";
import {useCookies} from "react-cookie";
import AppNavbar from "./AppNavbar.tsx";
import AddActorsDialog from "./CreateActors.tsx";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// Обновленный интерфейс согласно твоему JSON ответу
export interface Actor {
    id: number;
    created_at: string;
    user_id: string;
    name: string;
    instructions: string;
    public_url: string | null;
    actor_id: string;
    key: string; // API Key (Credentials)
    call_count: number; // Вызовы в месяц
    call_count_year: number; // Вызовы в год
}
interface SettingsProps {
    user: any,
    toggleDrawer: () => void,
    handleSignOut: () => void,
    setGlobalLoading: (state: any) => void
    openAddDialogRequest?: boolean,
    onClearAddDialogRequest?: () => void,
}
const ActorsPage: React.FC<SettingsProps> = ({user, toggleDrawer, handleSignOut, setGlobalLoading, openAddDialogRequest, onClearAddDialogRequest}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
    const [cookies] = useCookies(['authToken', 'isAnonymous']);
    // UI State
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    // Состояния для диалога успешного деплоя
    const [deploySuccessDialogOpen, setDeploySuccessDialogOpen] = useState(false);
    const [deployedPublicUrl, setDeployedPublicUrl] = useState('');
    const [deployedApkKey, setDeployedApkKey] = useState('');
    const [selectedActorToEdit, setSelectedActorToEdit] = useState<Actor | null>(null);
    const [actors, setActors] = useState<Actor[]>([]);
    // Chat State
    const [chatOpen, setChatOpen] = useState(false);
    const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
    const [chatMessages, setChatMessages] = useState<MessageModel[]>([]);
    const getAuthToken = (): string => {
        const token = cookies.authToken;
        if (!token) {
            throw new Error('The authorization token is missing from the cookie');
        }
        return token;
    };
    const fetchActors = async (): Promise<Actor[]> => {
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/actors`,
                { user_id: user?.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const actorsData = response.data.actors || [];
            console.log("Fetched actors:", actorsData);
            return actorsData;
        } catch (error: any) {
            console.error('Error receiving actors:', error);
            setErrorMessage(
                error.message === 'The authorization token is missing from the cookie'
                    ? 'Please log in.'
                    : 'Failed to load actors'
            );
            return [];
        }
    };
    useEffect(() => {
        if (user) {
            const loadActors = async () => {
                const actorsData = await fetchActors();
                setActors(actorsData);
            };
            loadActors();
            const interval = setInterval(loadActors, 15000); // Автообновление статистики каждые 15 сек
            return () => clearInterval(interval);
        }
    }, [user]);
    useEffect(() => {
        if (openAddDialogRequest === true) {
            setSelectedActorToEdit(null);
            setOpenAddDialog(true);
            if (onClearAddDialogRequest) onClearAddDialogRequest();
        }
    }, [openAddDialogRequest]);
    const handleEditActor = (actor: Actor) => {
        setSelectedActorToEdit(actor);
        setOpenAddDialog(true);
    };
    const handleOpenCreateDialog = () => {
        setSelectedActorToEdit(null);
        setOpenAddDialog(true);
    };
    const handleCloseDialog = () => {
        setOpenAddDialog(false);
        setSelectedActorToEdit(null);
        setErrorMessage(null);
    };
    const handleDeployActor = async (actor: Actor) => {
        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/deploy-chat`,
                { actorId: actor.actor_id, user_id: user?.id },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            const { publicUrl, apkKey } = response.data;
            setDeployedPublicUrl(publicUrl);
            setDeployedApkKey(apkKey);
            setDeploySuccessDialogOpen(true);
            // Обновляем URL и Ключ в списке локально
            setActors((prev) => prev.map((a) =>
                (a.actor_id === actor.actor_id ? { ...a, public_url: publicUrl, key: apkKey } : a)
            ));
        } catch (error: any) {
            console.error('Error deploying:', error);
            setErrorMessage(`Deployment error: ${error.message || 'Unknown error'}`);
        } finally {
            setGlobalLoading(false);
        }
    };
    const handleCopyUrl = () => {
        navigator.clipboard.writeText(deployedPublicUrl);
    };
    const handleRevokeActor = (actor: Actor) => {
        // При отзыве обнуляем публичный URL локально
        setActors(actors.map(a => a.actor_id === actor.actor_id ? { ...a, public_url: null } : a));
    };
    const handleOpenChat = (actor: Actor) => {
        setSelectedActor(actor);
        setChatMessages([]);
        setChatOpen(true);
    };
    const handleSendMessage = (text: string, file?: File | null) => {
        if (!text.trim() && !file) return;
        const userMsg: MessageModel = {
            message: text,
            sentTime: new Date().toISOString(),
            sender: 'user',
            direction: 'outgoing',
            position: 'single',
        };
        setChatMessages(prev => [...prev, userMsg]);
        setTimeout(() => {
            const botMsg: MessageModel = {
                message: `I am ${selectedActor?.name}. How can I help you?`,
                sentTime: new Date().toISOString(),
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };
            setChatMessages(prev => [...prev, botMsg]);
        }, 1000);
    };
    const handleDeleteActor = async (actor: Actor) => {
        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/delete-actors`,
                { user_id: user?.id, actor_id: actor.actor_id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setActors(await fetchActors());
        } catch (error: any) {
            setErrorMessage(`Error deleting actor: ${error.message}`);
        } finally {
            setGlobalLoading(false);
        }
    };
    return (
        <Box sx={{ mt: isMobile ? 2 : 4, width: '100%' }}>
            <AppNavbar
                deviceType={deviceType}
                onToggleDrawer={toggleDrawer}
                onSignOut={handleSignOut}
                page="Actors"
                createLabel="Actor"
                onCreate={handleOpenCreateDialog}
            />
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2, mx: 2 }}>{errorMessage}</Alert>
            )}
            <TableContainer component={Paper} sx={{ mx: isMobile ? 0 : 2, width: 'auto', boxShadow: 'none' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: 'grey' }}>Actor</TableCell>
                            {!isMobile && <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', color: 'grey' }}>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {actors.length > 0 ? (
                            actors.map((actor) => (
                                <ActorRow
                                    key={actor.actor_id || actor.id}
                                    actor={actor}
                                    deviceType={deviceType}
                                    onEdit={handleEditActor}
                                    onDelete={handleDeleteActor}
                                    onDeploy={handleDeployActor}
                                    onRevoke={handleRevokeActor}
                                    onChat={handleOpenChat}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={isMobile ? 1 : 3} sx={{ py: 3, textAlign: 'center' }}>
                                    <Typography color="textSecondary">No actors found.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Success Deployment Dialog */}
            <Dialog
                open={deploySuccessDialogOpen}
                onClose={() => setDeploySuccessDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Deployment Successful!</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                        Your chat actor is now live. Use the credentials below to integrate it.
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Public Chat URL</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                        <TextField
                            fullWidth
                            variant="filled"
                            size="small"
                            value={deployedPublicUrl}
                            InputProps={{ readOnly: true, disableUnderline: true }}
                            sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }}
                        />
                        <IconButton onClick={handleCopyUrl} color="primary">
                            <ContentCopyIcon />
                        </IconButton>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>API Access Key (APK)</Typography>
                    <TextField
                        fullWidth
                        variant="filled"
                        size="small"
                        value={deployedApkKey}
                        InputProps={{ readOnly: true, disableUnderline: true }}
                        sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => setDeploySuccessDialogOpen(false)}
                        variant="contained"
                        fullWidth
                    >
                        Got it
                    </Button>
                </DialogActions>
            </Dialog>
            <ChatWindow
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                title={selectedActor ? `Chat with ${selectedActor.name}` : 'Chat'}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                deviceType={deviceType}
            />
            <AddActorsDialog
                open={openAddDialog}
                onClose={handleCloseDialog}
                onAddActor={() => {
                    setOpenAddDialog(false);
                    fetchActors().then(setActors);
                }}
                deviceType={deviceType}
                getAuthToken={getAuthToken}
                userId={user?.id || ''}
                setGlobalLoading={setGlobalLoading}
                setErrorMessage={setErrorMessage}
                setActors={setActors}
                fetchActors={fetchActors}
                actorToEdit={selectedActorToEdit}
            />
        </Box>
    );
};
export default ActorsPage;