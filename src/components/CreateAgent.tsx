import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    Typography,
    Divider,
    Select,
    MenuItem,
    Box,
    type SelectChangeEvent,
} from '@mui/material';
import axios from 'axios';
import { useTour } from '@reactour/tour';

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

interface AddAgentDialogProps {
    open: boolean;
    onClose: () => void;
    onAddAgent: () => void;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    getAuthToken: () => string;
    userId: string;
    setGlobalLoading: (loading: boolean) => void;
    setErrorMessage: (message: string | null) => void;
    fetchAgents: () => Promise<any[]>;
    setAgents: (agents: any[]) => void;
    setAgentCreated: (value: boolean) => void;
}

const AddAgentDialog: React.FC<AddAgentDialogProps> = ({
                                                           open,
                                                           onClose,
                                                           onAddAgent,
                                                           deviceType,
                                                           getAuthToken,
                                                           userId,
                                                           setGlobalLoading,
                                                           setErrorMessage,
                                                           fetchAgents,
                                                           setAgentCreated,
                                                       }) => {
    const [newAgent, setNewAgent] = useState({ name: '', instructions: '' });
    const [enableHttpAction, setEnableHttpAction] = useState(false);
    const [enableEmailAction, setEnableEmailAction] = useState(false);
    const [newFile, setNewFile] = useState<File | null>(null);
    const [selectedBlueprint, setSelectedBlueprint] = useState<string>('');
    const [blueprintInteracted, setBlueprintInteracted] = useState(false);

    const skipBlueprintRef = useRef<() => void>(() => {});
    const tour = useTour() as any; // reactour typings vary; cast to any for flexibility

    const blueprints: Blueprint[] = [
        // ... (blueprints array unchanged from your provided code)
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
            kb_content: '...', // Truncated for brevity; use your original content
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

    // helpers
    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const createAlias = async (agentId: string, agentName: string) => {
        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/create-alias`,
                { agentId, agentName, user_id: userId },
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

    const fetchAgentStatus = async (agentId: string): Promise<string> => {
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/get-agent-status`,
                { agentId, user_id: userId },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            return response.data.statusInDb || 'UNKNOWN';
        } catch (error: any) {
            console.error('Ошибка при получении статуса агента:', error);
            throw error;
        }
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

        setGlobalLoading(true);
        try {
            const token = getAuthToken();
            const blueprint = blueprints.find((b) => b.blueprint_name === selectedBlueprint);
            const fileData = newFile
                ? await convertFileToBase64(newFile)
                : blueprint?.kb_content
                    ? `data:text/plain;base64,${btoa(blueprint.kb_content || '')}`
                    : null;

            const agentResponse = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/create-agent`,
                JSON.stringify({
                    name: sanitizedName,
                    instructions: newAgent.instructions,
                    user_id: userId,
                    enableHttpAction,
                    enableEmailAction,
                    enableUserInputAction: true,
                }),
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            const createdAgentId = agentResponse.data.agentId;
            if (!createdAgentId) throw new Error('agentId not received in response');

            let knowledgeBaseId = null;
            if (fileData) {
                const kbResponse = await axios.post(
                    `${import.meta.env.VITE_API_GATEWAY_URL}/create-knowledgebase`,
                    JSON.stringify({
                        agentId: createdAgentId,
                        fileData,
                        user_id: userId,
                    }),
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );

                knowledgeBaseId = kbResponse.data.knowledgeBaseId;
                if (!knowledgeBaseId) throw new Error('knowledgeBaseId not received in response');
            }

            const waitForPrepared = async (agentId: string) => {
                for (let i = 0; i < 20; i++) {
                    const status = await fetchAgentStatus(agentId);
                    if (status === 'PREPARED') return true;
                    await new Promise((r) => setTimeout(r, 4000));
                }
                return false;
            };

            const isPrepared = await waitForPrepared(createdAgentId);
            if (!isPrepared) throw new Error('Agent status did not become PREPARED');

            await createAlias(createdAgentId, sanitizedName);
            const updatedAgents = await fetchAgents();
            setAgents(updatedAgents);

            onAddAgent();

        } catch (error: any) {
            console.error('Error creating agent or knowledge base:', error);
            setErrorMessage(
                error.message === 'Authorization token missing in cookies'
                    ? 'Please log in'
                    : `Error creating agent or knowledge base: ${error.message || 'Unknown error'}`
            );
        } finally {
            setGlobalLoading(false);
        }
    };

    // This function will be used by both onChange and MenuItem.onClick
    const handleBlueprintSelect = (blueprintName: string) => {
        const selected = blueprints.find((b) => b.blueprint_name === blueprintName);

        if (selected) {
            setNewAgent({ name: selected.agent_name, instructions: selected.agent_instructions });
            setEnableHttpAction(selected.http_request_action);
            setEnableEmailAction(selected.email_action);
            setNewFile(null);
        } else {
            // Custom agent
            setNewAgent({ name: '', instructions: '' });
            setEnableHttpAction(false);
            setEnableEmailAction(false);
            setNewFile(null);
        }

        // Обновляем состояние селекта и флаг взаимодействия
        setSelectedBlueprint(blueprintName);
        setBlueprintInteracted(true);

        // Если выбран Custom (пустая строка) — используем skipBlueprint (сброс + переход).
        // Для всех остальных — просто продвигаем тур на шаг 4.
        if (blueprintName === '') {
            if (skipBlueprintRef.current && typeof skipBlueprintRef.current === 'function') {
                try {
                    // skipBlueprint обычно сам делает tour.setCurrentStep(4)
                    skipBlueprintRef.current();
                } catch (e) {
                    /* ignore */
                }
            } else if (tour && typeof tour.setCurrentStep === 'function') {
                // Небольшая задержка, чтобы селект закрылся/состояние обновилось
                setTimeout(() => {
                    try {
                        tour.setCurrentStep(4);
                    } catch (e) {
                        /* ignore */
                    }
                }, 120);
            }
        } else {
            // Для НЕ-Custom: просто двигаем тур на следующий шаг через таймаут,
            // чтобы меню успело закрыться и состояние окончательно обновилось.
            if (tour && typeof tour.setCurrentStep === 'function') {
                setTimeout(() => {
                    try {
                        tour.setCurrentStep(4);
                    } catch (e) {
                        /* ignore */
                    }
                }, 120);
            }
        }
    };


    // skipBlueprint: reset the select to custom and move tour forward
    const skipBlueprint = () => {
        setSelectedBlueprint('');
        setNewAgent({ name: '', instructions: '' });
        setEnableHttpAction(false);
        setEnableEmailAction(false);
        setNewFile(null);
        setBlueprintInteracted(true);
        try {
            tour.setCurrentStep(4);
        } catch (e) {
            // ignore
        }
    };

    useEffect(() => {
        if (open && typeof setAgentCreated === 'function') {
            setAgentCreated(false);
        }
    }, [open, setAgentCreated]);

    useEffect(() => {
        skipBlueprintRef.current = skipBlueprint;
    }, [skipBlueprint]);

    useEffect(() => {
        // expose flags to the tour instance so parent/provider may read them
        try {
            tour.blueprintInteracted = blueprintInteracted;
            tour.skipBlueprint = () => skipBlueprintRef.current();
        } catch (e) {
            // ignore if tour object shape differs
        }
    }, [blueprintInteracted, tour]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={deviceType === 'mobile' ? 'xs' : 'sm'}>
            <DialogTitle sx={{ fontSize: deviceType === 'mobile' ? '1.25rem' : '1.375rem', textAlign: 'left' }}>
                Добавить нового агента
            </DialogTitle>

            <DialogContent sx={{ textAlign: 'left', overflowX: 'hidden' }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'left' }}>
                    Шаблон
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Select
                        value={selectedBlueprint}
                        onChange={(e: SelectChangeEvent<string>) => handleBlueprintSelect(e.target.value as string)}
                        fullWidth
                        data-tour="blueprint-select"
                        displayEmpty
                        MenuProps={{ PaperProps: { id: 'blueprint-menu' } }}
                        onOpen={() => {
                            setTimeout(() => {
                                try {
                                    tour.setCurrentStep(3);
                                } catch (e) {
                                    // ignore
                                }
                            }, 80);
                        }}
                        sx={{
                            '& .MuiSelect-select': {
                                fontSize: deviceType === 'mobile' ? '0.9rem' : '0.95rem',
                                textAlign: 'left',
                            },
                        }}
                    >
                        <MenuItem
                            value=""
                            onClick={() => {
                                // onClick will fire even if the value is already '' — this catches repeated selection
                                handleBlueprintSelect('');
                            }}
                        >
                            <em>Custom agent</em>
                        </MenuItem>

                        {blueprints.map((blueprint) => (
                            <MenuItem
                                key={blueprint.blueprint_name}
                                value={blueprint.blueprint_name}
                                onClick={() => handleBlueprintSelect(blueprint.blueprint_name)}
                            >
                                {blueprint.blueprint_name}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                <Typography variant="h6" sx={{ mb: 2, textAlign: 'left' }}>
                    Общие настройки
                </Typography>

                <TextField
                    autoFocus
                    margin="dense"
                    label="Имя"
                    type="text"
                    data-tour="name-input"
                    fullWidth
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    helperText="Используйте только буквы, цифры, _ или -"
                    sx={{ mb: 2 }}
                />

                <TextField
                    margin="dense"
                    label="Инструкции"
                    type="text"
                    fullWidth
                    data-tour="instructions-input"
                    multiline
                    rows={deviceType === 'mobile' ? 3 : 4}
                    value={newAgent.instructions}
                    onChange={(e) => setNewAgent({ ...newAgent, instructions: e.target.value })}
                    helperText="Минимальная длина 40 символов"
                    sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }} data-tour="actions-checkboxes">
                    <FormControlLabel
                        control={<Checkbox checked={enableHttpAction} onChange={(e) => setEnableHttpAction(e.target.checked)} />}
                        label="Включить HTTP-действие"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={enableEmailAction} onChange={(e) => setEnableEmailAction(e.target.checked)} />}
                        label="Включить Email-действие"
                    />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ mb: 1 }}>
                    База знаний (опционально)
                </Typography>

                <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)}
                    style={{ margin: '16px 0', width: '100%' }}
                    data-tour="kb-section"
                />

                <Typography variant="caption" color="textSecondary">
                    Загрузите файл (PDF или TXT) для создания базы знаний для агента.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button onClick={onClose} color="primary">
                    Отмена
                </Button>
                <Button data-tour="add-agent-button" onClick={handleAddAgent} color="primary">
                    Добавить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddAgentDialog;
