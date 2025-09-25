import * as React from 'react';
import {
    AppBar,
    Button,
    IconButton,
    Toolbar,
    Typography,
    Box
} from '@mui/material';
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import { useTour } from "@reactour/tour";

interface AppNavbarProps {
    deviceType: string;
    onSignOut: () => void;
    onToggleDrawer: () => void;
    page: string;
    onNewAgent: () => void;
}

const AppNavbar: React.FC<AppNavbarProps> = ({ deviceType, onSignOut, onToggleDrawer, page, onNewAgent }) => {
    // ✅ Теперь хук внутри компонента
    const { currentStep, setCurrentStep } = useTour();

    const handleNewAgentClick = () => {
        onNewAgent();                    // открываем диалог
        setCurrentStep(currentStep + 1); // двигаем тур на следующий шаг
    };

    return (
        <AppBar position="fixed" sx={{ width: '100%' }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* Левая часть: меню + New Agent */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton color="inherit" onClick={onToggleDrawer} edge="start">
                        <MenuIcon />
                    </IconButton>

                    {deviceType === "mobile" ? (
                        <IconButton
                            color="inherit"
                            onClick={handleNewAgentClick}
                            data-tour="new-agent-button"
                        >
                            <AddIcon />
                        </IconButton>
                    ) : (
                        <Button
                            color="inherit"
                            onClick={handleNewAgentClick}
                            startIcon={<AddIcon />}
                            sx={{
                                fontSize: deviceType === 'tablet' ? '0.85rem' : '1rem',
                                textTransform: "none",
                                display: "flex",
                                alignItems: "center"
                            }}
                            data-tour="new-agent-button"
                        >
                            New Agent
                        </Button>
                    )}
                </Box>

                {/* Центр: заголовок */}
                <Typography
                    variant="h6"
                    sx={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.125rem' : '1.25rem',
                        textAlign: "center"
                    }}
                >
                    {page}
                </Typography>

                {/* Правая часть: Logout */}
                <Button
                    color="inherit"
                    onClick={onSignOut}
                    startIcon={<LogoutIcon />}
                    sx={{
                        fontSize: deviceType === 'mobile' ? '0.8rem' : '0.9rem',
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default AppNavbar;
