import * as React from 'react';
import {Box, Typography} from '@mui/material';

const Copyright: React.FC = () => {
    const text = [
        'Copyright © ',
        'Telemetry Balkan doo Beograd',
        ' ',
        new Date().getFullYear(),
        '.'
    ].join('');
    return (
        <Box sx={{ color: 'text.secondary', justifyContent: 'center', width: '100%', mt: 5}}>
            <Typography
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