import * as React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CookiesProvider } from 'react-cookie'

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#f50057',
        },
    },
});

const cookieOptions = {
    maxAge: 60 * 60 * 24 * 7,
    secure: true
};

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CookiesProvider defaultSetOptions={cookieOptions}>
                <App />
            </CookiesProvider>
        </ThemeProvider>
    </React.StrictMode>
);