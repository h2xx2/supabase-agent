import React, {useEffect, useRef, useState} from 'react';
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
    // Deletion State
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [actorToDelete, setActorToDelete] = useState<Actor | null>(null);
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

    const [sessionIds, setSessionIds] = useState<Record<string, string>>({});
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
                `${import.meta.env.VITE_API_GATEWAY_URL}/deploy-actors`,
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
            alert(`Public URL: ${publicUrl}\nAPK Key: ${apkKey}\nCopy it and use it for access!`);
        } catch (error: any) {
            console.error('Error deploying:', error);
            setErrorMessage(`Deployment error: ${error.message || 'Unknown error'}`);
        } finally {
            setGlobalLoading(false);
        }
    };
    const handleRevokeActor = async (actor: Actor) => {
        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/revoke-actors`,
                { actorId: actor.actor_id, user_id: user?.id },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setActors(actors.map((a) => (a.id === actor.id ? { ...a, public_url: undefined } : a)));
            await fetchActors();
        } catch (error: any) {
            console.error('Error when revoking the chat:', error);
            setErrorMessage(
                error.message === 'The authorization token is missing from the cookie'
                    ? 'Please log in'
                    : `Error when revoke chat: ${error.message || 'Unknown error'}`
            );
        } finally {
            setGlobalLoading(false);
        }
    };
    const handleCopyUrl = () => {
        navigator.clipboard.writeText(deployedPublicUrl);
    };
    const handleOpenChat = (actor: Actor) => {
        setSelectedActor(actor);
        setChatMessages([]);
        setChatOpen(true);
    };
    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };
    const handleSendMessage = async (text: string, fileFromChat?: File | null) => {
        // 1. Проверяем наличие контента (текста или файла)
        if (!text.trim() && !fileFromChat) return;
        if (!selectedActor?.actor_id) return;

        const userText = text.trim();
        const hasFile = !!fileFromChat;
        const fileNameForDisplay = fileFromChat?.name || 'file';

        // 2. Создаем сообщение для мгновенного отображения в UI
        const userMessage: MessageModel = {
            message: userText || fileNameForDisplay,
            sentTime: new Date().toISOString(),
            sender: 'user',
            direction: 'outgoing',
            position: 'single',
            // Передаем имя файла в кастомное поле для отрисовки иконки в ChatWindow
            attachedFileName: hasFile ? fileNameForDisplay : undefined,
        } as any;

        setChatMessages(prev => [...prev, userMessage]);

        // 3. Управление сессией
        let sessionId = sessionIds[selectedActor.actor_id] ||
            `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        if (!sessionIds[selectedActor.actor_id]) {
            setSessionIds(prev => ({ ...prev, [selectedActor!.actor_id]: sessionId }));
        }

        try {
            const token = getAuthToken();
            let fileBase64: string | null = null;
            let fileName: string | null = null;

            // 4. Конвертация файла, если он пришел из ChatWindow
            if (fileFromChat) {
                const dataUrl = await convertFileToBase64(fileFromChat);
                // Извлекаем чистый Base64 из DataURL
                const match = dataUrl.match(/^data:.+?;base64,(.*)$/);
                if (!match) throw new Error('Failed to encode file');
                fileBase64 = match[1];
                fileName = fileFromChat.name;
            }

            // 5. Отправка на сервер
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/send-actor`,
                {
                    message: userText,
                    actor_id: selectedActor.actor_id,
                    sessionId,
                    user_id: user?.id,
                    fileBase64, // Теперь здесь не null, если файл был выбран
                    fileName,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 6. Добавляем ответ бота
            const botMessage: MessageModel = {
                message: response.data.response,
                sentTime: new Date().toISOString(),
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };
            setChatMessages(prev => [...prev, botMessage]);

            // 7. Сохранение истории (фоновые запросы)
            await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/save-message-actor`, {
                actor_id: selectedActor.actor_id,
                session_id: sessionId,
                message: userText || `[File: ${fileName}]`,
                response: response.data.response,
                sender: 'user',
                user_id: user?.id,
            }, { headers: { Authorization: `Bearer ${token}` } });

            await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/save-call-actor`, {
                actor_id: selectedActor.actor_id,
                user_id: user?.id,
                status: 'success',
            }, { headers: { Authorization: `Bearer ${token}` } });

        } catch (error: any) {
            console.error('Error sending message:', error);

            let errorText = 'Error: Failed to send message';
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

            // Логируем ошибку вызова
            try {
                const token = getAuthToken();
                await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/save-call`, {
                    actor_id: selectedActor?.actor_id,
                    user_id: user?.id,
                    status: 'failure',
                }, { headers: { Authorization: `Bearer ${token}` } });
            } catch { /* ignore */ }
        }
    };

    const handleDeleteActor = (actor: Actor) => {
        setActorToDelete(actor);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setActorToDelete(null);
    };

    // Фактическое удаление после подтверждения
    const confirmDeleteActor = async () => {
        if (!actorToDelete) return;
        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/delete-actors`,
                { user_id: user?.id, actor_id: actorToDelete.actor_id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOpenDeleteDialog(false);
            setActorToDelete(null);
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
                        Are you sure you want to delete the agent "{actorToDelete?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        color="primary"
                        sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDeleteActor}
                        color="error"
                        sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '0.9rem' }}
                    >
                        Delete
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