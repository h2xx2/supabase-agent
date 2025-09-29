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
                                                           setAgents,
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
            kb_content: 'ID,Product Name,Brand,Model,Price (USD),Stock,Rating,Screen Size (inches),Battery (mAh),RAM (GB),Storage (GB),Camera (MP),5G,Category\n' +
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
            blueprint_name: "YouAgentMe Help",
            agent_name: "YouAgentMe Help Agent",
            agent_instructions: "You are the agent consulting the user on the features of the web service\n" +
                "Service Name: youagent.me\n" +
                "Service Functions:\n" +
                " - Create AI Agent\n" +
                " - Edit AI Agent\n" +
                " - Deploy the chat with the ai agent to be publicly available through the pre-signed URL\n" +
                " - Revoke the deployment of AI Agent \n" +
                " - Delete AI Agent\n" +
                "The agent has the following attributes:\n" +
                " - Name\n" +
                " - Instructions\n" +
                " - Knowledge Base file  [optional]\n" +
                " - HTTP request action (true/false) [optional]\n" +
                " - Email Action (true/false) [optional]\n" +
                "The agent chats with the end user according to the functions provided by the youagent.me user.\n" +
                "The service has the following payment plans:\n" +
                "1) Free\n" +
                " - Unlimited agents\n" +
                " - Up to 200 requests (messages) per month (for all agents of the user)\n" +
                " - $0/month\n" +
                "2) Personal\n" +
                " - Unlimited agents\n" +
                " - Up to 1,000 requests (messages) per month (for all agents of the user)\n" +
                " - $15/month\n" +
                "3) Custom\n" +
                " - Unlimited agents\n" +
                " - Number of requests is negotiable\n" +
                " - Custom Integrations are possible\n" +
                " - Price is negotiable \n" +
                "\nIf user would like to upgrade to either Personal or Custom plan - please propose his to create the plan upgrade request. Collect first and last name of the user and his email address. And send the request details to sergei.nntu@gmail.com and to user's email address.",
            email_action: true,
            http_request_action: false,
            kb_required: false,
            kb_filename: null,
            kb_content: null
        }
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
    const intendedTourStepRef = useRef<number | null>(null);

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
            console.error('Error creating alias:', error);
            setErrorMessage(
                error.message === 'Authorization token missing in cookies'
                    ? 'Please log in'
                    : `Error creating alias: ${error.message || 'Unknown error'}`
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
            console.error('Error fetching agent status:', error);
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
            onClose();
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
            // Add this: trigger the tour jump only after successful creation
                setAgentCreated(true);

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

        // Update select state and interaction flag
        setSelectedBlueprint(blueprintName);
        setBlueprintInteracted(true);

        // Debug logs
        console.log('Selected blueprint:', blueprintName);
        console.log('Tour state:', { isOpen: tour.isOpen, currentStep: tour.currentStep });

        // Schedule transition to step 4
        intendedTourStepRef.current = 4;

        // If "Custom agent" or another template is selected, attempt to move to step 4
        if (tour.isOpen) {
            try {
                // Check if the tour is not already on step 4
                if (tour.currentStep !== 4) {
                    tour.setCurrentStep(4);
                    console.log('Tour moved to step 4');
                } else {
                    console.log('Tour already on step 4, no change needed');
                }
                intendedTourStepRef.current = null; // Reset to avoid repeated transitions
            } catch (e) {
                console.error('Error setting tour step:', e);
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
                Add New Agent
            </DialogTitle>

            <DialogContent sx={{ textAlign: 'left', overflowX: 'hidden' }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'left' }}>
                    Template
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Select
                        value={selectedBlueprint}
                        onChange={(e: SelectChangeEvent<string>) => handleBlueprintSelect(e.target.value as string)}
                        fullWidth
                        data-tour="blueprint-select"
                        displayEmpty
                        MenuProps={{
                            PaperProps: { id: 'blueprint-menu' },
                            MenuListProps: { 'data-tour': 'blueprint-menu-list' },
                            disablePortal: true,
                        }}
                        onOpen={() => {
                            console.log('Select opened');
                            setTimeout(() => {
                                try {
                                    if (tour.isOpen && tour.currentStep !== 3) {
                                        tour.setCurrentStep(3);
                                        console.log('Tour moved to step 3');
                                    }
                                } catch (e) {
                                    console.error('Error setting tour step on open:', e);
                                }
                            }, 200);
                        }}
                        onClose={() => {
                            console.log('Select onClose triggered, intended step:', intendedTourStepRef.current);
                            if (intendedTourStepRef.current !== null && tour.isOpen) {
                                try {
                                    if (tour.currentStep !== intendedTourStepRef.current) {
                                        tour.setCurrentStep(intendedTourStepRef.current);
                                        console.log('Tour moved to step', intendedTourStepRef.current);
                                    } else {
                                        console.log('Tour already on intended step', intendedTourStepRef.current);
                                    }
                                } catch (e) {
                                    console.error('Error in Select onClose:', e);
                                } finally {
                                    intendedTourStepRef.current = null;
                                }
                            }
                        }}
                        sx={{ '& .MuiSelect-select': { fontSize: deviceType === 'mobile' ? '0.9rem' : '0.95rem', textAlign: 'left' } }}
                    >
                        <MenuItem
                            value=""
                            onClick={() => handleBlueprintSelect('')}
                            data-tour="blueprint-item-custom"
                        >
                            <em>Custom agent</em>
                        </MenuItem>
                        {blueprints.map((blueprint) => (
                            <MenuItem
                                key={blueprint.blueprint_name}
                                value={blueprint.blueprint_name}
                                onClick={() => handleBlueprintSelect(blueprint.blueprint_name)}
                                data-tour={`blueprint-item-${blueprint.blueprint_name}`}
                            >
                                {blueprint.blueprint_name}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                <Typography variant="h6" sx={{ mb: 2, textAlign: 'left' }}>
                    General Settings
                </Typography>

                <TextField
                    autoFocus
                    margin="dense"
                    label="Name"
                    type="text"
                    data-tour="name-input"
                    fullWidth
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
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
                    value={newAgent.instructions}
                    onChange={(e) => setNewAgent({ ...newAgent, instructions: e.target.value })}
                    helperText="Minimum length 40 characters"
                    sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }} data-tour="actions-checkboxes">
                    <FormControlLabel
                        control={<Checkbox checked={enableHttpAction} onChange={(e) => setEnableHttpAction(e.target.checked)} />}
                        label="Enable HTTP Action"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={enableEmailAction} onChange={(e) => setEnableEmailAction(e.target.checked)} />}
                        label="Enable Email Action"
                    />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ mb: 1 }}>
                    Knowledge Base (Optional)
                </Typography>

                <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)}
                    style={{ margin: '16px 0', width: '100%' }}
                    data-tour="kb-section"
                />

                <Typography variant="caption" color="textSecondary">
                    Upload a file (PDF or TXT) to create a knowledge base for the agent.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button data-tour="add-agent-button" onClick={handleAddAgent} color="primary">
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddAgentDialog;