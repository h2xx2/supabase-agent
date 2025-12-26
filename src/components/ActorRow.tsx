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

// Match the Interface exactly to your needs
export interface Actor {
    id: number;
    created_at: string;
    user_id: string;
    name: string;
    instructions: string;
    public_url?: string | null;
    actor_id?: string; // API ID
    api_key?: string; // API Key
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

    // Exact button styles and structure from App.tsx
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
                {/* Main Info Cell */}
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

                        {/* Mobile Actions: Stacked below content in same cell */}
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

                {/* Desktop Actions: Separate Cell */}
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

            {/* Integration Script Accordion */}
            {actor.public_url && (
                <TableRow>
                    <TableCell
                        colSpan={isMobile ? 1 : 2}
                        sx={{
                            backgroundColor: 'transparent',
                            fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '1rem',
                            py: 1,
                            textAlign: 'left',
                        }}
                    >
                        <Accordion sx={{ mt: 0, width: '100%' }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: '#f0f0f0',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '1rem',
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
                                        fontSize: isMobile ? '0.8rem' : isTablet ? '0.85rem' : '0.9rem',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        overflowX: 'auto',
                                        mb: 1,
                                        maxWidth: '100%',
                                    }}
                                >
                                    {`<script
  src="https://d1w17tu7s7ktlv.cloudfront.net/embed.umd.js"
  data-agent-name="${actor.name}"
  data-agent-id="${actor.actor_id || 'ID_NOT_SET'}"
  data-api-key="${actor.api_key || 'KEY_NOT_SET'}"
></script>`}
                                </Box>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => alert("Script copied (Mock)")}
                                    sx={{
                                        fontSize: isMobile ? '0.8rem' : isTablet ? '0.85rem' : '0.9rem',
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
    );
};

export default ActorRow;