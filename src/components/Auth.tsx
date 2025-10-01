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
    const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
    const cooldownRef = useRef<number | null>(null);
    const [, setLastErrorRaw] = useState<any>(null);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const hash = window.location.hash;
            if (hash.includes("access_token")) {
                try {
                    const params = new URLSearchParams(hash.replace("#", ""));
                    const accessToken = params.get("access_token");

                    if (!accessToken) {
                        setError("Токен доступа отсутствует");
                        return;
                    }

                    // Отправляем access_token на бэкенд
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_GATEWAY_URL}/auth-google-callback`,
                        { access_token: accessToken },
                        { headers: { "Content-Type": "application/json" } }
                    );

                    const { user, token } = response.data;
                    if (user && token) {
                        setUser(user);
                        setCookie("authToken", token, { path: '/' });
                        onAuthChange(user);
                        // Очищаем фрагмент URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                    } else {
                        setError("Не удалось обработать ответ сервера");
                    }
                } catch (err: any) {
                    const { message } = extractErrorMessage(err);
                    setError(message);
                }
            }
        };

        // Проверка сохранённого токена или OAuth callback
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
                .finally(() => setIsLoading(false));
        } else {
            handleOAuthCallback().finally(() => setIsLoading(false));
        }

        // Очистка при размонтировании
        return () => {
            if (cooldownRef.current) {
                clearInterval(cooldownRef.current);
            }
        };
    }, [onAuthChange, cookies, removeCookie]);

    // Управление интервалом отсчёта для повторной отправки email
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

        if (cooldownSeconds === 0 && cooldownRef.current) {
            clearInterval(cooldownRef.current);
            cooldownRef.current = null;
        }

        return () => {};
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
        if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
            cooldownRef.current = null;
        }
        setCooldownSeconds(seconds);
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
                    setCookie("authToken", token, { path: '/' });
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
                setCookie("authToken", token, { path: '/' });
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

        startCooldown(60);

        try {
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/resend-verification`,
                { email },
                { headers: { "Content-Type": "application/json" } }
            );
            setResendSuccess("Verification email sent to " + email);
        } catch (err: any) {
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
    const GoogleIcon = () => (
        <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z"
                fill="#4285F4"
            />
            <path
                d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H1.03636V13.0236C2.51545 15.7105 5.39455 18 9 18Z"
                fill="#34A853"
            />
            <path
                d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.97636H1.03636C0.402273 6.14318 0 7.51773 0 9C0 10.4823 0.402273 11.8568 1.03636 13.0236L3.96409 10.71Z"
                fill="#FBBC05"
            />
            <path
                d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.39455 0 2.51545 2.28955 1.03636 4.97636L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
                fill="#EA4335"
            />
        </svg>
    );

    return isLoading ? (
        <></>
    ) : (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    width: { xs: "min(90vw, 320px)", md: "400px" },
                    mx: 'auto',
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <img
                    src='/youagent_me_logo.jpg'
                    alt='youagent.me'
                    loading="lazy"
                    style={{
                        width: "100%",
                        borderRadius: "10px"
                    }}
                />
                <Container
                    component="main"
                    maxWidth
                    sx={{
                        mt: "7px",
                        boxShadow: { xs: "none", md: "0px 4px 16px rgba(0, 0, 0, 0.15)" },
                        padding: { xs: 1, md: 2 },
                        borderRadius: 2,
                        boxSizing: "border-box",
                    }}
                >
                    <CssBaseline />
                    <Box
                        sx={{
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
                            <Button
                                fullWidth
                                variant="outlined"
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    backgroundColor: '#FFFFFF', // Белый фон, как в HTML
                                    color: '#444444', // Тёмный текст
                                    borderColor: '#888888', // Серая рамка
                                    borderWidth: '1px',
                                    borderRadius: '5px', // Закруглённые углы
                                    boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.2)', // Тень
                                    textTransform: 'none',
                                    fontFamily: 'Roboto, Arial, sans-serif',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    height: '42px', // Высота как в HTML
                                    padding: '0 24px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    '&:hover': {
                                        backgroundColor: '#F8F8F8', // Лёгкое затемнение при наведении
                                        borderColor: '#888888',
                                        boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)', // Усиленная тень
                                    },
                                }}
                                startIcon={
                                    <Box sx={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <GoogleIcon />
                                    </Box>
                                }
                                onClick={async () => {
                                    try {
                                        const res = await axios.post(
                                            `${import.meta.env.VITE_API_GATEWAY_URL}/auth-google`,
                                            {},
                                            { headers: { 'Content-Type': 'application/json' } }
                                        );

                                        const { url } = res.data;
                                        if (url) {
                                            window.location.href = url;
                                        } else {
                                            setError('Не удалось начать вход через Google');
                                        }
                                    } catch (err) {
                                        console.error('Ошибка входа через Google:', err);
                                        setError('Вход через Google не удался');
                                    }
                                }}
                            >
                                Sign in with Google
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
            </Box>
        </ThemeProvider>
    );
};

export default Auth;