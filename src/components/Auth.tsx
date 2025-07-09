import React, { useEffect, useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';
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

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            validateToken(storedToken).then((validUser) => {
                if (validUser) {
                    setUser(validUser);
                    onAuthChange(validUser);
                }
            }).catch(err => console.error('Validation error:', err));
        }

        const interval = setInterval(() => {
            if (storedToken) {
                validateToken(storedToken).then((validUser) => {
                    if (!validUser && user) {
                        setUser(null);
                        onAuthChange(null);
                        localStorage.removeItem('authToken');
                    }
                }).catch(err => console.error('Interval validation error:', err));
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [onAuthChange, user]);

    const validateToken = async (token: string): Promise<any> => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_GATEWAY_URL}/validate-token`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const outerData = response.data;
            const data = typeof outerData.body === 'string' ? JSON.parse(outerData.body) : outerData.body;

            return data?.user || null;
        } catch (error) {
            console.error('Token validation error:', error);
            return null;
        }
    };


    const handleSignUp = async () => {
        setError(null);
        if (!email.trim() || !password.trim()) {
            setError('Пожалуйста, заполните email и пароль');
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
                setUser(user);
                if (token) {
                    localStorage.setItem('authToken', token);
                }
                onAuthChange(user);
            } else {
                setError('Регистрация прошла, но пользователь не найден');
            }
        } catch (error) {
            console.error('Sign Up Error:', error);
            setError('Ошибка регистрации. Проверьте данные или попробуйте позже.');
        }
    };

    const handleSignIn = async () => {
        setError(null);
        if (!email.trim() || !password.trim()) {
            setError('Пожалуйста, заполните email и пароль');
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
                setError('Некорректный ответ от сервера');
            }
        } catch (error) {
            console.error('Sign In Error:', error);
            setError('Ошибка входа. Проверьте данные или попробуйте позже.');
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
        } catch (error) {
            console.error('Sign Out Error:', error);
        }
    };

    if (user) {
        return (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="h6">Добро пожаловать, {user.email}</Typography>
                <Button variant="contained" onClick={handleSignOut} sx={{ mt: 2 }}>Выйти</Button>
            </Box>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h4" align="center">Авторизация</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                />
                <TextField
                    label="Пароль"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button variant="contained" onClick={handleSignIn}>Войти</Button>
                    <Button variant="outlined" onClick={handleSignUp}>Регистрация</Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Auth;
