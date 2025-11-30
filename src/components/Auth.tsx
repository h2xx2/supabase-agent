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
    Paper,
    IconButton,
    InputBase,
    Divider,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import axios from "axios";
import { useCookies } from "react-cookie";

interface AuthProps {
    onAuthChange: (user: any) => void;
    onSignOut?: () => void;
}

const theme = createTheme();
type Agent = { id: number; name: string; desc: string };

const AUTH_PANEL_WIDTH = 380; // ширина правой панели в px (десктоп)

// z-index константы — контролируют порядок наложения
const AUTH_Z = 1600;       // авторизация — всегда сверху
const CHAT_Z = 1700;       // чат
const AGENTS_Z = 1800;     // сам список агентов (overlay)
const AGENTS_BG_Z = 1750;  // затемняющий фон перед списком агентов
const PEEK_Z = 1650;       // peek чата (маленькая полоска)

const Auth: React.FC<AuthProps> = ({ onAuthChange }) => {
    // -----------------------
    // AUTH STATE / LOGIC (оставлена ваша логика)
    // -----------------------
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
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_GATEWAY_URL}/auth-google-callback`,
                        { access_token: accessToken },
                        { headers: { "Content-Type": "application/json" } }
                    );
                    const { user, token } = response.data;
                    if (user && token) {
                        setUser(user);
                        setCookie("authToken", token, { path: "/" });
                        onAuthChange(user);
                        window.history.replaceState({}, document.title, window.location.pathname);
                    } else setError("Не удалось обработать ответ сервера");
                } catch (err: any) {
                    const { message } = extractErrorMessage(err);
                    setError(message);
                }
            }
        };

        const storedToken = cookies["authToken"];
        if (storedToken) {
            validateToken(storedToken)
                .then((validUser) => {
                    if (validUser) {
                        setUser(validUser);
                        onAuthChange(validUser);
                    } else removeCookie("authToken");
                })
                .catch(() => removeCookie("authToken"))
                .finally(() => setIsLoading(false));
        } else handleOAuthCallback().finally(() => setIsLoading(false));

        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    }, [cooldownSeconds]);

    const validateToken = async (token: string): Promise<any> => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_GATEWAY_URL}/validate-token`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response?.data?.user || null;
        } catch {
            return null;
        }
    };

    const extractErrorMessage = (err: any): { message: string; raw: any } => {
        try {
            const rawResponse = err?.response ?? err;
            setLastErrorRaw(rawResponse?.data ?? rawResponse);
            let serverData: any = rawResponse?.data;
            if (typeof serverData === "string") {
                try {
                    serverData = JSON.parse(serverData);
                } catch {}
            }
            if (serverData && typeof serverData === "object" && typeof serverData.body === "string") {
                try {
                    const parsedBody = JSON.parse(serverData.body);
                    serverData = { ...serverData, ...parsedBody };
                } catch {}
            }
            const msg = (serverData && (serverData.message || serverData.error)) || err?.message || "Unexpected error. Please try again later.";
            return { message: String(msg), raw: serverData ?? rawResponse };
        } catch (ex) {
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
            const response = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/signup`, { email, password, first_name: firstName, last_name: lastName });
            const outerData = response.data;
            const parsedBody = typeof outerData?.body === "string" ? JSON.parse(outerData.body) : outerData.body ?? outerData;
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
                if (token) setCookie("authToken", token, { path: "/" });
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
            } else setError(message);
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
            const response = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/signin`, { email, password });
            const outerData = response.data;
            const data = typeof outerData?.body === "string" ? JSON.parse(outerData.body) : outerData.body ?? outerData;
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
                setCookie("authToken", token, { path: "/" });
                onAuthChange(user);
            } else {
                setError("Incorrect server response");
                setLastErrorRaw(data);
            }
        } catch (err: any) {
            const { message, raw } = extractErrorMessage(err);
            if (rawIndicatesEmailNotConfirmed(raw, message)) {
                setEmailConfirmationRequired(true);
                setError("Email not confirmed. Please check your email.");
            } else setError(message);
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
            await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/resend-verification`, { email });
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

    // -----------------------
    // CHAT & AGENTS UI
    // -----------------------
    const agents: Agent[] = [
        { id: 1, name: "GermanTranslator", desc: "Translate all incoming messages to German. Do not ask any questions..." },
        { id: 2, name: "FrenchTranslator", desc: "Translate all messages to French instantly." },
        { id: 3, name: "CodeReviewer", desc: "Review code and suggest improvements." },
    ];
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0]);

    const [mobileChatOpen, setMobileChatOpen] = useState(false); // full screen chat (mobile)
    const [mobileAgentListOpen, setMobileAgentListOpen] = useState(false); // agent list overlay (mobile)

    type Msg = { id: string | number; direction: "incoming" | "outgoing"; message?: string; attachedFileName?: string };
    const [messages, setMessages] = useState<Msg[]>([{ id: 1, direction: "incoming", message: "Hello! I'm aurora. How can I help?" }]);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

    const [viewportHeight, setViewportHeight] = useState<number>(window.innerHeight);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 900);
    useEffect(() => {
        const onResize = () => {
            setViewportHeight(window.innerHeight);
            setIsMobile(window.innerWidth < 900);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const messageListRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (messageListRef.current) messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, [messages, mobileChatOpen, mobileAgentListOpen]);

    const handleAgentClick = (a: Agent) => {
        setSelectedAgent(a);
        if (isMobile) {
            setMobileChatOpen(true);
            setMobileAgentListOpen(false);
        }
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files && e.target.files[0];
        if (f) {
            setAttachedFileName(f.name);
        }
    };

    const removeAttachedFile = () => {
        setAttachedFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const sendChatMessage = (msgText?: string) => {
        const text = (msgText ?? "").trim();
        if (!text && !attachedFileName) return;
        const newMsg: Msg = { id: Date.now(), direction: "outgoing", message: text || undefined, attachedFileName: attachedFileName || undefined };
        setMessages((m) => [...m, newMsg]);
        removeAttachedFile();
    };

    if (isLoading) return <></>;

    // -----------------------
    // RENDER
    // -----------------------
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ height: "83vh", overflow: "hidden" }}>
                {/* DESKTOP/TABLET: left combined + right auth */}
                {!isMobile && (
                    <>
                        <Box
                            sx={{
                                position: "fixed",
                                left: 24,
                                top: 24,
                                bottom: 24,
                                right: `${AUTH_PANEL_WIDTH + 48}px`,
                                borderRadius: 2,
                                boxShadow: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.paper",
                                display: "flex",
                                zIndex: CHAT_Z, // чат-блок под авторизацией
                                overflow: "hidden",
                            }}
                        >
                            <Box sx={{ width: 320, borderRight: "1px solid", borderColor: "divider", p: 3, overflowY: "auto" }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Temporary agents
                                </Typography>
                                <List sx={{ gap: 1 }}>
                                    {agents.map((a) => {
                                        const active = selectedAgent?.id === a.id;
                                        return (
                                            <ListItem
                                                key={a.id}
                                                onClick={() => handleAgentClick(a)}
                                                sx={{
                                                    cursor: "pointer",
                                                    p: 2,
                                                    mb: 1.25,
                                                    borderRadius: 2,
                                                    border: "1px solid",
                                                    borderColor: active ? "primary.main" : "divider",
                                                    bgcolor: active ? "rgba(25,118,210,0.03)" : "transparent",
                                                }}
                                            >
                                                <ListItemText
                                                    primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{a.name}</Typography>}
                                                    secondary={<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{a.desc}</Typography>}
                                                />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </Box>

                            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#fff" }}>
                                <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                                    <Typography variant="subtitle1">{selectedAgent ? selectedAgent.name : "Select an agent"}</Typography>
                                </Box>

                                <Box ref={messageListRef} sx={{ flex: 1, p: 3, overflowY: "auto", background: "#fff" }}>
                                    {messages.map((m) => (
                                        <Box key={m.id} sx={{ display: "flex", justifyContent: m.direction === "outgoing" ? "flex-end" : "flex-start", mb: 1 }}>
                                            <Paper sx={{ p: 1, px: 2, borderRadius: 2, maxWidth: "70%", bgcolor: m.direction === "outgoing" ? "#eaf3ff" : "#f5f7fa" }}>
                                                {m.message && <Typography variant="body2">{m.message}</Typography>}
                                                {m.attachedFileName && (
                                                    <Box sx={{ mt: 1, display: "inline-flex", alignItems: "center", gap: 1 }}>
                                                        <DescriptionIcon sx={{ color: "#1976d2" }} />
                                                        <Typography sx={{ fontWeight: 600 }}>{m.attachedFileName}</Typography>
                                                    </Box>
                                                )}
                                            </Paper>
                                        </Box>
                                    ))}
                                </Box>

                                <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "#fff" }}>
                                    {attachedFileName && (
                                        <Box sx={{ mb: 1, p: 1, backgroundColor: "#f5f5f5", borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <DescriptionIcon color="primary" />
                                                <Box>
                                                    <Typography fontSize="0.9rem" fontWeight="medium" noWrap>{attachedFileName}</Typography>
                                                    <Typography fontSize="0.75rem" color="text.secondary">Ready to send</Typography>
                                                </Box>
                                            </Box>
                                            <IconButton size="small" onClick={removeAttachedFile}><CloseIcon fontSize="small" /></IconButton>
                                        </Box>
                                    )}

                                    <Paper component="form" onSubmit={(e) => { e.preventDefault(); const input = (e.target as HTMLFormElement).elements.namedItem("msg") as HTMLInputElement; sendChatMessage(input?.value); if (input) input.value = ""; }} sx={{ display: "flex", alignItems: "center", gap: 1, p: "6px 10px", borderRadius: "22px" }}>
                                        <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx,.csv,.xls,.xlsx" onChange={handleFileSelected} style={{ display: "none" }} />
                                        <IconButton size="small" onClick={() => fileInputRef.current?.click()}><AttachFileIcon fontSize="small" /></IconButton>
                                        <InputBase name="msg" sx={{ ml: 1, flex: 1 }} placeholder="Write a message or attach a file..." />
                                        <Divider sx={{ height: 28, mr: 1 }} orientation="vertical" />
                                        <IconButton type="submit" sx={{ p: "10px" }}><SendIcon /></IconButton>
                                    </Paper>
                                </Box>
                            </Box>
                        </Box>

                        {/* RIGHT: fixed auth panel (всегда поверх) */}
                        <Box sx={{ position: "fixed", right: 24, top: "50%", transform: "translateY(-50%)", width: `${AUTH_PANEL_WIDTH}px`, zIndex: AUTH_Z }}>
                            <Box sx={{ width: "100%" }}>
                                <img src="/youagent_me_logo.jpg" alt="youagent.me" loading="lazy" style={{ width: "100%", borderRadius: 10, marginBottom: 12 }} />

                                <Container component="main" sx={{ boxShadow: "0px 6px 22px rgba(0,0,0,0.08)", p: 2, borderRadius: 2, background: "#fff" }}>
                                    <Typography component="h1" variant="h5" sx={{ textAlign: "center", mb: 2 }}>{authMode === "signin" ? "Sign In" : "Sign Up"}</Typography>

                                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                                    {resendSuccess && <Alert severity="success" sx={{ mb: 2 }}>{resendSuccess}</Alert>}

                                    {emailConfirmationRequired && (
                                        <Box sx={{ mb: 2, textAlign: "center" }}>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                Didn't receive the email?{" "}
                                                {cooldownSeconds > 0 ? <Typography component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>Resend verification email ({cooldownSeconds}s)</Typography> :
                                                    <Link href="#" onClick={(e) => { e.preventDefault(); handleResendVerificationEmail(); }} sx={{ textDecoration: "underline", color: "primary.main" }}>Resend verification email</Link>}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box component="form" onSubmit={handleSubmit} noValidate>
                                        {authMode === "signup" && <>
                                            <TextField margin="normal" required fullWidth label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                            <TextField margin="normal" required fullWidth label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                        </>}

                                        <TextField margin="normal" required fullWidth label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus={authMode === "signin"} />
                                        <TextField margin="normal" required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        {authMode === "signin" && <FormControlLabel control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />} label="Remember me" />}

                                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>{authMode === "signin" ? "Sign In" : "Sign Up"}</Button>
                                        <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={async () => {
                                            try {
                                                const res = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/auth-google`, {}, { headers: { "Content-Type": "application/json" } });
                                                const { url } = res.data;
                                                if (url) window.location.href = url;
                                                else setError("Failed to start Google sign-in");
                                            } catch (err: any) {
                                                setError("Google sign-in failed");
                                            }
                                        }}>Sign in with Google</Button>

                                        <Box sx={{ mt: 2, textAlign: "center" }}>
                                            <Link href="#" variant="body2" onClick={(e) => { e.preventDefault(); setAuthMode(authMode === "signin" ? "signup" : "signin"); setError(null); setEmailConfirmationRequired(false); setResendSuccess(null); setLastErrorRaw(null); }}>
                                                {authMode === "signin" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                                            </Link>
                                        </Box>
                                    </Box>
                                </Container>
                            </Box>
                        </Box>
                    </>
                )}

                {/* ========== MOBILE UI ========== */}
                {isMobile && (
                    <>
                        {/* AUTH PANEL (модалка, всегда поверх) */}
                        <Paper
                            elevation={12}
                            sx={{
                                position: "fixed",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "92%",
                                maxWidth: 420,
                                borderRadius: 2,
                                p: 1.5,
                                zIndex: AUTH_Z, // авторизация всегда сверху
                                background: "#fff",
                            }}
                        >
                            <Box sx={{ width: "100%" }}>
                                <img src="/youagent_me_logo.jpg" alt="youagent.me" loading="lazy" style={{ width: "100%", borderRadius: 10, marginBottom: 12 }} />

                                <Container component="main" sx={{ p: 0 }}>
                                    <Typography component="h1" variant="h5" sx={{ textAlign: "center", mb: 2 }}>{authMode === "signin" ? "Sign In" : "Sign Up"}</Typography>

                                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                                    {resendSuccess && <Alert severity="success" sx={{ mb: 2 }}>{resendSuccess}</Alert>}

                                    {emailConfirmationRequired && (
                                        <Box sx={{ mb: 2, textAlign: "center" }}>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                Didn't receive the email?{" "}
                                                {cooldownSeconds > 0 ? <Typography component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>Resend verification email ({cooldownSeconds}s)</Typography> :
                                                    <Link href="#" onClick={(e) => { e.preventDefault(); handleResendVerificationEmail(); }} sx={{ textDecoration: "underline", color: "primary.main" }}>Resend verification email</Link>}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box component="form" onSubmit={handleSubmit} noValidate>
                                        {authMode === "signup" && <>
                                            <TextField margin="normal" required fullWidth label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                            <TextField margin="normal" required fullWidth label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                        </>}

                                        <TextField margin="normal" required fullWidth label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus={authMode === "signin"} />
                                        <TextField margin="normal" required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        {authMode === "signin" && <FormControlLabel control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />} label="Remember me" />}

                                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>{authMode === "signin" ? "Sign In" : "Sign Up"}</Button>
                                        <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={async () => {
                                            try {
                                                const res = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/auth-google`, {}, { headers: { "Content-Type": "application/json" } });
                                                const { url } = res.data;
                                                if (url) window.location.href = url;
                                                else setError("Failed to start Google sign-in");
                                            } catch (err: any) {
                                                setError("Google sign-in failed");
                                            }
                                        }}>Sign in with Google</Button>

                                        <Box sx={{ mt: 2, textAlign: "center" }}>
                                            <Link href="#" variant="body2" onClick={(e) => { e.preventDefault(); setAuthMode(authMode === "signin" ? "signup" : "signin"); setError(null); setEmailConfirmationRequired(false); setResendSuccess(null); setLastErrorRaw(null); }}>
                                                {authMode === "signin" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                                            </Link>
                                        </Box>
                                    </Box>
                                </Container>
                            </Box>
                        </Paper>

                        {/* bottom peek: небольшая полоска чата (второстепенно), стрелка вверх открывает full chat */}
                        {!mobileChatOpen && (
                            <Paper
                                elevation={6}
                                sx={{
                                    position: "fixed",
                                    right: 12,
                                    left: 12,
                                    bottom: 38,
                                    height: 64,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    px: 2,
                                    zIndex: PEEK_Z,
                                    opacity: 0.95,
                                }}
                            >
                                <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: "#f1f3f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Typography variant="subtitle2">{selectedAgent?.name?.[0]?.toUpperCase() ?? "A"}</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2">{selectedAgent?.name}</Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {messages.length ? (messages[messages.length - 1].message ?? messages[messages.length - 1].attachedFileName ?? "") : ""}
                                        </Typography>
                                    </Box>
                                </Box>

                                <IconButton
                                    onClick={() => setMobileChatOpen(true)}
                                    sx={{ ml: 1 }}
                                    aria-label="Open chat"
                                >
                                    <KeyboardArrowUpIcon />
                                </IconButton>
                            </Paper>
                        )}

                        {/* full screen chat (под авторизацией) */}
                        {mobileChatOpen && selectedAgent && (
                            <Paper
                                role="dialog"
                                aria-label={`Chat with ${selectedAgent.name}`}
                                sx={{
                                    position: "fixed",
                                    zIndex: CHAT_Z,
                                    right: 0,
                                    bottom: 0,
                                    width: "100vw",
                                    height: `${viewportHeight}px`,
                                    display: "flex",
                                    flexDirection: "column",
                                    background: "#fff",
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                                    <IconButton onClick={() => setMobileAgentListOpen(true)} aria-label="Open agents"><MenuIcon /></IconButton>
                                    <Typography variant="h6" sx={{ flex: 1, textAlign: "center" }}>{selectedAgent.name}</Typography>
                                    {/* стрелка вниз (свернуть чат) */}
                                    <IconButton onClick={() => setMobileChatOpen(false)} aria-label="Close chat"><KeyboardArrowDownIcon /></IconButton>
                                </Box>

                                <Box ref={messageListRef} sx={{ flex: 1, p: 2, overflowY: "auto" }}>
                                    {messages.map((m) => (
                                        <Box key={m.id} sx={{ display: "flex", justifyContent: m.direction === "outgoing" ? "flex-end" : "flex-start", mb: 1 }}>
                                            <Paper sx={{ p: 1, px: 2, borderRadius: 2, maxWidth: "80%", bgcolor: m.direction === "outgoing" ? "#eaf3ff" : "#f5f7fa" }}>
                                                {m.message && <Typography variant="body2">{m.message}</Typography>}
                                                {m.attachedFileName && (
                                                    <Box sx={{ mt: 1, display: "inline-flex", alignItems: "center", gap: 1 }}>
                                                        <DescriptionIcon sx={{ color: "#1976d2" }} />
                                                        <Typography sx={{ fontWeight: 600 }}>{m.attachedFileName}</Typography>
                                                    </Box>
                                                )}
                                            </Paper>
                                        </Box>
                                    ))}
                                </Box>

                                <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                                    {attachedFileName && (
                                        <Box sx={{ mb: 1, p: 1, backgroundColor: "#f5f5f5", borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <DescriptionIcon color="primary" />
                                                <Box>
                                                    <Typography fontSize="0.9rem" fontWeight="medium" noWrap>{attachedFileName}</Typography>
                                                    <Typography fontSize="0.75rem" color="text.secondary">Ready to send</Typography>
                                                </Box>
                                            </Box>
                                            <IconButton size="small" onClick={removeAttachedFile}><CloseIcon fontSize="small" /></IconButton>
                                        </Box>
                                    )}

                                    <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx,.csv,.xls,.xlsx" onChange={handleFileSelected} style={{ display: "none" }} />
                                    <Paper component="form" onSubmit={(e) => { e.preventDefault(); const el = (e.target as HTMLFormElement).elements.namedItem("msgMobile") as HTMLInputElement; sendChatMessage(el?.value); if (el) el.value = ""; }} sx={{ display: "flex", alignItems: "center", gap: 1, p: "6px 10px", borderRadius: "20px" }}>
                                        <IconButton size="small" onClick={() => fileInputRef.current?.click()}><AttachFileIcon fontSize="small" /></IconButton>
                                        <InputBase name="msgMobile" sx={{ ml: 1, flex: 1 }} placeholder="Write a message or attach a file..." />
                                        <Divider sx={{ height: 28, mr: 1 }} orientation="vertical" />
                                        <IconButton type="submit" sx={{ p: "10px" }}><SendIcon /></IconButton>
                                    </Paper>
                                </Box>
                            </Paper>
                        )}

                        {/* Mobile agent list overlay (открывается слева при нажатии гамбургера в раскрытом чате) */}
                        {mobileAgentListOpen && (
                            <>
                                {/* затемняющий фон над чатом, но под авторизацией */}
                                <Box sx={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: AGENTS_BG_Z }} onClick={() => setMobileAgentListOpen(false)} />
                                <Paper sx={{ position: "fixed", left: 0, top: 0, height: `${viewportHeight}px`, width: "82%", zIndex: AGENTS_Z, display: "flex", flexDirection: "column" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                                        <Typography variant="h6">Temporary agents</Typography>
                                        <IconButton onClick={() => setMobileAgentListOpen(false)}><CloseIcon /></IconButton>
                                    </Box>

                                    <Box sx={{ p: 2, overflowY: "auto" }}>
                                        <List>
                                            {agents.map((a) => {
                                                const active = selectedAgent?.id === a.id;
                                                return (
                                                    <ListItem
                                                        key={a.id}
                                                        onClick={() => handleAgentClick(a)}
                                                        sx={{
                                                            cursor: "pointer",
                                                            p: 2,
                                                            mb: 1,
                                                            borderRadius: 2,
                                                            border: "1px solid",
                                                            borderColor: active ? "primary.main" : "divider",
                                                            bgcolor: active ? "rgba(25,118,210,0.03)" : "transparent",
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{a.name}</Typography>}
                                                            secondary={<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{a.desc}</Typography>}
                                                        />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Box>
                                </Paper>
                            </>
                        )}
                    </>
                )}
            </Box>
        </ThemeProvider>
    );
};

export default Auth;
