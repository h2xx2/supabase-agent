import React from 'react';
import {
    TableRow,
    TableCell,
    Box,
    Typography,
    Link,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface Actor {
    id: number;
    created_at: string;
    user_id: string;
    actor_id: string;
    name: string;
    instructions: string;
    public_url?: string | null;
    key: string;
    call_count: number;
    call_count_year: number;
}

interface ActorRowProps {
    actor: Actor;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    onEdit: (actor: Actor) => void;
    onDelete: (actor: Actor) => void;
    onDeploy: (actor: Actor) => void;
    onRevoke: (actor: Actor) => void;
    onChat: (actor: Actor) => void;
}

const ActorRow: React.FC<ActorRowProps> = ({
                                               actor,
                                               deviceType,
                                               onEdit,
                                               onDelete,
                                               onDeploy,
                                               onRevoke,
                                               onChat
                                           }) => {
    const isMobile = deviceType === 'mobile';
    const isTablet = deviceType === 'tablet';

    const ActionButtons = () => (
        <>
            <Button
                variant="contained"
                color="primary"
                onClick={() => onChat(actor)}
                sx={{
                    fontSize: isMobile ? '0.8rem' : isTablet ? '0.85rem' : '0.9rem',
                    px: isMobile ? 1 : isTablet ? 1.5 : 2,
                    py: isMobile ? 0.5 : isTablet ? 0.75 : 1,
                    minWidth: isMobile ? 80 : undefined,
                    width: !isMobile ? (isTablet ? 140 : 160) : undefined,
                    height: isMobile ? 32 : undefined,
                }}
            >
                Chat
            </Button>
            {!actor.public_url ? (
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => onDeploy(actor)}
                    sx={{
                        fontSize: isMobile ? '0.8rem' : isTablet ? '0.85rem' : '0.9rem',
                        px: isMobile ? 1 : isTablet ? 1.5 : 2,
                        py: isMobile ? 0.5 : isTablet ? 0.75 : 1,
                        minWidth: isMobile ? 80 : undefined,
                        width: !isMobile ? (isTablet ? 140 : 160) : undefined,
                        height: isMobile ? 32 : undefined,
                    }}
                >
                    Deploy
                </Button>
            ) : (
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => onRevoke(actor)}
                    sx={{
                        fontSize: isMobile ? '0.8rem' : isTablet ? '0.85rem' : '0.9rem',
                        px: isMobile ? 1 : isTablet ? 1.5 : 2,
                        py: isMobile ? 0.5 : isTablet ? 0.75 : 1,
                        minWidth: isMobile ? 80 : undefined,
                        width: !isMobile ? (isTablet ? 140 : 160) : undefined,
                        height: isMobile ? 32 : undefined,
                    }}
                >
                    Revoke
                </Button>
            )}
            <Button
                variant="contained"
                color="warning"
                onClick={() => onEdit(actor)}
                sx={{
                    fontSize: isMobile ? '0.8rem' : isTablet ? '0.85rem' : '0.9rem',
                    px: isMobile ? 1 : isTablet ? 1.5 : 2,
                    py: isMobile ? 0.5 : isTablet ? 0.75 : 1,
                    minWidth: isMobile ? 80 : undefined,
                    width: !isMobile ? (isTablet ? 140 : 160) : undefined,
                    height: isMobile ? 32 : undefined,
                }}
            >
                Edit
            </Button>
            <Button
                variant="contained"
                color="error"
                onClick={() => onDelete(actor)}
                sx={{
                    fontSize: isMobile ? '0.8rem' : isTablet ? '0.85rem' : '0.9rem',
                    px: isMobile ? 1 : isTablet ? 1.5 : 2,
                    py: isMobile ? 0.5 : isTablet ? 0.75 : 1,
                    minWidth: isMobile ? 80 : undefined,
                    width: !isMobile ? (isTablet ? 140 : 160) : undefined,
                    height: isMobile ? 32 : undefined,
                }}
            >
                Delete
            </Button>
        </>
    );

    return (
        <React.Fragment>
            <TableRow>
                {/* Колонка Actor — вся информация */}
                <TableCell
                    sx={{
                        fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '1rem',
                        py: 1,
                        verticalAlign: 'top',
                        textAlign: 'left',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? 1 : isTablet ? 1.5 : 2,
                            alignItems: 'flex-start',
                        }}
                    >
                        <Box sx={{ flex: 1, width: isMobile ? '100%' : '80%' }}>
                            <Typography
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: isMobile ? '1rem' : isTablet ? '1.125rem' : '1.25rem',
                                    textAlign: 'left',
                                }}
                            >
                                {actor.name}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '1rem',
                                    color: 'text.secondary',
                                    mt: 0.5,
                                    wordBreak: 'break-word',
                                    textAlign: 'left',
                                }}
                            >
                                {actor.instructions}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '1rem',
                                    color: 'text.secondary',
                                    mt: 0.5,
                                    textAlign: 'left',
                                }}
                            >
                                <strong>Month requests count:</strong> {actor.call_count || 0}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '1rem',
                                    color: 'text.secondary',
                                    mt: 0.5,
                                    textAlign: 'left',
                                }}
                            >
                                <strong>Year requests count:</strong> {actor.call_count_year || 0}
                            </Typography>
                            {actor.public_url && (
                                <Typography
                                    sx={{
                                        fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '1rem',
                                        color: 'text.secondary',
                                        mt: 0.5,
                                        textAlign: 'left',
                                    }}
                                >
                                    <strong>Public Link:</strong>{' '}
                                    <Link
                                        href={actor.public_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ color: '#1976d2', textDecoration: 'none' }}
                                    >
                                        {actor.public_url}
                                    </Link>
                                </Typography>
                            )}
                        </Box>

                        {/* На мобильных — кнопки под информацией */}
                        {isMobile && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: 1,
                                    mt: 1,
                                    flexWrap: 'wrap',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <ActionButtons />
                            </Box>
                        )}
                    </Box>
                </TableCell>

                {/* Колонка Actions — только для tablet/desktop */}
                {!isMobile && (
                    <TableCell
                        sx={{
                            fontSize: isTablet ? '0.95rem' : '1rem',
                            py: 1,
                            verticalAlign: 'top',
                            textAlign: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: isTablet ? 1.25 : 1.5,
                                alignItems: 'center',
                            }}
                        >
                            <ActionButtons />
                        </Box>
                    </TableCell>
                )}
            </TableRow>

            {/* Аккордеоны с скриптом и API Credentials */}
            {actor.public_url && (
                <TableRow>
                    <TableCell
                        colSpan={isMobile ? 1 : 2}
                        sx={{
                            backgroundColor: 'transparent',
                            py: 1,
                            textAlign: 'left',
                        }}
                    >
                        <Accordion sx={{ mt: 0, width: '100%' }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    backgroundColor: '#f0f0f0',
                                }}
                            >
                                <Typography sx={{ fontWeight: 'bold' }}>
                                    cURL API
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ backgroundColor: '#e0e0e0', p: 1 }}>
                                <Box
                                    component="pre"
                                    sx={{
                                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        overflowX: 'auto',
                                        mb: 1,
                                        fontFamily: 'monospace',
                                        backgroundColor: '#1e1e1e', // Темный фон для кода
                                        color: '#d4d4d4',
                                        p: 2,
                                        borderRadius: 1
                                    }}
                                >
                                    {`curl -X POST ${import.meta.env.VITE_API_GATEWAY_URL}/public-send-actor \\
  -H "Content-Type: application/json" \\
  -H "Authorization: ${actor.key}" \\
  -d '{
    "message": "Hello!",
    "actor_id": "${actor.actor_id}",
    "fileBase64": "SGVsbG8gd29ybGQh",
    "fileName": "test.txt"
  }'`}
                                </Box>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        const curlCommand = `curl -X POST ${import.meta.env.VITE_API_GATEWAY_URL}/public-send-actor \\
  -H "Content-Type: application/json" \\
  -H "Authorization: ${actor.key}" \\
  -d '{
    "message": "Hello!",
    "actor_id": "${actor.actor_id}",
    "fileBase64": "SGVsbG8gd29ybGQh",
    "fileName": "test.txt"
  }'`;
                                        navigator.clipboard.writeText(curlCommand).then(() => alert('cURL command copied to clipboard!'));
                                    }}
                                >
                                    Copy cURL
                                </Button>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion sx={{ mt: 2, width: '100%' }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    backgroundColor: '#f0f0f0',
                                }}
                            >
                                <Typography sx={{ fontWeight: 'bold' }}>
                                    API Credentials
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ backgroundColor: '#e0e0e0', p: 2 }}>
                                <Box sx={{ fontFamily: 'monospace', lineHeight: 1.6, mb: 2 }}>
                                    <div><strong>ACTOR_ID</strong> = "{actor.actor_id}"</div>
                                    <div><strong>API_KEY</strong> = "{actor.key}"</div>
                                    <div><strong>API_ENDPOINT</strong> = {import.meta.env.VITE_API_GATEWAY_URL}</div>
                                </Box>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        const creds = `ACTOR_ID = "${actor.actor_id}"
API_KEY = "${actor.key}"
API_ENDPOINT = "${import.meta.env.VITE_API_GATEWAY_URL}"`;
                                        navigator.clipboard.writeText(creds).then(() => alert('API credentials copied to clipboard!'));
                                    }}
                                >
                                    Copy Credentials
                                </Button>
                            </AccordionDetails>
                        </Accordion>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
};

export default ActorRow;