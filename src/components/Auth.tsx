import React, { useEffect, useState } from "react";
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    FormControlLabel,
    Checkbox,
    Link,
    Grid,
    Box,
    Typography,
    Container,
    Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";

interface AuthProps {
    onAuthChange: (user: any) => void;
    onSignOut: () => void;
}

const theme = createTheme();

const Auth: React.FC<AuthProps> = ({ onAuthChange, onSignOut }) => {
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState(""); // Added state for full name
    const [rememberMe, setRememberMe] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [emailConfirmationRequired, setEmailConfirmationRequired] =
        useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
            validateToken(storedToken)
                .then((validUser) => {
                    if (validUser) {
                        setUser(validUser);
                        onAuthChange(validUser);
                    } else {
                        localStorage.removeItem("authToken");
                    }
                })
                .catch(() => localStorage.removeItem("authToken"));
        }
    }, [onAuthChange]);

    const validateToken = async (token: string): Promise<any> => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_GATEWAY_URL}/validate-token`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const outerData = response.data;
            const data =
                typeof outerData.body === "string"
                    ? JSON.parse(outerData.body)
                    : outerData.body;

            return data?.user || null;
        } catch {
            return null;
        }
    };

    const handleSignUp = async () => {
        setError(null);
        if (!email.trim() || !password.trim() || !fullName.trim()) { // Added fullName check
            setError("Please fill email, password, and full name");
            return;
        }
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/signup`,
                { email, password, fullName }, // Added fullName to request
                { headers: { "Content-Type": "application/json" } }
            );

            const outerData = response.data;
            const parsedBody =
                typeof outerData.body === "string"
                    ? JSON.parse(outerData.body)
                    : outerData.body;

            const { user, token } = parsedBody;

            if (user) {
                if (parsedBody.requires_email_confirmation || !token) {
                    setEmailConfirmationRequired(true);
                    setError(
                        "Please confirm your account via email. Sign in after confirmation"
                    );
                    return;
                }
                setUser(user);
                if (token && rememberMe) {
                    localStorage.setItem("authToken", token);
                }
                onAuthChange(user);
            } else {
                setError("Sign Up has succeeded, but user was not found");
            }
        } catch {
            setError("Sign Up error. Please check data or try again later.");
        }
    };

    const handleSignIn = async () => {
        setError(null);
        setEmailConfirmationRequired(false);
        if (!email.trim() || !password.trim()) {
            setError("Please fill email and password");
            return;
        }
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/signin`,
                { email, password },
                { headers: { "Content-Type": "application/json" } }
            );

            const outerData = response.data;
            const data =
                typeof outerData.body === "string"
                    ? JSON.parse(outerData.body)
                    : outerData.body;

            const { user, token } = data;
            if (user && token) {
                setUser(user);
                if (rememberMe) {
                    localStorage.setItem("authToken", token);
                }
                onAuthChange(user);
            } else {
                setError("Incorrect server response");
            }
        } catch {
            setError("Sign In error. Please check data or try again later.");
        }
    };

    const handleSignOut = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/signout`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
            );
            setUser(null);
            localStorage.removeItem("authToken");
            onSignOut();
        } catch {}
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        authMode === "signin" ? handleSignIn() : handleSignUp();
    };

    if (user) {
        return (
            <ThemeProvider theme={theme}>
                <Container
                    component="main"
                    maxWidth={false} // Override default maxWidth
                    sx={{
                        width: { xs: "min(90vw, 320px)", md: "400px" }, // Responsive width: 90vw or 320px on mobile, 400px on desktop
                        mx: "auto", // Center horizontally
                        mt: { xs: 4, md: 8 }, // Top margin to push container down
                        boxShadow: { xs: "none", md: "0px 4px 16px rgba(0, 0, 0, 0.15)" }, // Desktop-only shadow
                        padding: { xs: 1, md: 2 }, // Reduced padding
                        borderRadius: 2, // Softer corners
                        boxSizing: "border-box", // Prevent overflow
                    }}
                >
                    <CssBaseline />
                    <Box
                        sx={{
                            minHeight: "50vh", // Kept for tighter fit
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center", // Centered content
                            paddingY: 4, // Consistent vertical padding
                            width: "100%",
                            maxWidth: { xs: "100%", md: "360px" }, // Full width on mobile, 360px on desktop
                            mx: "auto", // Center internal content
                            boxSizing: "border-box", // Prevent overflow
                        }}
                    >
                        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                            Welcome, {user.email}
                        </Typography>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }} // Full-width button
                            onClick={handleSignOut}
                        >
                            Sign Out
                        </Button>
                    </Box>
                </Container>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Container
                component="main"
                maxWidth={false} // Override default maxWidth
                sx={{
                    width: { xs: "min(90vw, 320px)", md: "400px" }, // Responsive width: 90vw or 320px on mobile, 400px on desktop
                    mx: "auto", // Center horizontally
                    mt: { xs: 4, md: 8 }, // Top margin to push container down
                    boxShadow: { xs: "none", md: "0px 4px 16px rgba(0, 0, 0, 0.15)" }, // Desktop-only shadow
                    padding: { xs: 1, md: 2 }, // Reduced padding
                    borderRadius: 2, // Softer corners
                    boxSizing: "border-box", // Prevent overflow
                }}
            >
                <CssBaseline />
                <Box
                    sx={{
                        minHeight: "50vh", // Kept for tighter fit
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center", // Centered content
                        paddingY: 4, // Consistent vertical padding
                        width: "100%",
                        maxWidth: { xs: "100%", md: "360px" }, // Full width on mobile, 360px on desktop
                        mx: "auto", // Center internal content
                        boxSizing: "border-box", // Prevent overflow
                    }}
                >
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        {authMode === "signin" ? "Sign In" : "Sign Up"}
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                            {error}
                        </Alert>
                    )}
                    {emailConfirmationRequired && (
                        <Alert severity="info" sx={{ mb: 2, width: "100%" }}>
                            Please confirm your account via email, sent to {email}.
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: "100%" }}>
                        {authMode === "signup" && (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                autoFocus
                                sx={{ mb: 2 }}
                            />
                        )}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus={authMode === "signin"} // Auto-focus email only for sign-in
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        {authMode === "signin" && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        value="remember"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Remember me"
                                sx={{ mb: 2 }}
                            />
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }} // Full-width button
                        >
                            {authMode === "signin" ? "Sign In" : "Sign Up"}
                        </Button>

                        <Grid container justifyContent="center">
                            <Grid item>
                                <Link
                                    href="#"
                                    variant="body2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setAuthMode(authMode === "signin" ? "signup" : "signin");
                                        setError(null);
                                        setEmailConfirmationRequired(false);
                                    }}
                                    sx={{ textDecoration: "underline", color: "primary.main" }}
                                >
                                    {authMode === "signin"
                                        ? "Don't have an account? Sign Up"
                                        : "Already have an account? Sign In"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default Auth;