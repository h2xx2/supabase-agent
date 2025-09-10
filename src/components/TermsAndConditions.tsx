import * as React from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

const TermsAndConditions: React.FC = () => {
    return (
        <>
            <Typography
                component="h2"
                variant="h4"
                gutterBottom
                sx={{ textAlign: 'center' }}
            >
                Terms And Conditions of Use
            </Typography>
        </>
    );
}

export default TermsAndConditions;
