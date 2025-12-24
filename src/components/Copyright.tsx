import * as React from 'react';
import {Box, Typography} from '@mui/material';

const Copyright: React.FC = () => {
    const text = [
        'Copyright © ',
        'Telemetry Balkan doo Belgrade',
        ' ',
        new Date().getFullYear(),
        '.'
    ].join('');
    return (
        <Box
            sx={{
                position: { xs: 'fixed', md: 'relative' },
                bottom: { xs: 0, md: 'auto' },
                left: { xs: 0, md: 'auto' },
                width: { xs: '100%', md: '100%' },
                backgroundColor: { xs: 'background.paper', md: 'transparent' },
                py: { xs: 1, md: 0 },
                zIndex: 1000,
            }}
        >            <Typography
                variant="body2"
                align="center"
                sx={{ color: 'text.secondary'}}
            >
                {text}
            </Typography>
        </Box>
    );
}

export default Copyright;