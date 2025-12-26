import React, { useState } from 'react';
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
    TextField,
    DialogActions,
    Button,
    Typography
} from '@mui/material';
import ActorRow, { type Actor } from './ActorRow';
import ChatWindow from './ChatWindow';
import { type MessageModel } from '@chatscope/chat-ui-kit-react';
import axios from "axios";

interface Agent {
    key: React.ReactNode;
    id: string;
    user_id: string;
    name: string;
    instructions: string;
    created_at: string;
    public_url?: string;
    call_count?: number;
    call_count_year?: number;
}

const ActorsPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    const fetchAtors = async (): Promise<Agent[]> => {
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
                    ? 'Please log in.'
                    : 'Failed to load agents'
            );
            return [];
        }
    };
    // UI State
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newActorData, setNewActorData] = useState({ name: '', instructions: '' });

    // Chat State
    const [chatOpen, setChatOpen] = useState(false);
    const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
    const [chatMessages, setChatMessages] = useState<MessageModel[]>([]);

    // --- Actions ---

    const handleAddActor = () => {
        if (!newActorData.name || !newActorData.instructions) {
            setErrorMessage("Name and instructions are required.");
            return;
        }
        const newActor: Actor = {
            id: Date.now(),
            created_at: new Date().toISOString(),
            user_id: 'current',
            name: newActorData.name,
            instructions: newActorData.instructions,
            public_url: null,
            actor_id: `act_${Date.now()}`,
            api_key: `pk_${Date.now()}`
        };
        setActors([...actors, newActor]);
        setOpenAddDialog(false);
        setNewActorData({ name: '', instructions: '' });
        setErrorMessage(null);
    };

    const handleDeleteActor = (actor: Actor) => {
        if (window.confirm(`Delete ${actor.name}?`)) {
            setActors(actors.filter(a => a.id !== actor.id));
        }
    };

    const handleEditActor = (actor: Actor) => {
        const newName = prompt("Update Name:", actor.name);
        if (newName) {
            setActors(actors.map(a => a.id === actor.id ? { ...a, name: newName } : a));
        }
    };

    const handleDeployActor = (actor: Actor) => {
        const mockUrl = `https://actors.example.com/public/${actor.id}`;
        setActors(actors.map(a => a.id === actor.id ? { ...a, public_url: mockUrl } : a));
    };

    const handleRevokeActor = (actor: Actor) => {
        setActors(actors.map(a => a.id === actor.id ? { ...a, public_url: null } : a));
    };

    // --- Chat Logic ---

    const handleOpenChat = (actor: Actor) => {
        setSelectedActor(actor);
        setChatMessages([]); // Clear previous chat
        setChatOpen(true);
    };

    const handleSendMessage = (text: string, file?: File | null) => {
        if (!text.trim() && !file) return;

        // 1. Add User Message
        const userMsg: MessageModel = {
            message: text,
            sentTime: new Date().toISOString(),
            sender: 'user',
            direction: 'outgoing',
            position: 'single',
            // @ts-ignore - custom field for file display
            attachedFileName: file ? file.name : undefined
        };
        setChatMessages(prev => [...prev, userMsg]);

        // 2. Mock Bot Response
        setTimeout(() => {
            const botMsg: MessageModel = {
                message: `I am ${selectedActor?.name}. I received your message: "${text}" ${file ? `and file: ${file.name}` : ''}`,
                sentTime: new Date().toISOString(),
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };
            setChatMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    return (
        <Box
            sx={{
                mt: isMobile ? 2 : isTablet ? 3 : 4,
                width: '100%',
                overflowX: 'hidden',
            }}
        >
            {/* Error Message */}
            {errorMessage && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2,
                        width: '100%',
                        fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '0.9rem',
                        textAlign: 'left',
                    }}
                >
                    {errorMessage}
                </Alert>
            )}

            {/* Main Table */}
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
                                    fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '1rem',
                                    width: isMobile ? '100%' : '80%',
                                    textAlign: 'left',
                                }}
                            >
                                Actor
                            </TableCell>
                            {!isMobile && (
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        color: 'grey',
                                        fontSize: isTablet ? '0.95rem' : '1rem',
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
                        {actors.length > 0 ? (
                            actors.map((actor) => (
                                <ActorRow
                                    key={actor.id}
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
                                <TableCell colSpan={isMobile ? 1 : 2} sx={{ textAlign: 'left' }}>
                                    No actors.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Box>

            {/* Chat Interface - Separated File */}
            <ChatWindow
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                title={selectedActor ? `Chat with ${selectedActor.name}` : 'Chat'}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                deviceType={deviceType}
            />

            {/* Dialogs (Add Actor, etc.) would go here or be managed by parent */}
            {/* For demonstration, a simple button to trigger the hidden dialog state */}
            {/* <Button onClick={() => setOpenAddDialog(true)}>Add Actor (Debug)</Button> */}

            <Dialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                fullWidth
                maxWidth={isMobile ? 'xs' : 'sm'}
            >
                <DialogTitle sx={{ textAlign: 'left' }}>Add Actor</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={newActorData.name}
                        onChange={(e) => setNewActorData({ ...newActorData, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Instructions"
                        fullWidth
                        multiline
                        rows={3}
                        value={newActorData.instructions}
                        onChange={(e) => setNewActorData({ ...newActorData, instructions: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddActor}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ActorsPage;