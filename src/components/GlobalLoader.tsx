import { styled } from '@mui/material/styles';
import {
    Box,
    LinearProgress
} from '@mui/material';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
}));

const GlobalLoader: React.FC = () => (
    <Box
        sx={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            alignContent: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            bgcolor: 'black',
            opacity: '0.8'
        }}
    >
        <BorderLinearProgress sx={{m: '0 10%'}}/>
    </Box>
);

export default GlobalLoader;