import React from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    Link,
    Alert,
} from "@mui/material";

interface AuthFormProps {
    isMobileForm: boolean;
    authMode: "signin" | "signup";
    setAuthMode: (mode: "signin" | "signup") => void;
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    firstName: string;
    setFirstName: (val: string) => void;
    lastName: string;
    setLastName: (val: string) => void;
    rememberMe: boolean;
    setRememberMe: (val: boolean) => void;
    error: string | null;
    resendSuccess: string | null;
    emailConfirmationRequired: boolean;
    cooldownSeconds: number;
    handleSubmit: (e: React.FormEvent) => void;
    handleResendEmail: () => void;
    handleGoogleSignIn: () => void;
    googleButtonSx: any;
    GoogleIcon: React.FC;
}

export const AuthForm: React.FC<AuthFormProps> = (props) => {
    const {
        isMobileForm, authMode, setAuthMode, email, setEmail,
        password, setPassword, firstName, setFirstName,
        lastName, setLastName, rememberMe, setRememberMe,
        error, resendSuccess, handleSubmit,
        handleGoogleSignIn, googleButtonSx, GoogleIcon
    } = props;

    return (
        <Box sx={{ width: "100%" }}>
            <img
                src="/youagent_me_logo.png"
                alt="youagent.me"
                style={{ width: "100%", borderRadius: 10, maxHeight: 160, objectFit: "cover", marginBottom: 12, background: "transparent" }}
            />
            <Container
                component="main"
                sx={isMobileForm
                    ? { p: 0 }
                    : { boxShadow: "0px 6px 22px rgba(0,0,0,0.08)", p: 2, borderRadius: 2, background: "#fff" }
                }
            >
                <Typography component="h1" variant="h5" sx={{ textAlign: "center", mb: 2 }}>
                    {authMode === "signin" ? "Sign In" : "Sign Up"}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {resendSuccess && <Alert severity="success" sx={{ mb: 2 }}>{resendSuccess}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    {authMode === "signup" && (
                        <>
                            <TextField margin="normal" required fullWidth label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            <TextField margin="normal" required fullWidth label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </>
                    )}
                    <TextField margin="normal" required fullWidth label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <TextField margin="normal" required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                    {authMode === "signin" && (
                        <FormControlLabel
                            control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />}
                            label="Remember me"
                        />
                    )}

                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                        {authMode === "signin" ? "Sign In" : "Sign Up"}
                    </Button>

                    <Button fullWidth variant="outlined" sx={googleButtonSx} startIcon={<GoogleIcon />} onClick={handleGoogleSignIn}>
                        Sign in with Google
                    </Button>

                    <Box sx={{ mt: 2, textAlign: "center" }}>
                        <Link href="#" variant="body2" onClick={(e) => {
                            e.preventDefault();
                            setAuthMode(authMode === "signin" ? "signup" : "signin");
                        }}>
                            {authMode === "signin" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};