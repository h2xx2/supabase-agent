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
type Agent = {
    id: number | string;
    name: string;
    desc: string;
    agentId?: string;
    aliasId?: string;
    key?: string;
    isNew?: boolean;
};
const AUTH_PANEL_WIDTH = 380;
const AUTH_Z = 1600;
const CHAT_Z = 1700;
const AGENTS_Z = 1800;
const AGENTS_BG_Z = 1750;
const PEEK_Z = 1650;

type Msg = {
    id: string | number;
    direction: "incoming" | "outgoing";
    message?: string;
    attachedFileName?: string | null;
    sentTime?: string;
    sender?: string;
};

const Auth: React.FC<AuthProps> = ({ onAuthChange }) => {
    // -----------------------
    // AUTH STATE / LOGIC
    // -----------------------
    const [cookies, setCookie, removeCookie] = useCookies(["authToken", "isAnonymous", "userId", "refreshToken"]);
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
    const MAIN_PUBLIC_AGENT = {
        id: "youagent-master",
        name: "YouAgent-Master-Engine",
        desc: "Main public agent (anonymous)",
        agentId: "3QQS2QJUKY",
        aliasId: "GGALIIRVVC",
        key: "TfnWzfQl-6jDKq7gSvFP",
    } as Agent;

    const [agents, setAgents] = useState<Agent[]>([MAIN_PUBLIC_AGENT]);
    const [messagesByAgent, setMessagesByAgent] = useState<Record<string, Msg[]>>({});
    const [sessions, setSessions] = useState<Record<string, string>>({});
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(MAIN_PUBLIC_AGENT);
    const canAttach = Boolean(selectedAgent && String(selectedAgent.id) !== String(MAIN_PUBLIC_AGENT.id));
    const [agentsPollingInterval, setAgentsPollingInterval] = useState<NodeJS.Timeout | null>(null);
    useEffect(() => {
        setMessagesByAgent((prev) => {
            const copy = { ...prev };
            agents.forEach((a) => {
                const id = String(a.id);
                if (!copy[id]) {
                    copy[id] = []; // только если ещё нет
                }
            });
            return copy;
        });

        setSessions((prev) => {
            const copy = { ...prev };
            agents.forEach((a) => {
                const id = String(a.id);
                if (!copy[id]) {
                    copy[id] = generateSessionId();
                }
            });
            return copy;
        });
    }, [agents]);


    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];
        agents.forEach(agent => {
            if (agent.isNew) {
                const timer = setTimeout(() => {
                    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, isNew: false } : a));
                }, 3000);
                timers.push(timer);
            }
        });
        return () => timers.forEach(clearTimeout);
    }, [agents]);

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
                        setCookie("isAnonymous", "false", { path: "/" });
                        onAuthChange(user); // Только для НЕ анонимных пользователей
                        window.history.replaceState({}, document.title, window.location.pathname);
                    } else setError("Не удалось обработать ответ сервера");
                } catch (err: any) {
                    const { message } = extractErrorMessage(err);
                    setError(message);
                }
            }
        };

        const storedToken = cookies["authToken"];
        const isAnonymous = cookies["isAnonymous"] === "true";

        if (storedToken && isAnonymous) {
            validateToken(storedToken)
                .then((validUser) => {
                    if (validUser) {
                        setUser(validUser);
                        // Если это НЕ анонимный пользователь, вызываем onAuthChange
                        if (!isAnonymous) {
                            onAuthChange(validUser);
                        }
                    } else {
                        removeCookie("authToken");
                        removeCookie("isAnonymous");
                    }
                })
                .catch(() => {
                    removeCookie("authToken");
                    removeCookie("isAnonymous");
                })
                .finally(() => setIsLoading(false));
        } else {
            handleOAuthCallback().finally(() => setIsLoading(false));
        }

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

    const startAgentsPolling = (userId: string) => {
        if (agentsPollingInterval) clearInterval(agentsPollingInterval);

        // Функция для одного запроса
        const fetchAgents = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/agents-anonymous`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${cookies["authToken"]}`, // добавь токен, если нужно
                    },
                    body: JSON.stringify({ user_id: userId }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.agents)) {
                        const serverAgents: Agent[] = data.agents.map((a: any) => ({
                            id: a.id,
                            name: a.name,
                            desc: a.instructions || a.name || "No description",
                            agentId: a.agent_id,
                            aliasId: a.alias_id,
                            key: a.key,
                            isNew: false,
                        }));

                        setAgents(prev => {
                            const existingIds = new Set(prev.map(a => String(a.id)));
                            const newAgents = serverAgents.filter(a => !existingIds.has(String(a.id)));

                            if (newAgents.length > 0) {
                                console.log("New agents detected:", newAgents.map(a => a.name));
                                newAgents.forEach(a => (a.isNew = true));
                            }

                            return [MAIN_PUBLIC_AGENT, ...serverAgents];
                        });
                    }
                }
            } catch (err) {
                console.error("Agents polling error:", err);
            }
        };

        fetchAgents();

        const interval = setInterval(fetchAgents, 15000);

        setAgentsPollingInterval(interval);
    };

    useEffect(() => {
        return () => {
            if (agentsPollingInterval) clearInterval(agentsPollingInterval);
        };
    }, [agentsPollingInterval]);

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

    const handleSignInAnonymous = async () => {
        setError(null);
        setResendSuccess(null);
        setLastErrorRaw(null);
        setEmailConfirmationRequired(false);

        try {
            const existingToken = cookies["authToken"];
            const existingRefreshToken = cookies["refreshToken"];

            const headers: any = {};

            if (existingToken) {
                headers["Authorization"] = `Bearer ${existingToken}`;
            }

            const storedUserId = cookies["userId"];

            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/signin-anonymous`,
                { user_id: storedUserId, refreshToken: existingRefreshToken },
                { headers }
            );


            const data = response.data;

            if (!data) {
                setError("Incorrect server response");
                return;
            }

            const access_token = data.access_token;

            const refresh_token = data.refresh_token;

            const user = data.auth?.user || {
                id: data.user_id,
                is_anonymous: true,
                email: "",
                phone: ""
            };

            if (!access_token || !user) {
                setLastErrorRaw(data);
                setError("Incorrect server response: missing token or user");
                return;
            }

            // сохраняем токен
            setCookie("authToken", access_token, { path: "/" });
            setCookie("userId", user.id, { path: "/" });
            setCookie("isAnonymous", "true", { path: "/" });
            setCookie("refreshToken", refresh_token, { path: "/" });

            setUser(user);

            // преобразуем агентов с сервера
            const serverAgents: Agent[] = (data.agents || []).map((a: any) => ({
                id: a.id,
                name: a.name,
                desc: a.instructions,
                agentId: a.agent_id,
                aliasId: a.alias_id,
                key: a.key,
            }));
            setAgents([MAIN_PUBLIC_AGENT, ...serverAgents]);
            console.log("Anonymous login successful:", user.id);
        } catch (err: any) {
            console.error("Anonymous login error:", err);
            const { message, raw } = extractErrorMessage(err);
            setError(message);
            setLastErrorRaw(raw);
        }
    };


    useEffect(() => {
            handleSignInAnonymous();
    }, []);


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
    // CHAT & AGENTS UI + per-agent messages
    // -----------------------

    // messagesByAgent сохраняет переписку для каждого агента


    const [mobileChatOpen, setMobileChatOpen] = useState(false);
    const [mobileAgentListOpen, setMobileAgentListOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
    const [viewportHeight, setViewportHeight] = useState<number>(window.innerHeight);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 900);

    const [publicHiSent, setPublicHiSent] = useState(false);

    useEffect(() => {
        const onResize = () => {
            setViewportHeight(window.innerHeight);
            setIsMobile(window.innerWidth < 900);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // helper: get messages for current agent
    const getCurrentMessages = (): Msg[] => {
        const id = String(selectedAgent?.id ?? "");
        return messagesByAgent[id] ?? [];
    };

    const messageListRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (messageListRef.current) messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, [messagesByAgent, mobileChatOpen, mobileAgentListOpen, selectedAgent]);

    const handleAgentClick = (a: Agent) => {
        setSelectedAgent(a);
        // ensure sessionId exists
        setSessions((prev) => {
            const id = String(a.id);
            if (!prev[id]) {
                return { ...prev, [id]: generateSessionId() };
            }
            return prev;
        });
        // Если выбран главный публичный агент — очищаем прикреплённый файл
        if (String(a.id) === String(MAIN_PUBLIC_AGENT.id)) {
            removeAttachedFile();
        }

        if (isMobile) {
            setMobileChatOpen(true);
            setMobileAgentListOpen(false);
        }
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files && e.target.files[0];
        if (!canAttach) {
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        if (f) {
            setAttachedFileName(f.name);
        } else setAttachedFileName(null);
    };
    const removeAttachedFile = () => {
        setAttachedFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // helper: read file input to base64 (or null)
    const readFileInputBase64 = async (): Promise<{ base64: string | null; fileName: string | null }> => {
        try {
            const input = fileInputRef.current;
            if (!input || !input.files || input.files.length === 0) return { base64: null, fileName: null };
            const file = input.files[0];
            return await new Promise((res, rej) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    const commaIdx = result.indexOf(",");
                    const base64 = commaIdx >= 0 ? result.slice(commaIdx + 1) : result;
                    res({ base64, fileName: file.name });
                };
                reader.onerror = (e) => rej(e);
                reader.readAsDataURL(file);
            });
        } catch {
            return { base64: null, fileName: null };
        }
    };

    // core send function — добавляет сообщение в текущий чат и (если у агента есть публичный endpoint) делает public-send
    const sendChatMessage = async (msgText?: string) => {
        const text = (msgText ?? "").trim();
        const current = selectedAgent;
        if (!current) return;
        if (!text && !attachedFileName) return;

        const agentIdForApi = current.agentId;
        const agentAliasID = current.aliasId;
        const sessionId = sessions[String(current.id)] ?? generateSessionId();
        const token = cookies["authToken"];

        // добавляем исходящее сообщение
        const outgoing: Msg = {
            id: `out-${Date.now()}`,
            direction: "outgoing",
            message: text,
            attachedFileName: attachedFileName || undefined,
            sentTime: new Date().toISOString(),
            sender: "user",
        };
        setMessagesByAgent((prev) => ({
            ...prev,
            [String(current.id)]: [...(prev[String(current.id)] ?? []), outgoing],
        }));

        // подготовка файла
        let fileBase64: string | null = null;
        let fileName: string | null = null;
        if (attachedFileName) {
            const read = await readFileInputBase64();
            fileBase64 = read.base64;
            fileName = read.fileName;
        }
        removeAttachedFile();

        try {
            const url = `${import.meta.env.VITE_API_GATEWAY_URL}/send-anonymous`;
            const payload = {
                message: text,
                agentId: agentIdForApi,
                aliasId: agentAliasID,
                sessionId,
                fileBase64,
                fileName,
            };

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const { sessionId: returnedSessionId } = await res.json();
            const finalSessionId = returnedSessionId || sessionId;
            setSessions((s) => ({ ...s, [String(current.id)]: finalSessionId }));

            // запускаем polling
            const startPolling = (finalSessionId: string) => {
                const poll = async () => {
                    try {
                        const pollUrl = `${import.meta.env.VITE_API_GATEWAY_URL}/polling-message`;
                        const pollRes = await fetch(pollUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ sessionId: finalSessionId }),
                        });

                        const data = await pollRes.json();
                        if (!data) return;

                        // 1) текстовый ответ
                        if (data?.response) {
                            const incoming: Msg = {
                                id: `in-${Date.now()}`,
                                direction: "incoming",
                                message: data.response,
                                sentTime: new Date().toISOString(),
                                sender: "bot",
                            };

                            setMessagesByAgent((prev) => ({
                                ...prev,
                                [String(current.id)]: [...(prev[String(current.id)] ?? []), incoming],
                            }));

                            if (String(current.id) === String(MAIN_PUBLIC_AGENT.id)) {
                                const user_id = cookies["userId"];
                                if (user_id) {
                                    console.log("Master agent responded — restarting agents polling for immediate update");
                                    startAgentsPolling(user_id);
                                }
                            }
                        }

                        // 2) файлы
                        if (data?.files) {
                            setSessionFiles(finalSessionId, data.files);
                        }

                        // 3) новый агент
                        const looksLikeNewAgent =
                            Boolean(data.agentId || data.aliasId || data.instructions) ||
                            (typeof data.response === "string" &&
                                /created your agent|created an agent|successfully created your agent/i.test(data.response));

                        if (looksLikeNewAgent) {
                            const newAgent = addAgentFromCreateResponse(data, { select: true });
                            if (newAgent && data.response) {
                                setMessagesByAgent((prev) => {
                                    const copy = { ...prev };
                                    const newId = String(newAgent.id);
                                    if (!copy[newId]) copy[newId] = [];
                                    copy[newId] = [
                                        ...copy[newId],
                                        {
                                            id: `in-${Date.now()}-agent`,
                                            direction: "incoming",
                                            message: data.response,
                                            sentTime: new Date().toISOString(),
                                            sender: "bot",
                                        },
                                    ];
                                    return copy;
                                });
                                setSelectedAgent(newAgent);
                            }
                        }

                        if (data?.response) {
                            clearInterval(pollInterval);
                        }
                    } catch (pollErr) {
                        console.error("Polling error:", pollErr);
                        clearInterval(pollInterval);
                    }
                };

                // первый вызов сразу
                poll();

                // потом каждые 3 секунды
                const pollInterval = setInterval(poll, 20000);
            };

            startPolling(finalSessionId);

        } catch (err: any) {
            const incoming: Msg = {
                id: `in-err-${Date.now()}`,
                direction: "incoming",
                message: `Public send error: ${err.message}`,
                sentTime: new Date().toISOString(),
                sender: "system",
            };
            setMessagesByAgent((prev) => ({
                ...prev,
                [String(current.id)]: [...(prev[String(current.id)] ?? []), incoming],
            }));
        }
    };

// ---------- helper: парсинг имени/описания агента из текстового ответа ----------
    function parseAgentNameAndDescFromResponseText(text?: string) {
        if (!text) return { name: null, desc: null };

        // Попытки извлечь имя:
        // 1) looking for named "xxx" or named 'xxx'
        const namedMatch = text.match(/named\s+["']([^"']+)["']/i);
        if (namedMatch) {
            const name = namedMatch[1].trim();
            // остальное после имени используем как описание (если есть)
            const desc = text.replace(namedMatch[0], "").trim();
            return { name, desc: desc || null };
        }

        // 2) try to find something like: created your agent named xxx! (no quotes)
        const namedNoQuotes = text.match(/named\s+([A-Za-z0-9_\-]+)/i);
        if (namedNoQuotes) {
            return { name: namedNoQuotes[1].trim(), desc: text };
        }

        // 3) as fallback — взять первую короткую фразу до точки как имя
        const firstPhrase = text.split(/[.!\n]/).find(s => s.trim().length > 0);
        if (firstPhrase && firstPhrase.length <= 40) {
            return { name: firstPhrase.trim(), desc: text };
        }

        return { name: null, desc: text };
    }

    const addAgentFromCreateResponse = (data: any, options?: { select?: boolean } ) => {
        try {
            // data может содержать: sessionId, agentId, aliasId, response, instructions, name, key и т.д.
            const parsed = parseAgentNameAndDescFromResponseText(data.response as string | undefined);

            // id: если сервер возвращает явный id — используем его, иначе sessionId, иначе agentId, иначе генерируем
            const candidateId = data.id ?? data.agentId ?? data.sessionId ?? generateSessionId();
            const id = String(candidateId);

            // имя: предпочитаем явно пришедшее поле name, потом распарсенное, потом aliasId/agentId fallback
            const name = (data.name && String(data.name).trim()) ||
                parsed.name ||
                (data.aliasId ? `agent-${String(data.aliasId).slice(0, 6)}` : `agent-${String(id).slice(0, 6)}`);

            // описание: инструкции, либо распарсенное описание, либо ответ сервера
            const desc = (data.instructions && String(data.instructions).trim()) ||
                parsed.desc ||
                (data.response ? String(data.response).trim() : "No description");

            const newAgent: Agent = {
                id,
                name,
                desc,
                agentId: data.agentId ?? undefined,
                aliasId: data.aliasId ?? undefined,
                key: data.key ?? undefined,
            };

            // Добавляем агента в список (сохраняя MAIN_PUBLIC_AGENT на месте, если он есть)
            setAgents((prev) => {
                // если агент уже есть (по agentId или id) — обновим его
                const existsIdx = prev.findIndex(
                    (a) => String(a.id) === String(newAgent.id) || (newAgent.agentId && a.agentId === newAgent.agentId)
                );
                if (existsIdx >= 0) {
                    const copy = [...prev];
                    copy[existsIdx] = { ...copy[existsIdx], ...newAgent };
                    return copy;
                }
                // вставляем в конец списка (после публичного агента)
                return [...prev, newAgent];
            });

            // гарантируем, что есть запись messagesByAgent[id] и сессия
            setMessagesByAgent((prev) => {
                const copy = { ...prev };
                if (!copy[id]) copy[id] = [];
                return copy;
            });

            setSessions((prev) => {
                const copy = { ...prev };
                if (!copy[id]) copy[id] = data.sessionId ?? generateSessionId();
                return copy;
            });

            // по опции — сделать нового агента выбранным
            if (options?.select) {
                setSelectedAgent(newAgent);
            }

            return newAgent;
        } catch (err) {
            console.error("addAgentFromCreateResponse error:", err);
            return null;
        }
    };


    // -----------------------
    // PUBLIC SEND (авто Hi при загрузке если нет токена)
    // -----------------------
    const sendPublicHi = async () => {
        if (publicHiSent) return;
        const main = MAIN_PUBLIC_AGENT;
        const token = cookies["authToken"];
        if (!main || !main.agentId || !main.key) {
            console.warn("Main public agent credentials missing — skipping public-send Hi.");
            return;
        }

        // добавим исходящее Hi в чат мастера
        setMessagesByAgent((prev) => {
            const id = String(main.id);
            const prevMsgs = prev[id] ?? [];
            return {
                ...prev,
                [id]: [
                    ...prevMsgs,
                    {
                        id: `out-hi-${Date.now()}`,
                        direction: "outgoing",
                        message: "Hi",
                        sentTime: new Date().toISOString(),
                        sender: "user",
                    },
                ],
            };
        });

        try {
            const url = `${import.meta.env.VITE_API_GATEWAY_URL}/send-anonymous`;
            const payload = {
                message: "Hi",
                agentId: main.agentId,
                aliasId: main.aliasId,
                key: main.key,
                sessionId: sessions[String(main.id)] ?? generateSessionId(),
                fileBase64: null,
                fileName: null,
            };

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const { sessionId: returnedSessionId } = await res.json();
            const finalSessionId = returnedSessionId || payload.sessionId;
            setSessions((s) => ({ ...s, [String(main.id)]: finalSessionId }));

            // запускаем polling
            // запускаем polling сразу и потом через интервал
            const startPolling = (finalSessionId: string) => {
                const poll = async () => {
                    const pollUrl = `${import.meta.env.VITE_API_GATEWAY_URL}/polling-message`;
                    const pollRes = await fetch(pollUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ sessionId: finalSessionId }),
                    });

                    const data = await pollRes.json();
                    if (data?.response) {
                        clearInterval(pollInterval);
                        const incoming: Msg = {
                            id: `in-hi-${Date.now()}`,
                            direction: "incoming",
                            message: data.response,
                            sentTime: new Date().toISOString(),
                            sender: "bot",
                        };
                        setMessagesByAgent((prev) => {
                            const id = String(main.id);
                            const prevMsgs = prev[id] ?? [];
                            return { ...prev, [id]: [...prevMsgs, incoming] };
                        });

                        // если есть файлы — обновим sessionFiles
                        if (data.files) {
                            setSessionFiles(finalSessionId, data.files);
                        }
                    }
                };

                // первый вызов сразу
                poll();

                // потом каждые 3 секунды
                const pollInterval = setInterval(poll, 20000);
            };

// где-то в коде после получения finalSessionId
            startPolling(finalSessionId);


            setPublicHiSent(true);
        } catch (err: any) {
            const incoming: Msg = {
                id: `in-hi-err-${Date.now()}`,
                direction: "incoming",
                message: `Public send error: ${err.message}`,
                sentTime: new Date().toISOString(),
                sender: "system",
            };
            setMessagesByAgent((prev) => {
                const id = String(main.id);
                const prevMsgs = prev[id] ?? [];
                return { ...prev, [id]: [...prevMsgs, incoming] };
            });
            setPublicHiSent(true);
        }
    };


    useEffect(() => {
        const isAnonymous = cookies["isAnonymous"] === "true";
        if (!isLoading && !isAnonymous && !publicHiSent) {
            sendPublicHi();
        }
    }, [isLoading, cookies, publicHiSent]);





    function generateSessionId() {
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    }

    if (isLoading) return <></>;

    // -----------------------
    // RENDER (UI unchanged apart from using currentMessages)
    // -----------------------
    const currentMessages = getCurrentMessages();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ height: "83vh", overflow: "hidden" }}>
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
                                zIndex: CHAT_Z,
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
                                                key={String(a.id)}
                                                onClick={() => handleAgentClick(a)}
                                                sx={{
                                                    cursor: "pointer",
                                                    p: 2,
                                                    mb: 1.25,
                                                    borderRadius: 2,
                                                    border: "1px solid",
                                                    borderColor: active ? "primary.main" : "divider",
                                                    bgcolor: active ? "rgba(25,118,210,0.03)" : "transparent",
                                                    animation: a.isNew ? "highlight 3s ease-out forwards" : "none",
                                                    "@keyframes highlight": {
                                                        "0%": { backgroundColor: "rgba(255, 235, 59, 0.4)" },
                                                        "100%": { backgroundColor: "transparent" },
                                                    },
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
                                    {currentMessages.map((m) => (
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
                                    <Paper component="form" onSubmit={async (e) => { e.preventDefault(); const input = (e.target as HTMLFormElement).elements.namedItem("msg") as HTMLInputElement; await sendChatMessage(input?.value); if (input) input.value = ""; }} sx={{ display: "flex", alignItems: "center", gap: 1, p: "6px 10px", borderRadius: "22px" }}>
                                        <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx,.csv,.xls,.xlsx" onChange={handleFileSelected} style={{ display: "none" }} />
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                if (canAttach) fileInputRef.current?.click();
                                                else setError("File attachments are disabled for this agent.");
                                            }}
                                            disabled={!canAttach}
                                            title={canAttach ? "Attach file" : "Attachments disabled for this agent"}
                                        >
                                            <AttachFileIcon fontSize="small" />
                                        </IconButton>                                        <InputBase name="msg" sx={{ ml: 1, flex: 1 }} placeholder="Write a message or attach a file..." />
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

                {/* MOBILE UI (логика идентична — используем getCurrentMessages & sendChatMessage) */}
                {isMobile && (
                    <>
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
                                zIndex: AUTH_Z,
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
                                            {currentMessages.length ? (currentMessages[currentMessages.length - 1].message ?? currentMessages[currentMessages.length - 1].attachedFileName ?? "") : ""}
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
                                    <IconButton onClick={() => setMobileChatOpen(false)} aria-label="Close chat"><KeyboardArrowDownIcon /></IconButton>
                                </Box>
                                <Box ref={messageListRef} sx={{ flex: 1, p: 2, overflowY: "auto" }}>
                                    {currentMessages.map((m) => (
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
                                    <Paper component="form" onSubmit={async (e) => { e.preventDefault(); const el = (e.target as HTMLFormElement).elements.namedItem("msgMobile") as HTMLInputElement; await sendChatMessage(el?.value); if (el) el.value = ""; }} sx={{ display: "flex", alignItems: "center", gap: 1, p: "6px 10px", borderRadius: "20px" }}>
                                        <IconButton size="small" onClick={() => fileInputRef.current?.click()}><AttachFileIcon fontSize="small" /></IconButton>
                                        <InputBase name="msgMobile" sx={{ ml: 1, flex: 1 }} placeholder="Write a message or attach a file..." />
                                        <Divider sx={{ height: 28, mr: 1 }} orientation="vertical" />
                                        <IconButton type="submit" sx={{ p: "10px" }}><SendIcon /></IconButton>
                                    </Paper>
                                </Box>
                            </Paper>
                        )}

                        {mobileAgentListOpen && (
                            <>
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
                                                        key={String(a.id)}
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
