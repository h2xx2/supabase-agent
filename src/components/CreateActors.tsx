import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
} from '@mui/material';
import axios from 'axios';

// Интерфейс должен совпадать с тем, что в ActorsPage
interface Actor {
    id: string | number;
    actor_id?: string; // ID из базы данных (UUID)
    name: string;
    instructions: string;
    // остальные поля...
}

interface AddActorDialogProps {
    open: boolean;
    onClose: () => void;
    onAddActor: () => void; // Вызывается для обновления списка после успеха
    deviceType: 'mobile' | 'tablet' | 'desktop';
    getAuthToken: () => string;
    userId: string;
    setGlobalLoading: (loading: boolean) => void;
    setErrorMessage: (message: string | null) => void;
    fetchActors: () => Promise<any[]>;
    setActors: (actors: any[]) => void;
    // Новый проп: если передан, значит мы в режиме редактирования
    actorToEdit?: Actor | null;
}

const AddActorsDialog: React.FC<AddActorDialogProps> = ({
                                                            open,
                                                            onClose,
                                                            onAddActor,
                                                            deviceType,
                                                            getAuthToken,
                                                            userId,
                                                            setGlobalLoading,
                                                            setErrorMessage,
                                                            fetchActors,
                                                            setActors,
                                                            actorToEdit
                                                        }) => {
    const [formData, setFormData] = useState({ name: '', instructions: '' });

    // Заполнение формы при открытии
    useEffect(() => {
        if (open) {
            if (actorToEdit) {
                // Режим редактирования
                setFormData({
                    name: actorToEdit.name || '',
                    instructions: actorToEdit.instructions || ''
                });
            } else {
                // Режим создания
                setFormData({ name: '', instructions: '' });
            }
        }
    }, [open, actorToEdit]);

    const handleSubmit = async () => {
        // 1. Валидация
        if (!formData.name.trim() || !formData.instructions.trim() || formData.instructions.length < 10) {
            setErrorMessage('Name and instructions (min. 10 characters) are required');
            return;
        }

        const sanitizedName = formData.name.replace(/[^a-zA-Z0-9_-]/g, '');
        if (!sanitizedName) {
            setErrorMessage('Invalid actor name');
            return;
        }

        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            const isEditMode = !!actorToEdit;
            const baseUrl = import.meta.env.VITE_API_GATEWAY_URL;

            // 2. Разделение запросов
            if (isEditMode && actorToEdit) {
                // --- ЗАПРОС НА ОБНОВЛЕНИЕ ---
                await axios.post(
                    `${baseUrl}/update-actors`,
                    JSON.stringify({
                        actor_id: actorToEdit.actor_id, // Используем ID актера для поиска в БД
                        id: actorToEdit.id,             // Иногда нужен и внутренний ID
                        name: sanitizedName,
                        instructions: formData.instructions,
                        user_id: userId,
                    }),
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
            } else {
                // --- ЗАПРОС НА СОЗДАНИЕ ---
                await axios.post(
                    `${baseUrl}/create-actors`,
                    JSON.stringify({
                        name: sanitizedName,
                        instructions: formData.instructions,
                        user_id: userId,
                    }),
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
            }

            // 3. Обновление списка и закрытие
            onClose();
            const updatedActors = await fetchActors();
            setActors(updatedActors);
            onAddActor();

        } catch (error: any) {
            console.error('Error saving actor:', error);
            setErrorMessage(
                error.message === 'Authorization token missing in cookies'
                    ? 'Please log in'
                    : `Error saving actor: ${error.message || 'Unknown error'}`
            );
        } finally {
            setGlobalLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={deviceType === 'mobile' ? 'xs' : 'sm'}>
            <DialogTitle sx={{ fontSize: deviceType === 'mobile' ? '1.25rem' : '1.375rem', textAlign: 'left' }}>
                {actorToEdit ? 'Edit Actor' : 'Add New Actor'}
            </DialogTitle>

            <DialogContent sx={{ textAlign: 'left', overflowX: 'hidden' }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'left' }}>
                    {actorToEdit ? 'Update Settings' : 'General Settings'}
                </Typography>

                <TextField
                    autoFocus
                    margin="dense"
                    label="Name"
                    type="text"
                    data-tour="name-input"
                    fullWidth
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    helperText="Use only letters, numbers, _ or -"
                    sx={{ mb: 2 }}
                />

                <TextField
                    margin="dense"
                    label="Instructions"
                    type="text"
                    fullWidth
                    data-tour="instructions-input"
                    multiline
                    rows={deviceType === 'mobile' ? 3 : 4}
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    helperText="Minimum length 10 characters"
                    sx={{ mb: 2 }}
                />
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button data-tour="add-actor-button" onClick={handleSubmit} color="primary">
                    {actorToEdit ? 'Save' : 'Add'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddActorsDialog;