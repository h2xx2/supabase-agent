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
import { useTranslation } from "react-i18next";

interface AuthProps {
    onAuthChange: (user: any) => void;
    onSignOut: () => void;
}

const theme = createTheme();

const Auth: React.FC<AuthProps> = ({ onAuthChange }) => {
    const { t } = useTranslation();

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
                t("auth.msgUnexpectedError");

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
            return rawString.includes(t("auth.msgEmailNotConfirmed"));
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
            setError(t("auth.msgErrFillFields"));
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
                    setError(t("auth.msgErrNotConfirmedCheckEmail"));
                    return;
                } else {
                    setError(parsedBody.error || parsedBody.message || t("auth.msgSignUpErr"));
                    return;
                }
            }

            const { user, token, requires_email_confirmation } = parsedBody || {};

            if (user) {
                if (requires_email_confirmation || !token) {
                    setEmailConfirmationRequired(true);
                    setError(t("auth.msgConfirmYourAccount"));
                    return;
                }
                setUser(user);
                if (token) {
                    setCookie("authToken", token, { path: '/' });
                }
                onAuthChange(user);
            } else {
                setError(t("auth.msgSignUpSuccessUserNotFound"));
                setLastErrorRaw(parsedBody);
            }
        } catch (err: any) {
            const { message, raw } = extractErrorMessage(err);
            if (rawIndicatesEmailNotConfirmed(raw, message)) {
                setEmailConfirmationRequired(true);
                setError(t("auth.msgErrNotConfirmedCheckEmail"));
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
            setError(t("auth.msgFillEmailAndPassword"));
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
                    setError(t("auth.msgErrNotConfirmedCheckEmail"));
                    return;
                } else {
                    setError(data.error || data.message || t("auth.msgErrIncorrectServerResponse"));
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
                setError(t("auth.msgErrIncorrectServerResponse"));
                setLastErrorRaw(data);
            }
        } catch (err: any) {
            const { message, raw } = extractErrorMessage(err);
            if (rawIndicatesEmailNotConfirmed(raw, message)) {
                setEmailConfirmationRequired(true);
                setError(t("auth.msgErrNotConfirmedCheckEmail"));
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
            setError(t("auth.msgErrEnterEmailResendLink"));
            return;
        }

        startCooldown(60);

        try {
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/resend-verification`,
                { email },
                { headers: { "Content-Type": "application/json" } }
            );
            setResendSuccess(t('auth.msgVerificationEmailSent') + email);
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
                            {authMode === "signin" ? t("auth.signIn") : t("auth.signUp")}
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
                                    { t('auth.didntReceiveEmail') }
                                    {cooldownSeconds > 0 ? (
                                        <Typography
                                            component="span"
                                            sx={{ color: "text.disabled", fontWeight: 500 }}
                                        >
                                            { t('auth.resendVerificationSeconds', { seconds: cooldownSeconds }) }
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
                                            { t('auth.resendVerification') }
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
                                        label={ t("auth.labelFirstName") }
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        autoFocus
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        label={ t("auth.labelLastName") }
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
                                label={ t("auth.labelEmail") }
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus={authMode === "signin"}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label={ t("password") }
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
                                    label={ t("auth.labelRememberMe") }
                                    sx={{ mb: 2 }}
                                />
                            )}

                            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                                {authMode === "signin" ? t("auth.signIn") : t("auth.signUp")}
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                sx={{ mt: 2, mb: 2 }}
                                onClick={async () => {
                                    try {
                                        const res = await axios.post(
                                            `${import.meta.env.VITE_API_GATEWAY_URL}/auth-google`,
                                            {},
                                            { headers: { "Content-Type": "application/json" } }
                                        );

                                        const { url } = res.data;
                                        if (url) {
                                            window.location.href = url;
                                        } else {
                                            setError(t('auth.failedGoogleSignIn'));
                                        }
                                    } catch (err: any) {
                                        console.error("Google auth error:", err);
                                        setError(t('auth.googleSignInFailed'));
                                    }
                                }}
                            >
                               { t("auth.signInWithGoogle") }
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
                                            ? t("auth.notHaveAccount")
                                            : t("auth.haveAccount")}
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