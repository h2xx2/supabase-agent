import * as React from 'react';
import {Box, Typography} from '@mui/material';
import { useTranslation } from "react-i18next";

const Copyright: React.FC = () => {
    const { t } = useTranslation();
    const year = new Date().getFullYear();
    
    return (
        <Box sx={{ color: 'text.secondary', justifyContent: 'center', width: '100%', mt: 5}}>
            <Typography
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