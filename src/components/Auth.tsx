import React, { useEffect, useState } from "react";
import {
    Button,
    CssBaseline,
    TextField,
    FormControlLabel,
    Checkbox,
    Link,
    Box,
    Typography,
    Container,
    Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import {useCookies} from "react-cookie";

interface AuthProps {
    onAuthChange: (user: any) => void;
    onSignOut: () => void;
}

const theme = createTheme();

const Auth: React.FC<AuthProps> = ({ onAuthChange, onSignOut }) => {
    const [cookies, setCookie, removeCookie] = useCookies();
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [emailConfirmationRequired, setEmailConfirmationRequired] =
        useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = cookies["authToken"];
        if (storedToken) {
            validateToken(storedToken)
                .then((validUser) => {
                    if (validUser) {
                        setUser(validUser);
                        onAuthChange(validUser);
                    } else {
                        removeCookie("authToken");
                    }
                })
                .catch(() => removeCookie("authToken"))
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [onAuthChange]);

    const validateToken = async (token: string): Promise<any> => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_GATEWAY_URL}/validate-token`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response?.data?.user || null;
        } catch {
            return null;
        }
    };

    const handleSignUp = async () => {
        setError(null);
        if (!email.trim() || !password.trim() || !fullName.trim()) {
            setError("Please fill email, password, and full name");
            return;
        }
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/signup`,
                { email, password, fullName },
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
                if (token) {
                    setCookie("authToken", token); // Always save token
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
                setCookie("authToken", token); // Always save token
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
            removeCookie("authToken");
            onSignOut();
        } catch {}
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        authMode === "signin" ? handleSignIn() : handleSignUp();
    };

    return isLoading ? <></> : (
        <ThemeProvider theme={theme}>
            <Container
                component="main"
                maxWidth={false}
                sx={{
                    width: { xs: "min(90vw, 320px)", md: "400px" },
                    mx: "auto",
                    mt: { xs: 4, md: 8 },
                    boxShadow: { xs: "none", md: "0px 4px 16px rgba(0, 0, 0, 0.15)" },
                    padding: { xs: 1, md: 2 },
                    borderRadius: 2,
                    boxSizing: "border-box",
                }}
            >
                <CssBaseline/>
                <Box
                    sx={{
                        minHeight: "50vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingY: 4,
                        width: "100%",
                        maxWidth: { xs: "100%", md: "360px" },
                        mx: "auto",
                        boxSizing: "border-box",
                    }}
                >
                    <Typography component="h1" variant="h5" sx={{mb: 3}}>
                        {authMode === "signin" ? "Sign In" : "Sign Up"}
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{mb: 2, width: "100%"}}>
                            {error}
                        </Alert>
                    )}
                    {emailConfirmationRequired && (
                        <Alert severity="info" sx={{mb: 2, width: "100%"}}>
                            Please confirm your account via email, sent to {email}.
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{mt: 2, width: "100%"}}>
                        {authMode === "signup" && (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                autoFocus
                                sx={{mb: 2}}
                            />
                        )}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus={authMode === "signin"}
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
                            sx={{mb: 2}}
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
                                sx={{mb: 2}}
                            />
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {authMode === "signin" ? "Sign In" : "Sign Up"}
                        </Button>

                        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                            <Box sx={{ textAlign: "center", width: "100%" }}>
                                <Link
                                    href="#"
                                    variant="body2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setAuthMode(authMode === "signin" ? "signup" : "signin");
                                        setError(null);
                                        setEmailConfirmationRequired(false);
                                    }}
                                    sx={{textDecoration: "underline", color: "primary.main"}}
                                >
                                    {authMode === "signin"
                                        ? "Don't have an account? Sign Up"
                                        : "Already have an account? Sign In"}
                                </Link>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default Auth;