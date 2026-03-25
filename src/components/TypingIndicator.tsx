import React from 'react';
import { Box } from '@mui/material';

type TypingIndicatorProps = {
    anon?: boolean
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({anon = true}) => {
    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 2,
                py: 1,
                borderRadius: '16px 16px 16px 6px',
                bgcolor: anon ? '#f5f7fa' : '#c6e3fa' ,
                color: 'text.primary',
                maxWidth: '100%',
                boxShadow: 1,
            }}
        >
            <Box sx={{ display: 'flex', gap: 0.4 }}>
                <Box
                    sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'text.secondary',
                        animation: 'dotBlink 1.4s infinite ease-in-out',
                        animationDelay: '0s',
                    }}
                />
                <Box
                    sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'text.secondary',
                        animation: 'dotBlink 1.4s infinite ease-in-out',
                        animationDelay: '0.2s',
                    }}
                />
                <Box
                    sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'text.secondary',
                        animation: 'dotBlink 1.4s infinite ease-in-out',
                        animationDelay: '0.4s',
                    }}
                />
            </Box>

            <style jsx global>{`
                @keyframes dotBlink {
                    0%, 100% {
                        opacity: 0.4;
                        transform: translateY(0);
                    }
                    50% {
                        opacity: 1;
                        transform: translateY(-4px);
                    }
                }
            `}</style>
        </Box>
    );
};

export default TypingIndicator;