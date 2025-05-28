import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
    AppBar,
    Toolbar,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Container,
    IconButton,
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Auth from './components/Auth';

interface Agent {
    id: string;
    user_id: string;
    name: string;
    instructions: string;
    created_at: string;
}

const App: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);

    useEffect(() => {
        if (user) {
            fetchAgents();
        }
    }, [user]);

    const fetchAgents = async () => {
        const { data, error } = await supabase
            .from('Agents')
            .select('*')
            .eq('user_id', user.id);
        if (error) {
            console.error('Error fetching agents:', error);
        } else {
            setAgents(data || []);
        }
    };

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton color="inherit" onClick={toggleDrawer} edge="start" sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6">Мои Агенты</Typography>
                </Toolbar>
            </AppBar>
            <Drawer open={drawerOpen} onClose={toggleDrawer}>
                <List sx={{ width: 250 }}>
                    <ListItem onClick={toggleDrawer}>
                        <ListItemText primary="Закрыть" />
                    </ListItem>
                </List>
            </Drawer>
            <Container sx={{ mt: 10 }}>
                <Auth onAuthChange={setUser} />
                {user && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5">Ваши агенты</Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Имя</TableCell>
                                    <TableCell>Инструкции</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {agents.map((agent) => (
                                    <TableRow key={agent.id}>
                                        <TableCell>{agent.name}</TableCell>
                                        <TableCell>{agent.instructions}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default App;