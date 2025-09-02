import {
    Box,
    CircularProgress
} from '@mui/material';

const GlobalLoader: React.FC = () => (
    <Box
        sx={{
            position: 'fixed',
            top: '0',
            left: '0',
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            bgcolor: 'black',
            opacity: '0.8'
        }}
    >
         <CircularProgress size={64}/>
    </Box>
);

export default GlobalLoader;