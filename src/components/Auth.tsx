import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

interface AuthProps {
    onAuthChange: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthChange }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const session = supabase.auth.getSession();
        session.then(({ data }) => {
            setUser(data.session?.user ?? null);
            onAuthChange(data.session?.user ?? null);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            onAuthChange(session?.user ?? null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [onAuthChange]);

    const handleSignUp = async () => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) console.error('Sign Up Error:', error.message);
    };

    const handleSignIn = async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) console.error('Sign In Error:', error.message);
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Sign Out Error:', error.message);
    };

    if (user) {
        return (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="h6">Добро пожаловать, {user.email}</Typography>
                <Button variant="contained" color="secondary" onClick={handleSignOut} sx={{ mt: 2 }}>
                    Выйти
                </Button>
            </Box>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h4" align="center">Авторизация</Typography>
                <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Пароль"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
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