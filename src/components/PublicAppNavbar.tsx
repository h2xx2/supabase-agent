import * as React from 'react';
import {
    AppBar,
    Button,
    Toolbar,
    Typography,
    Box
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppNavbarProps {
    deviceType: string;
}

const PublicAppNavbar: React.FC<AppNavbarProps> = ({ deviceType }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignIn = () => {
        navigate('/');
    };

    return (
        <AppBar position="fixed" sx={{ width: '100%' }}>
            <Toolbar sx={{ position: 'relative', minHeight: 64 }}>

                {/* Левая часть — пустая, чтобы центр был действительно по центру */}
                <Box sx={{ width: '120px' }} />

                    <Typography
                        variant="h6"
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize:
                                deviceType === 'mobile'
                                    ? '1rem'
                                    : deviceType === 'tablet'
                                        ? '1.125rem'
                                        : '1.25rem',
                            textAlign: 'center'
                        }}
                    >
                        youagent.me Privacy Policy
                    </Typography>


                {/* Правая часть: Sign In */}
                <Box
                    sx={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <Button
                        color="inherit"
                        onClick={handleSignIn}
                        startIcon={<LoginIcon />}
                        sx={{
                            fontSize:
                                deviceType === 'mobile'
                                    ? '0.8rem'
                                    : '0.9rem',
                            textTransform: 'none'
                        }}
                    >
                        Sign In
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default PublicAppNavbar;