import React, { useEffect, useRef, useState } from "react";
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
import { useCookies } from "react-cookie";

interface AuthProps {
    onAuthChange: (user: any) => void;
    onSignOut: () => void;
}

const theme = createTheme();

const Auth: React.FC<AuthProps> = ({ onAuthChange }) => {
    const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [resendSuccess, setResendSuccess] = useState<string | null>(null);

    // cooldown state: seconds remaining (0 = ready)
    const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
    const cooldownRef = useRef<number | null>(null);

    // Для отладки: показываем "сырые" данные ответа (можешь убрать)
    const [, setLastErrorRaw] = useState<any>(null);

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

        // cleanup on unmount
        return () => {
            if (cooldownRef.current) {
                clearInterval(cooldownRef.current);
            }
        };
    }, [onAuthChange, cookies, removeCookie]);

    // управляем интервалом отсчёта
    useEffect(() => {
        if (cooldownSeconds > 0 && !cooldownRef.current) {
            cooldownRef.current = window.setInterval(() => {
                setCooldownSeconds((s) => {
                    if (s <= 1) {
                        if (cooldownRef.current) {
                            clearInterval(cooldownRef.current);
                            cooldownRef.current = null;
                        }
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);
        }

        // если cooldownSeconds сброшен вручную, очистим интервал
        if (cooldownSeconds === 0 && cooldownRef.current) {
            clearInterval(cooldownRef.current);
            cooldownRef.current = null;
        }

        return () => {
            // не очищаем интервал каждый рендер, оставляем в cleanup выше
        };
    }, [cooldownSeconds]);

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

    const extractErrorMessage = (err: any): { message: string; raw: any } => {
        try {
            const rawResponse = err?.response ?? err;
            console.log("DEBUG: full error object:", err);
            setLastErrorRaw(rawResponse?.data ?? rawResponse);

            let serverData: any = rawResponse?.data;

            if (typeof serverData === "string") {
                try {
                    serverData = JSON.parse(serverData);
                } catch {
                    // оставляем строку
                }
            }

            if (serverData && typeof serverData === "object" && typeof serverData.body === "string") {
                try {
                    const parsedBody = JSON.parse(serverData.body);
                    serverData = { ...serverData, ...parsedBody };
                } catch {
                    // игнорируем
                }
            }

            const msg =
                (serverData && (serverData.message || serverData.error)) ||
                err?.message ||
                "Unexpected error. Please try again later.";

            return { message: String(msg), raw: serverData ?? rawResponse };
        } catch (ex) {
            console.error("DEBUG: extractErrorMessage failed", ex);
            return { message: err?.message ?? "Unknown error", raw: err };
        }
    };

    const rawIndicatesEmailNotConfirmed = (raw: any, message: string) => {
        try {
            if (typeof message === "string" && message.includes("Email not confirmed")) return true;
            const rawString = typeof raw === "string" ? raw : JSON.stringify(raw || {});
            return rawString.includes("Email not confirmed");
        } catch {
            return false;
        }
    };

    const startCooldown = (seconds = 60) => {
        // сбрасываем существующие
        if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
            cooldownRef.current = null;
        }
        setCooldownSeconds(seconds);
        // интервал создаётся эффектом выше
    };

    const handleSignUp = async () => {
        setError(null);
        setResendSuccess(null);
        setLastErrorRaw(null);
        if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
            setError("Please fill email, password, first name, and last name");
            return;
        }
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/signup`,
                { email, password, first_name: firstName, last_name: lastName },
                { headers: { "Content-Type": "application/json" } }
            );

            const outerData = response.data;
            const parsedBody =
                typeof outerData?.body === "string"
                    ? JSON.parse(outerData.body)
                    : outerData.body ?? outerData;

            // Если сервер вернул ошибку внутри успешного ответа — отработаем её
            if (parsedBody && (parsedBody.error || parsedBody.message)) {
                setLastErrorRaw(parsedBody);
                if (rawIndicatesEmailNotConfirmed(parsedBody, parsedBody.error || parsedBody.message)) {
                    setEmailConfirmationRequired(true);
                    setError("Email not confirmed. Please check your email.");
                    return;
                } else {
                    setError(parsedBody.error || parsedBody.message || "Sign Up error");
                    return;
                }
            }

            const { user, token, requires_email_confirmation } = parsedBody || {};

            if (user) {
                if (requires_email_confirmation || !token) {
                    setEmailConfirmationRequired(true);
                    setError("Please confirm your account via email. Sign in after confirmation");
                    return;
                }
                setUser(user);
                if (token) {
                    setCookie("authToken", token);
                }
                onAuthChange(user);
            } else {
                setError("Sign Up has succeeded, but user was not found");
                setLastErrorRaw(parsedBody);
            }
        } catch (err: any) {
            const { message, raw } = extractErrorMessage(err);
            if (rawIndicatesEmailNotConfirmed(raw, message)) {
                setEmailConfirmationRequired(true);
                setError("Email not confirmed. Please check your email.");
            } else {
                setError(message);
            }
        }
    };

    const handleSignIn = async () => {
        setError(null);
        setResendSuccess(null);
        setLastErrorRaw(null);
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
                typeof outerData?.body === "string"
                    ? JSON.parse(outerData.body)
                    : outerData.body ?? outerData;

            // Если сервер поместил ошибку внутрь ответа (200) — отработаем её
            if (data && (data.error || data.message)) {
                setLastErrorRaw(data);
                if (rawIndicatesEmailNotConfirmed(data, data.error || data.message)) {
                    setEmailConfirmationRequired(true);
                    setError("Email not confirmed. Please check your email.");
                    return;
                } else {
                    setError(data.error || data.message || "Incorrect server response");
                    return;
                }
            }

            const { user, token } = data || {};
            if (user && token) {
                setUser(user);
                setCookie("authToken", token);
                onAuthChange(user);
            } else {
                console.warn("DEBUG: signin returned without token or user:", data);
                setError("Incorrect server response");
                setLastErrorRaw(data);
            }
        } catch (err: any) {
            const { message, raw } = extractErrorMessage(err);
            if (rawIndicatesEmailNotConfirmed(raw, message)) {
                setEmailConfirmationRequired(true);
                setError("Email not confirmed. Please check your email.");
            } else {
                setError(message);
            }
        }
    };

    const handleResendVerificationEmail = async () => {
        setError(null);
        setResendSuccess(null);
        setLastErrorRaw(null);

        if (!email.trim()) {
            setError("Please enter an email to resend the verification link");
            return;
        }

        // Блокируем сразу при клике — но если запрос упадёт, откатим (см. catch)
        startCooldown(60);

        try {
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/resend-verification`,
                { email },
                { headers: { "Content-Type": "application/json" } }
            );
            setResendSuccess("Verification email sent to " + email);
        } catch (err: any) {
            // если ошибка — откатываем cooldown, показываем ошибку
            if (cooldownRef.current) {
                clearInterval(cooldownRef.current);
                cooldownRef.current = null;
            }
            setCooldownSeconds(0);

            const { message, raw } = extractErrorMessage(err);
            setError(message);
            setLastErrorRaw(raw);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        authMode === "signin" ? handleSignIn() : handleSignUp();
    };

    return isLoading ? (
        <></>
    ) : (
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
                <CssBaseline />
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
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        {authMode === "signin" ? "Sign In" : "Sign Up"}
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                            {error}
                        </Alert>
                    )}
                    {resendSuccess && (
                        <Alert severity="success" sx={{ mb: 2, width: "100%" }}>
                            {resendSuccess}
                        </Alert>
                    )}
                    {emailConfirmationRequired && (
                        <Box sx={{ mb: 2, width: "100%", textAlign: "center" }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Didn't receive the email?{" "}
                                {cooldownSeconds > 0 ? (
                                    <Typography
                                        component="span"
                                        sx={{ color: "text.disabled", fontWeight: 500 }}
                                    >
                                        Resend verification email ({cooldownSeconds}s)
                                    </Typography>
                                ) : (
                                    <Link
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleResendVerificationEmail();
                                        }}
                                        sx={{ textDecoration: "underline", color: "primary.main" }}
                                    >
                                        Resend verification email
                                    </Link>
                                )}
                            </Typography>
                        </Box>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: "100%" }}>
                        {authMode === "signup" && (
                            <>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    autoFocus
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            </>
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

                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
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
                                        setResendSuccess(null);
                                        setLastErrorRaw(null);
                                    }}
                                    sx={{ textDecoration: "underline", color: "primary.main" }}
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
