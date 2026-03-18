import * as React from 'react';
import {Box, Typography} from '@mui/material';
import { useTranslation } from "react-i18next";

const Copyright: React.FC = () => {
    const { t } = useTranslation();
    const year = new Date().getFullYear();
    
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
                whiteSpace: 'pre-line'
            }}
        >            <Typography
                variant="body2"
                align="center"
                sx={{ color: 'text.secondary'}}
            >
                { t("copyright.copyright", { year }) }

            </Typography>
        </Box>
    );
}

export default Copyright;