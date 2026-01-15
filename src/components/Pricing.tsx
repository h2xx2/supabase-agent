import * as React from 'react';
import { useCookies } from 'react-cookie';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Container,
    Divider,
    Grid,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import axios from 'axios';

interface PricingProps {
    setGlobalLoading: (state: boolean) => void;
    user: any;
    setUser: (user: any) => void;
}

const tiers = [
    {
        title: 'Free',
        price: '0',
        description: ['Up to 5 agents', 'Up to 500 requests/month'],
        planKey: 'free',
        buttonText: 'Contact us',
        buttonVariant: 'outlined',
        buttonColor: 'primary',
    },
    {
        title: 'Personal',
        price: '15',
        description: ['Unlimited agents', 'Up to 10,000 requests/month'],
        planKey: 'personal',
        buttonText: '3 Months Free',
        buttonVariant: 'contained',
        buttonColor: 'secondary',
    },
    {
        title: 'Custom',
        description: [
            'Unlimited agents',
            'Number of requests is negotiable',
            'Price is negotiable',
            'Extended Support',
        ],
        planKey: 'custom',
        buttonText: 'Contact us',
        buttonVariant: 'outlined',
        buttonColor: 'primary',
    },
];

const Pricing: React.FC<PricingProps> = ({ setGlobalLoading, user, setUser }) => {
    const [openUpgrade, setOpenUpgrade] = React.useState(false);
    const [openDowngrade, setOpenDowngrade] = React.useState(false); // New state for downgrade dialog
    const [selectedPlan, setSelectedPlan] = React.useState('');
    const [userEmail, setUserEmail] = React.useState('');
    const [desiredLimits, setDesiredLimits] = React.useState('');
    const [comments, setComments] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [cookies] = useCookies(['authToken']);

    // Fetch user plan on mount
    React.useEffect(() => {
        const fetchUserPlan = async () => {
            try {
                const token = getAuthToken();
                const user_id = getUserIdFromToken(token);
                const response = await axios.get(
                    `${import.meta.env.VITE_API_GATEWAY_URL}/user-plan`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { user_id },
                    }
                );
                const planData = response.data;
                setUser({
                    ...user,
                    id: user_id,
                    plan_type: planData.plan_type?.toLowerCase() || 'free',
                    is_trial_active: planData.is_trial_active || false,
                    trial_days_remaining: planData.trial_days_remaining || 0,
                    trial_end_date: planData.trial_end_date || null,
                    action_used: planData.action_used || false,
                });
                console.log('Fetched user plan:', planData);
            } catch (error) {
                console.error('Error fetching user plan:', error);
                setUser({ ...user, plan_type: 'free', action_used: false });
            }
        };

        if (cookies.authToken && !user?.plan_type) {
            fetchUserPlan();
        }
    }, [cookies.authToken, user, setUser]);

    // Debug: Log user and plan_type
    React.useEffect(() => {
        console.log('User:', user);
        console.log('User plan_type:', user?.plan_type);
        console.log('User action_used:', user?.action_used);
    }, [user]);

    const getAuthToken = (): string => {
        const token = cookies.authToken;
        console.log('Auth token:', token);
        if (!token) throw new Error('Authorization token missing in cookie');
        return token;
    };

    const getUserIdFromToken = (token: string): string => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub;
        } catch (error) {
            console.error('Token decoding error:', error);
            throw new Error('Failed to extract user_id from token');
        }
    };

    const handleOpenUpgrade = (plan: string) => {
        const currentPlan = user?.plan_type?.toLowerCase() || 'free';
        if (currentPlan === plan.toLowerCase()) return;
        setSelectedPlan(plan);
        setOpenUpgrade(true);
    };

    const handleCloseUpgrade = () => {
        setOpenUpgrade(false);
        setUserEmail('');
        setDesiredLimits('');
        setComments('');
        setErrorMessage('');
    };

    const handleCloseDowngrade = () => {
        setOpenDowngrade(false);
        setErrorMessage('');
    };

    const handleRequestUpgrade = async () => {
        try {
            const token = getAuthToken();
            const user_id = getUserIdFromToken(token);

            setGlobalLoading(true);

            const currentDate = new Date().toISOString().split('T')[0];

            if (selectedPlan === 'Personal' && !user?.action_used) {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_GATEWAY_URL}/start-free-trial`,
                    {
                        user_id,
                        plan: 'personal',
                        trial_start_date: currentDate,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log('Free trial activated:', response.data);

                const endDate = new Date();
                endDate.setDate(endDate.getDate() + 90);

                const updatedUser = {
                    ...user,
                    id: user_id,
                    plan_type: 'personal',
                    is_trial_active: true,
                    trial_days_remaining: 90,
                    trial_end_date: endDate.toISOString(),
                    action_used: true,
                };
                setUser(updatedUser);
                console.log('Updated user state:', updatedUser);

                if (window.gtag) {
                    window.gtag('event', 'conversion', {
                        send_to: 'AW-17635043348/hdSeCM-EsakbEJTQhdlB',
                        value: 0.0,
                        currency: 'USD',
                    });
                }
            } else {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_GATEWAY_URL}/contact-us`,
                    {
                        user_id: user?.id || user_id,
                        email: userEmail,
                        desired_plan: selectedPlan,
                        desired_limits: desiredLimits,
                        reason_comments: comments,
                        current_account_status: user?.plan_type || 'free',
                        request_date: currentDate,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log('Upgrade request sent:', response.data);

                if (window.gtag) {
                    window.gtag('event', 'conversion', {
                        send_to: 'AW-17635043348/hdSeCM-EsakbEJTQhdlB',
                        value: 1.0,
                        currency: 'USD',
                    });
                }
            }

            handleCloseUpgrade();
        } catch (error: any) {
            console.error('Error processing request:', error.response?.data || error);
            setErrorMessage(
                error.response?.data?.error === 'Invalid user_id format'
                    ? 'Invalid user ID format. Please contact support.'
                    : error.response?.data?.error || `Failed to ${selectedPlan === 'Personal' && !user?.action_used ? 'activate free trial' : 'send upgrade request'}`
            );
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleDowngrade = async () => {
        try {
            const token = getAuthToken();
            const user_id = getUserIdFromToken(token);

            setGlobalLoading(true);

            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/downgrade-plan`,
                {
                    user_id,
                    plan: 'free',
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Downgrade request sent:', response.data);

            const updatedUser = {
                ...user,
                id: user_id,
                plan_type: 'free',
                is_trial_active: false,
                trial_days_remaining: 0,
                trial_end_date: null,
                action_used: user?.action_used || false,
            };
            setUser(updatedUser);
            console.log('Updated user state after downgrade:', updatedUser);

            if (window.gtag) {
                window.gtag('event', 'conversion', {
                    send_to: 'AW-17635043348/hdSeCM-EsakbEJTQhdlB',
                    value: 0.0,
                    currency: 'USD',
                    event_category: 'Downgrade',
                });
            }

            handleCloseDowngrade();
        } catch (error: any) {
            console.error('Error processing downgrade:', error.response?.data || error);
            setErrorMessage(
                error.response?.data?.error === 'Invalid user_id format'
                    ? 'Invalid user ID format. Please contact support.'
                    : error.response?.data?.error || 'Failed to downgrade plan'
            );
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleOpenDowngrade = () => {
        setOpenDowngrade(true);
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
            <Box sx={{ width: { sm: '100%', md: '60%' }, textAlign: { sm: 'left', md: 'center' } }}>
                <Typography component="h2" variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
                    Pricing
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                {tiers.map((tier) => {
                    const currentPlan = user?.plan_type?.toLowerCase() || 'free';
                    const isCurrentPlan = currentPlan === tier.planKey.toLowerCase();
                    let buttonText = tier.buttonText;
                    let buttonAction = () => handleOpenUpgrade(tier.title);
                    if (tier.title === 'Free' && currentPlan === 'personal' && !isCurrentPlan) {
                        buttonText = 'Downgrade';
                        buttonAction = handleOpenDowngrade; // Open downgrade confirmation dialog
                    } else if (tier.title === 'Personal' && user?.action_used && !isCurrentPlan) {
                        buttonText = 'Contact us';
                    }

                    console.log(`Plan: ${tier.planKey}, currentPlan: ${currentPlan}, isCurrentPlan: ${isCurrentPlan}, buttonText: ${buttonText}`);

                    return (
                        <Grid key={tier.title} item xs={12} sm={tier.title === 'Custom' ? 12 : 6} md={4}>
                            <Card
                                sx={[
                                    { p: 2, display: 'flex', flexDirection: 'column', gap: 4 },
                                    tier.title === 'Personal' &&
                                    ((theme) => ({
                                        border: 'none',
                                        background: 'radial-gradient(circle at 50% 0%, hsl(220, 20%, 35%), hsl(220, 30%, 6%))',
                                        boxShadow: `0 8px 12px hsla(220, 20%, 42%, 0.2)`,
                                        ...theme.applyStyles('dark', {
                                            background: 'radial-gradient(circle at 50% 0%, hsl(220, 20%, 20%), hsl(220, 30%, 16%))',
                                            boxShadow: `0 8px 12px hsla(0, 0%, 0%, 0.8)`,
                                        }),
                                    })),
                                ]}
                            >
                                <CardContent>
                                    <Box
                                        sx={{
                                            mb: 1,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 2,
                                            color: tier.title === 'Personal' ? 'grey.100' : 'text.primary',
                                        }}
                                    >
                                        <Typography component="h3" variant="h6">
                                            {tier.title}
                                        </Typography>
                                    </Box>

                                    {tier.price && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'baseline',
                                                color: tier.title === 'Personal' ? 'grey.50' : 'text.primary',
                                            }}
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
                                        <Box key={line} sx={{ py: 1, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                            <CheckCircleRoundedIcon
                                                sx={{ width: 20, color: tier.title === 'Personal' ? 'primary.light' : 'primary.main' }}
                                            />
                                            <Typography
                                                variant="subtitle2"
                                                component="span"
                                                sx={{ color: tier.title === 'Personal' ? 'grey.50' : 'text.primary' }}
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
                                        disabled={isCurrentPlan}
                                        onClick={buttonAction}
                                        sx={{
                                            ...(isCurrentPlan && tier.buttonColor === 'secondary' && {
                                                backgroundColor: 'secondary.main',
                                                color: 'secondary.contrastText',
                                                '&.Mui-disabled': {
                                                    backgroundColor: 'secondary.main',
                                                    color: 'secondary.contrastText',
                                                    opacity: 0.6,
                                                },
                                            }),
                                            ...(isCurrentPlan && tier.buttonColor === 'primary' && {
                                                borderColor: 'primary.main',
                                                color: 'primary.main',
                                                '&.Mui-disabled': {
                                                    borderColor: 'primary.main',
                                                    color: 'primary.main',
                                                    opacity: 0.6,
                                                },
                                            }),
                                        }}
                                    >
                                        {isCurrentPlan ? 'Your current plan' : buttonText}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            <Dialog open={openUpgrade} onClose={handleCloseUpgrade}>
                <DialogTitle>Upgrade to {selectedPlan}</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        You are requesting an upgrade to the {selectedPlan} plan.
                        {selectedPlan === 'Personal' && !user?.action_used && (
                            <> Enjoy a 3-month free trial — no credit card required.</>
                        )}
                    </Typography>

                    {errorMessage && (
                        <Typography color="error" variant="body2" gutterBottom>
                            {errorMessage}
                        </Typography>
                    )}

                    {(selectedPlan !== 'Personal' || (selectedPlan === 'Personal' && user?.action_used)) && (
                        <>
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
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUpgrade}>Cancel</Button>
                    <Button onClick={handleRequestUpgrade} variant="contained">
                        {selectedPlan === 'Personal' && !user?.action_used ? 'Start Free Trial' : 'Request Upgrade'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDowngrade} onClose={handleCloseDowngrade}>
                <DialogTitle>Confirm Downgrade to Free Plan</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Are you sure you want to downgrade to the Free plan? This will limit you to 100 requests per month.
                    </Typography>
                    {errorMessage && (
                        <Typography color="error" variant="body2" gutterBottom>
                            {errorMessage}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDowngrade}>Cancel</Button>
                    <Button onClick={handleDowngrade} variant="contained">
                        Confirm Downgrade
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Pricing;