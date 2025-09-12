import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import axios from 'axios';

const tiers = [
    {
        title: 'Free',
        price: '0',
        description: [
            'Up to 5 agents',
            'Up to 200 requests/month',
        ],
        buttonText: 'Your current plan',
        buttonVariant: 'outlined',
        buttonColor: 'primary',
        buttonDisabled: true,
    },
    {
        title: 'Personal',
        price: '10',
        description: [
            'Unlimited agents',
            'Up to 10,000 requests/month',
        ],
        buttonText: 'Contact Us',
        buttonVariant: 'contained',
        buttonColor: 'secondary',
        buttonDisabled: false,
    },
    {
        title: 'Custom',
        description: [
            'Unlimited agents',
            'Number of requests is negotiable',
            'Price is negotiable',
            'Extended Support'
        ],
        buttonText: 'Contact us',
        buttonVariant: 'outlined',
        buttonColor: 'primary',
        buttonDisabled: false,
    },
];

interface User {
    id: string;
}

const Pricing: React.FC = () => {
    const [open, setOpen] = React.useState(false);
    const [selectedPlan, setSelectedPlan] = React.useState('');
    const [userEmail, setUserEmail] = React.useState('');
    const [desiredLimits, setDesiredLimits] = React.useState('');
    const [comments, setComments] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const user: User | null = { id: 'user-id-placeholder' }; // Replace with actual user context
    const getAuthToken = (): string => 'token-placeholder'; // Replace with actual token retrieval

    const handleOpen = (plan: string) => {
        setSelectedPlan(plan);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setUserEmail('');
        setDesiredLimits('');
        setComments('');
        setErrorMessage('');
    };

    const handleRequestUpgrade = async () => {
        try {
            const token = getAuthToken();
            const currentDate = new Date().toISOString().split('T')[0];
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/contact-us`,
                {
                    user_id: user?.id,
                    email: userEmail,
                    desired_plan: selectedPlan,
                    desired_limits: desiredLimits,
                    reason_comments: comments,
                    current_account_status: tiers[0].title,
                    request_date: currentDate,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Request sent successfully:', response.data);
            handleClose();
        } catch (error: any) {
            console.error('Error sending upgrade request:', error);
            setErrorMessage(
                error.message === 'Токен авторизации отсутствует в куки'
                    ? 'Пожалуйста, войдите в систему'
                    : 'Не удалось отправить запрос на обновление'
            );
        }
    };

    return (
        <Container
            id="pricing"
            sx={{
                pt: { xs: 4, sm: 12 },
                pb: { xs: 8, sm: 16 },
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 3, sm: 6 },
            }}
        >
            <Box
                sx={{
                    width: { sm: '100%', md: '60%' },
                    textAlign: { sm: 'left', md: 'center' },
                }}
            >
                <Typography
                    component="h2"
                    variant="h4"
                    gutterBottom
                    sx={{ color: 'text.primary' }}
                >
                    Pricing
                </Typography>
            </Box>
            <Grid
                container
                spacing={3}
                sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}
            >
                {tiers.map((tier) => (
                    <Grid
                        size={{ xs: 12, sm: tier.title === 'Custom' ? 12 : 6, md: 4 }}
                        key={tier.title}
                    >
                        <Card
                            sx={[
                                {
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                },
                                tier.title === 'Personal' &&
                                ((theme) => ({
                                    border: 'none',
                                    background:
                                        'radial-gradient(circle at 50% 0%, hsl(220, 20%, 35%), hsl(220, 30%, 6%))',
                                    boxShadow: `0 8px 12px hsla(220, 20%, 42%, 0.2)`,
                                    ...theme.applyStyles('dark', {
                                        background:
                                            'radial-gradient(circle at 50% 0%, hsl(220, 20%, 20%), hsl(220, 30%, 16%))',
                                        boxShadow: `0 8px 12px hsla(0, 0%, 0%, 0.8)`,
                                    }),
                                })),
                            ]}
                        >
                            <CardContent>
                                <Box
                                    sx={[
                                        {
                                            mb: 1,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 2,
                                        },
                                        tier.title === 'Personal'
                                            ? { color: 'grey.100' }
                                            : { color: '' },
                                    ]}
                                >
                                    <Typography component="h3" variant="h6">
                                        {tier.title}
                                    </Typography>
                                </Box>
                                {tier.price && (
                                    <Box
                                        sx={[
                                            {
                                                display: 'flex',
                                                alignItems: 'baseline',
                                            },
                                            tier.title === 'Personal'
                                                ? { color: 'grey.50' }
                                                : { color: null },
                                        ]}
                                    >
                                        <Typography component="h3" variant="h2">
                                            ${tier.price}
                                        </Typography>
                                        <Typography component="h3" variant="h6">
                                            &nbsp; per month
                                        </Typography>
                                    </Box>
                                )}
                                <Divider sx={{ my: 2, opacity: 0.8, borderColor: 'divider' }} />
                                {tier.description.map((line) => (
                                    <Box
                                        key={line}
                                        sx={{ py: 1, display: 'flex', gap: 1.5, alignItems: 'center' }}
                                    >
                                        <CheckCircleRoundedIcon
                                            sx={[
                                                {
                                                    width: 20,
                                                },
                                                tier.title === 'Personal'
                                                    ? { color: 'primary.light' }
                                                    : { color: 'primary.main' },
                                            ]}
                                        />
                                        <Typography
                                            variant="subtitle2"
                                            component={'span'}
                                            sx={[
                                                tier.title === 'Personal'
                                                    ? { color: 'grey.50' }
                                                    : { color: null },
                                            ]}
                                        >
                                            {line}
                                        </Typography>
                                    </Box>
                                ))}
                            </CardContent>
                            <CardActions>
                                <Button
                                    fullWidth
                                    variant={tier.buttonVariant as 'outlined' | 'contained'}
                                    color={tier.buttonColor as 'primary' | 'secondary'}
                                    disabled={tier.buttonDisabled}
                                    onClick={() => handleOpen(tier.title)}
                                >
                                    {tier.buttonText}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Upgrade to {selectedPlan}</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        You are requesting an upgrade to the {selectedPlan} plan. Please provide the
                        following details to proceed with your request.
                    </Typography>
                    {errorMessage && (
                        <Typography color="error" variant="body2" gutterBottom>
                            {errorMessage}
                        </Typography>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Desired Limits"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={desiredLimits}
                        onChange={(e) => setDesiredLimits(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Reason/Comments"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleRequestUpgrade} variant="contained">
                        Request Upgrade
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Pricing;