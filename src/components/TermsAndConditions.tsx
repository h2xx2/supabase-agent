import * as React from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

const TermsAndConditions: React.FC = () => {
    return (
        <>
            <Typography
                variant="h4"
                gutterBottom
            >
                Terms And Conditions of Use
            </Typography>

            <Typography variant="body1">
                <strong>Service:</strong> youagent.me
            </Typography>
            <Typography variant="body1">
                <strong>Provider:</strong> Telemetry Balkan doo, Belgrade
            </Typography>
            <Typography variant="body1">
                <strong>Address:</strong> 11118, Cara Nikolaja II, 11, Belgrade, Serbia
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    fontStyle: 'italic',
                    mt: 2
                }}>
                Last updated: September 4, 2025
            </Typography>


        </>
    );
}

export default TermsAndConditions;
