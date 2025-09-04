import * as React from 'react';
import {
    AppBar,
    Button,
    IconButton,
    Toolbar,
    Typography
} from '@mui/material';
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

interface AppNavbarProps {
    deviceType: string;
    onSignOut: () => void;
    onToggleDrawer: () => void;
}

const AppNavbar: React.FC<AppNavbarProps> = ({ deviceType, onSignOut, onToggleDrawer }) => {
    return (
        <AppBar position="fixed" sx={{ width: '100%' }}>
            <Toolbar>
                <IconButton color="inherit" onClick={onToggleDrawer} edge="start" sx={{ mr: 2 }}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" sx={{
                    flexGrow: 1,
                    fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.125rem' : '1.25rem',
                    textAlign: 'left'
                }}>
                    My Agents
                </Typography>
                <Button color="inherit" onClick={onSignOut}
                        startIcon={<LogoutIcon />}
                        sx={{ fontSize: deviceType === 'mobile' ? '0.8rem' : deviceType === 'tablet' ? '0.85rem' : '0.9rem' }}>
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default AppNavbar;