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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
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
    const [openAddDialog, setOpenAddDialog] = useState(false); // Состояние для диалога добавления
    const [newAgent, setNewAgent] = useState({ name: '', instructions: '' }); // Состояние для новых данных агента

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

    const handleSignOut = () => {
        setUser(null);
        setAgents([]);
    };

    const handleOpenAddDialog = () => {
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewAgent({ name: '', instructions: '' }); // Сброс формы
    };

    const handleAddAgent = async () => {
        if (!newAgent.name.trim() || !newAgent.instructions.trim()) {
            console.error('Имя и инструкции обязательны');
            return;
        }

        const { error } = await supabase.from('Agents').insert({
            user_id: user.id,
            name: newAgent.name,
            instructions: newAgent.instructions,
            created_at: new Date().toISOString(),
        });

        if (error) {
            console.error('Error adding agent:', error);
        } else {
            fetchAgents();
            handleCloseAddDialog();
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed">
                <Toolbar>
                    {user && (
                        <IconButton color="inherit" onClick={toggleDrawer} edge="start" sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Мои Агенты
                    </Typography>
                    {user && (
                        <Button color="inherit" onClick={() => supabase.auth.signOut().then(handleSignOut)}>
                            Выйти
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            <Drawer open={drawerOpen} onClose={toggleDrawer}>
                <List sx={{ width: 250 }}>
                    <ListItem button onClick={handleOpenAddDialog}>
                        <ListItemText primary="Добавить" />
                    </ListItem>
                    <ListItem onClick={toggleDrawer}>
                        <ListItemText primary="Закрыть" />
                    </ListItem>
                </List>
            </Drawer>
            <Container sx={{ mt: 10 }}>
                <Auth onAuthChange={setUser} onSignOut={handleSignOut} />
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
                {/* Диалог для добавления агента */}
                <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
                    <DialogTitle>Добавить нового агента</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Имя"
                            type="text"
                            fullWidth
                            value={newAgent.name}
                            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Инструкции"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            value={newAgent.instructions}
                            onChange={(e) => setNewAgent({ ...newAgent, instructions: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddDialog} color="primary">
                            Отмена
                        </Button>
                        <Button onClick={handleAddAgent} color="primary">
                            Добавить
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default App;