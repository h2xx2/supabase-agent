import React, { useEffect, useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, useMediaQuery, useTheme } from '@mui/material';
import axios from 'axios';

interface AuthProps {
    onAuthChange: (user: any) => void;
    onSignOut: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthChange, onSignOut }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            validateToken(storedToken).then((validUser) => {
                if (validUser) {
                    setUser(validUser);
                    onAuthChange(validUser);
                } else {
                    localStorage.removeItem('authToken');
                }
            }).catch((err: any) => {
                console.error('Validation error:', err);
                localStorage.removeItem('authToken');
            });
        }
    }, [onAuthChange]);

    const validateToken = async (token: string): Promise<any> => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_GATEWAY_URL}/validate-token`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const outerData = response.data;
            const data = typeof outerData.body === 'string' ? JSON.parse(outerData.body) : outerData.body;

            return data?.user || null;
        } catch (error: any) {
            console.error('Token validation error:', error);
            return null;
        }
    };

    const handleSignUp = async () => {
        setError(null);
        if (!email.trim() || !password.trim()) {
            setError('Please fill email and password');
            return;
        }
        try {
            const payload = { email, password };
            const response = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/signup`, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            const outerData = response.data;
            const parsedBody = typeof outerData.body === 'string' ? JSON.parse(outerData.body) : outerData.body;

            const { user, token } = parsedBody;

            if (user) {
                if (parsedBody.requires_email_confirmation || !token) {
                    setEmailConfirmationRequired(true);
                    setError('Please confirm your account via email. Sign in after confirmation');
                    return;
                }

                setUser(user);
                if (token) {
                    localStorage.setItem('authToken', token);
                }
                onAuthChange(user);
            } else {
                setError('Sign Up has been succeed, but user was not found');
            }
        } catch (error: any) {
            console.error('Sign Up Error:', error);
            setError('Sign Up error. Please check data or try again later.');
        }
    };

    const handleSignIn = async () => {
        setError(null);
        setEmailConfirmationRequired(false);
        if (!email.trim() || !password.trim()) {
            setError('Please fill email and password');
            return;
        }
        try {
            const payload = { email, password };
            const response = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/signin`, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            const outerData = response.data;
            const data = typeof outerData.body === 'string' ? JSON.parse(outerData.body) : outerData.body;

            const { user, token } = data;
            if (user && token) {
                setUser(user);
                localStorage.setItem('authToken', token);
                onAuthChange(user);
            } else {
                setError('Incorrect server response');
            }
        } catch (error: any) {
            console.error('Sign In Error:', error);
            setError('Sign In error. Please check data or try again later.');
        }
    };

    const handleSignOut = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/signout`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
            });
            setUser(null);
            localStorage.removeItem('authToken');
            onSignOut();
        } catch (error: any) {
            console.error('Sign Out Error:', error);
        }
    };

    if (user) {
        return (
            <Box sx={{ textAlign: 'center', mt: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 3 : 4 }}>
                <Typography
                    variant={deviceType === 'mobile' ? 'h6' : deviceType === 'tablet' ? 'h5' : 'h5'}
                    sx={{ mb: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 2.5 : 3, fontSize: deviceType === 'mobile' ? '1.25rem' : deviceType === 'tablet' ? '1.375rem' : '1.5rem' }}
                >
                    Welcome, {user.email}
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSignOut}
                    sx={{
                        fontSize: deviceType === 'mobile' ? '0.875rem' : deviceType === 'tablet' ? '0.9375rem' : '1rem',
                        px: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 2.5 : 3,
                        py: deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 1.25 : 1.5,
                    }}
                >
                    Exit
                </Button>
            </Box>
        );
    }

    return (
        <Container maxWidth={deviceType === 'mobile' ? 'sm' : 'md'} sx={{ px: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 3 : 4 }}>
            <Box sx={{ mt: deviceType === 'mobile' ? 4 : deviceType === 'tablet' ? 5 : 6, display: 'flex', flexDirection: 'column', gap: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 2.5 : 3, alignItems: 'center' }}>
                <Typography
                    variant={deviceType === 'mobile' ? 'h4' : deviceType === 'tablet' ? 'h3' : 'h3'}
                    align="center"
                    sx={{ fontSize: deviceType === 'mobile' ? '2.125rem' : deviceType === 'tablet' ? '2.5rem' : '3rem' }}
                >
                    Authorization
                </Typography>
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 2.5 : 3,
                            fontSize: deviceType === 'mobile' ? '0.875rem' : deviceType === 'tablet' ? '0.9375rem' : '1rem',
                            width: deviceType === 'mobile' ? '100%' : deviceType === 'tablet' ? '50vw' : '25vw',
                        }}
                    >
                        {error}
                    </Alert>
                )}
                {emailConfirmationRequired && (
                    <Alert
                        severity="info"
                        sx={{
                            mb: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 2.5 : 3,
                            fontSize: deviceType === 'mobile' ? '0.875rem' : deviceType === 'tablet' ? '0.9375rem' : '1rem',
                            width: deviceType === 'mobile' ? '100%' : deviceType === 'tablet' ? '50vw' : '25vw',
                        }}
                    >
                        Please confirm your account via email, sent to {email}. Sign in after confirmation.
                    </Alert>
                )}
                <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                    sx={{
                        maxWidth: deviceType === 'mobile' ? '100%' : deviceType === 'tablet' ? '50vw' : '25vw',
                        '& .MuiInputBase-input': { fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.0625rem' : '1.125rem' },
                        '& .MuiInputLabel-root': { fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.0625rem' : '1.125rem' },
                    }}
                />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                    sx={{
                        maxWidth: deviceType === 'mobile' ? '100%' : deviceType === 'tablet' ? '50vw' : '25vw',
                        '& .MuiInputBase-input': { fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.0625rem' : '1.125rem' },
                        '& .MuiInputLabel-root': { fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.0625rem' : '1.125rem' },
                    }}
                />
                <Box sx={{ display: 'flex', gap: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 2.5 : 3, justifyContent: 'center', mt: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 2.5 : 3 }}>
                    <Button
                        variant="contained"
                        onClick={handleSignIn}
                        sx={{
                            fontSize: deviceType === 'mobile' ? '0.875rem' : deviceType === 'tablet' ? '0.9375rem' : '1rem',
                            px: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 2.5 : 3,
                            py: deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 1.25 : 1.5,
                        }}
                    >
                        Sign In
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleSignUp}
                        sx={{
                            fontSize: deviceType === 'mobile' ? '0.875rem' : deviceType === 'tablet' ? '0.9375rem' : '1rem',
                            px: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 2.5 : 3,
                            py: deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 1.25 : 1.5,
                        }}
                    >
                        Sign Up
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Auth;