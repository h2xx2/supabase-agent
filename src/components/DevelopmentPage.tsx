import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface DevelopmentPageProps {
    deviceType: 'mobile' | 'tablet' | 'desktop';
}

const DevelopmentPage: React.FC<DevelopmentPageProps> = ({ deviceType }) => {
    const [copied, setCopied] = useState(false);

    const cloneCode = `git clone https://github.com/Telemetry-Balkan-doo/youagent-me-examples.git
cd youagent-me-examples`;

    const handleCopy = () => {
        navigator.clipboard.writeText(cloneCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <Box
            sx={{
                mt: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 3 : 4,
                width: '100%',
                overflowX: 'hidden',
                px: 1,
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 'bold',
                    mb: 3,
                    fontSize: deviceType === 'mobile' ? '1.5rem' : deviceType === 'tablet' ? '1.75rem' : '2rem',
                    textAlign: 'left',
                }}
            >
                youagent-me API Examples
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, textAlign: 'left', lineHeight: 1.7 }}>
                Welcome to the official repository of examples for invoking our <strong>youagent.me API</strong>! This repository provides ready-to-run code snippets in various languages to help you get started quickly.
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'left' }}>
                Getting Started
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'left', lineHeight: 1.7 }}>
                To run these examples, you'll need to have the necessary tools for your chosen language installed (e.g., Python, Node.js).
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'left' }}>
                Prerequisites
            </Typography>

            {/* Блок с кодом + кнопка копирования */}
            <Box
                sx={{
                    position: 'relative',
                    backgroundColor: '#f4f4f4',
                    p: 2,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: deviceType === 'mobile' ? '0.85rem' : '0.9rem',
                    overflowX: 'auto',
                    mb: 3,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    pr: 6, // отступ под кнопку
                }}
            >
                <Box component="pre" sx={{ m: 0 }}>
                    {cloneCode}
                </Box>

                {/* Кнопка копирования */}
                <IconButton
                    size="small"
                    onClick={handleCopy}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: copied ? 'success.main' : 'background.paper',
                        color: copied ? 'white' : 'text.secondary',
                        '&:hover': {
                            backgroundColor: copied ? 'success.dark' : 'action.hover',
                        },
                        transition: 'all 0.2s',
                    }}
                    title="Copy to clipboard"
                >
                    {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
            </Box>

            <Typography variant="body1" sx={{ mb: 3, textAlign: 'left', lineHeight: 1.7 }}>
                An API endpoint, API key and Agent ID for the agent API.
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'left' }}>
                Running the Examples
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'left', lineHeight: 1.7 }}>
                Each language has its own directory within the <code>examples/</code> folder. Please follow the instructions in the respective <code>README.md</code> files or the general instructions below.
            </Typography>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Python</Typography>
                <Typography variant="body2" sx={{ pl: 2, mb: 1 }}>
                    Navigate to the Python examples directory and follow the instructions in <code>examples/python/README.md</code>.
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>Node.js</Typography>
                <Typography variant="body2" sx={{ pl: 2, mb: 1 }}>
                    Navigate to the NodeJs examples directory and follow the instructions in <code>examples/nodejs/README.md</code>.
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>cURL</Typography>
                <Typography variant="body2" sx={{ pl: 2, mb: 1 }}>
                    The cURL examples are simple shell scripts that can be run directly from your terminal. See <code>examples/curl/README.md</code> for more details.
                </Typography>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'left' }}>
                Contributing
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'left', lineHeight: 1.7 }}>
                We welcome contributions! Please see our <strong>Contributing Guidelines</strong> for more details on how to get involved.
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'left' }}>
                License
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, textAlign: 'left', lineHeight: 1.7 }}>
                <strong>BSD 2-Clause License</strong>
            </Typography>

            <Box sx={{ textAlign: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    href="https://github.com/Telemetry-Balkan-doo/youagent-me-examples"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        textTransform: 'none',
                        fontSize: deviceType === 'mobile' ? '0.9rem' : '1rem',
                        px: 3,
                        py: 1.5,
                    }}
                >
                    View Repository on GitHub
                </Button>
            </Box>
        </Box>
    );
};

export default DevelopmentPage;