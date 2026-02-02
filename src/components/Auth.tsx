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
import { useTranslation } from "react-i18next";
import { i18n } from "../utils/i18n";
import {ChatMessage} from "./ChatMessage.tsx";
import TypingIndicator from "./TypingIndicator.tsx";

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
    const { t } = useTranslation();

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
    const [isSendingByAgent, setIsSendingByAgent] = useState<Record<string, boolean>>({});
    const [isTypingByAgent, setIsTypingByAgent] = useState<Record<string, boolean>>({});

    const MAIN_PUBLIC_AGENT = {
        id: "youagent-master",
        name: i18n.t("auth.namePublicAgent"),
        desc: i18n.t("auth.descPublicAgent"),
        agentId: "3QQS2QJUKY",
        aliasId: "IRWADY4L5O",
        key: "TfnWzfQl-6jDKq7gSvFP",
    } as Agent;

    const [agents, setAgents] = useState<Agent[]>([MAIN_PUBLIC_AGENT]);
    const [messagesByAgent, setMessagesByAgent] = useState<Record<string, Msg[]>>({});
    const [sessions, setSessions] = useState<Record<string, string>>({});
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(MAIN_PUBLIC_AGENT);
    const canAttach = Boolean(selectedAgent && String(selectedAgent.id) !== String(MAIN_PUBLIC_AGENT.id));
    const [agentsPollingInterval, setAgentsPollingInterval] = useState<NodeJS.Timeout | null>(null);
    const hiSentRef = useRef(false);

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
            const msg = (serverData && (serverData.message || serverData.error)) || err?.message || t('auth.msgUnexpectedError');
            return { message: String(msg), raw: serverData ?? rawResponse };
        } catch (ex) {
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
            const response = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/auth/signup`, { email, password, firstName, lastName });
            const outerData = response.data;
            const parsedBody = typeof outerData?.body === "string" ? JSON.parse(outerData.body) : outerData.body ?? outerData;
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
                if (token) setCookie("authToken", token, { path: "/" });
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
            } else setError(message);
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
            const response = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/signin`, { email, password });
            const outerData = response.data;
            const data = typeof outerData?.body === "string" ? JSON.parse(outerData.body) : outerData.body ?? outerData;
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
                setCookie("authToken", token, { path: "/" });
                onAuthChange(user);
            } else {
                setError(t("auth.msgErrIncorrectServerResponse"));
                setLastErrorRaw(data);
            }
        } catch (err: any) {
            const { message, raw } = extractErrorMessage(err);
            if (rawIndicatesEmailNotConfirmed(raw, message)) {
                setEmailConfirmationRequired(true);
                setError(t("auth.msgErrNotConfirmedCheckEmail"));
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
            const welcomeMessage: Msg = {
                id: `in-welcome-${Date.now()}`,
                direction: "incoming",
                message: t("auth.welcomeMsg"),
                sentTime: new Date().toISOString(),
                sender: "bot",
            };


            setMessagesByAgent((prev) => ({
                ...prev,
                [String(MAIN_PUBLIC_AGENT.id)]: [welcomeMessage],
            }));
        } catch (err: any) {
            console.error("Anonymous login error:", err);
            const { message, raw } = extractErrorMessage(err);
            setError(message);
            setLastErrorRaw(raw);
        }
        finally {

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
            setError(t("auth.msgErrEnterEmailResendLink"));
            return;
        }
        startCooldown(60);
        try {
            await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/resend-verification`, { email });
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
    const sendChatMessage = async (msgText?: string, accessToken?: string) => {
        const text = (msgText ?? "").trim();
        const current = selectedAgent;
        if (!current) return;

        const agentKey = String(current.id);

        // Проверяем, не идёт ли уже отправка для этого агента
        if (isSendingByAgent[agentKey]) return;

        if (!text && !attachedFileName) return;

        // Блокируем отправку сразу
        setIsSendingByAgent(prev => ({ ...prev, [agentKey]: true }));

        const agentIdForApi = current.agentId;
        const agentAliasID = current.aliasId;
        const sessionId = sessions[agentKey] ?? generateSessionId();
        const token = accessToken ?? cookies["authToken"];

        // Добавляем исходящее сообщение пользователя
        const outgoing: Msg = {
            id: `out-${Date.now()}`,
            direction: "outgoing",
            message: text || undefined,
            attachedFileName: attachedFileName || undefined,
            sentTime: new Date().toISOString(),
            sender: "user",
        };

        setMessagesByAgent((prev) => ({
            ...prev,
            [agentKey]: [...(prev[agentKey] ?? []), outgoing],
        }));

        // Показываем индикатор "печатает..."
        setIsTypingByAgent((prev) => ({ ...prev, [agentKey]: true }));

        // Очищаем прикреплённый файл и поле ввода (поле очищается через форму)
        removeAttachedFile();

        // Читаем файл (если был)
        let fileBase64: string | null = null;
        let fileName: string | null = null;
        if (attachedFileName) {
            const read = await readFileInputBase64();
            fileBase64 = read.base64;
            fileName = read.fileName;
        }

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
            setSessions((s) => ({ ...s, [agentKey]: finalSessionId }));

            // Запуск polling (как было)
            const startPolling = (finalSessionId: string) => {
                let attempts = 0;
                let pollInterval: ReturnType<typeof setInterval> | null = null;

                const poll = async () => {
                    attempts++;
                    try {
                        const pollUrl = `${import.meta.env.VITE_API_GATEWAY_URL}/polling-message`;
                        const pollRes = await fetch(pollUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ sessionId: finalSessionId }),
                        });
                        const data = await pollRes.json();

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
                                [agentKey]: [...(prev[agentKey] ?? []), incoming],
                            }));

                            if (String(current.id) === String(MAIN_PUBLIC_AGENT.id)) {
                                const user_id = cookies["userId"];
                                if (user_id) startAgentsPolling(user_id);
                            }

                            // Ответ получен — снимаем все блокировки
                            setIsTypingByAgent((prev) => ({ ...prev, [agentKey]: false }));
                            setIsSendingByAgent((prev) => ({ ...prev, [agentKey]: false }));
                            if (pollInterval) clearInterval(pollInterval);
                            return;
                        }

                        if (data?.files) {
                            setSessionFiles(finalSessionId, data.files);
                        }
                    } catch (pollErr) {
                        console.error("Polling error:", pollErr);
                    }

                    if (attempts >= 150) {
                        clearInterval(pollInterval!);
                        setIsTypingByAgent((prev) => ({ ...prev, [agentKey]: false }));
                        setIsSendingByAgent((prev) => ({ ...prev, [agentKey]: false }));
                    }
                };

                poll();
                pollInterval = setInterval(poll, 2000);
            };

            startPolling(finalSessionId);

        } catch (err: any) {
            // Ошибка отправки
            const incoming: Msg = {
                id: `in-err-${Date.now()}`,
                direction: "incoming",
                message: `Send error: ${err.message || "Network error"}`,
                sentTime: new Date().toISOString(),
                sender: "system",
            };
            setMessagesByAgent((prev) => ({
                ...prev,
                [agentKey]: [...(prev[agentKey] ?? []), incoming],
            }));

            // Снимаем блокировку даже при ошибке
            setIsTypingByAgent((prev) => ({ ...prev, [agentKey]: false }));
            setIsSendingByAgent((prev) => ({ ...prev, [agentKey]: false }));
        }
    };


    useEffect(() => {

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
                                    { t('auth.agentsTypography') }
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
                                    <Typography variant="subtitle1">{selectedAgent ? selectedAgent.name : t('auth.agents.selectAgent')}</Typography>
                                </Box>
                                <Box ref={messageListRef} sx={{ flex: 1, p: 3, overflowY: "auto", background: "#fff" }}>
                                    {currentMessages.map((m) => (
                                        <Box key={m.id} sx={{ display: "flex", justifyContent: m.direction === "outgoing" ? "flex-end" : "flex-start", mb: 1 }}>
                                            <Paper sx={{ p: 1, px: 2, borderRadius: 2, maxWidth: "70%", bgcolor: m.direction === "outgoing" ? "#eaf3ff" : "#f5f7fa" }}>
                                                {m.message && <ChatMessage text={m.message} />}
                                                {m.attachedFileName && (
                                                    <Box sx={{ mt: 1, display: "inline-flex", alignItems: "center", gap: 1 }}>
                                                        <DescriptionIcon sx={{ color: "#1976d2" }} />
                                                        <Typography sx={{ fontWeight: 600 }}>{m.attachedFileName}</Typography>
                                                    </Box>
                                                )}
                                            </Paper>
                                        </Box>
                                    ))}
                                    {isTypingByAgent[String(selectedAgent?.id ?? "")] && (
                                        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
                                            <TypingIndicator />
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "#fff" }}>
                                    {attachedFileName && (
                                        <Box sx={{ mb: 1, p: 1, backgroundColor: "#f5f5f5", borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <DescriptionIcon color="primary" />
                                                <Box>
                                                    <Typography fontSize="0.9rem" fontWeight="medium" noWrap>{attachedFileName}</Typography>
                                                    <Typography fontSize="0.75rem" color="text.secondary">{ t('readySend') }</Typography>
                                                </Box>
                                            </Box>
                                            <IconButton size="small" onClick={removeAttachedFile}><CloseIcon fontSize="small" /></IconButton>
                                        </Box>
                                    )}
                                    <Paper component="form" onSubmit={async (e) => { e.preventDefault(); const input = (e.target as HTMLFormElement).elements.namedItem("msg") as HTMLInputElement; sendChatMessage(input?.value); if (input) input.value = ""; }} sx={{ display: "flex", alignItems: "center", gap: 1, p: "6px 10px", borderRadius: "22px" }}>
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
                                        </IconButton>
                                        <InputBase
                                            name="msg"
                                            sx={{ ml: 1, flex: 1 }}
                                            placeholder={ t('pHolderWriteMsg')}
                                            disabled={isSendingByAgent[String(selectedAgent?.id ?? "")]}
                                        />
                                        <Divider sx={{ height: 28, mr: 1 }} orientation="vertical" />
                                        <IconButton
                                            type="submit"
                                            sx={{ p: "10px" }}
                                            disabled={isSendingByAgent[String(selectedAgent?.id ?? "")]}
                                        >
                                            <SendIcon />
                                        </IconButton>
                                    </Paper>
                                </Box>
                            </Box>
                        </Box>

                        {/* RIGHT: fixed auth panel (всегда поверх) */}
                        <Box sx={{ position: "fixed", right: 24, top: "50%", transform: "translateY(-50%)", width: `${AUTH_PANEL_WIDTH}px`, zIndex: AUTH_Z }}>
                            <Box sx={{ width: "100%" }}>
                                <img src="/youagent_me_logo.jpg" alt="youagent.me" loading="lazy" style={{ width: "100%", borderRadius: 10, marginBottom: 12 }} />
                                <Container component="main" sx={{ boxShadow: "0px 6px 22px rgba(0,0,0,0.08)", p: 2, borderRadius: 2, background: "#fff" }}>
                                    <Typography component="h1" variant="h5" sx={{ textAlign: "center", mb: 2 }}>{authMode === "signin" ? t('auth.signIn') : t('auth.signUp')}</Typography>
                                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                                    {resendSuccess && <Alert severity="success" sx={{ mb: 2 }}>{resendSuccess}</Alert>}
                                    {emailConfirmationRequired && (
                                        <Box sx={{ mb: 2, textAlign: "center" }}>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                { t('auth.didntReceiveEmail') }
                                                {cooldownSeconds > 0 ? <Typography component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>{ t('auth.resendVerificationSeconds', { cooldownSeconds }) }</Typography> :
                                                    <Link href="#" onClick={(e) => { e.preventDefault(); handleResendVerificationEmail(); }} sx={{ textDecoration: "underline", color: "primary.main" }}>{ t('auth.resendVerification') }</Link>}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Box component="form" onSubmit={handleSubmit} noValidate>
                                        {authMode === "signup" && <>
                                            <TextField margin="normal" required fullWidth label={ t('auth.labelFirstName') } value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                            <TextField margin="normal" required fullWidth label={ t('auth.labelLastName') } value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                        </>}
                                        <TextField margin="normal" required fullWidth label={ t('auth.labelEmail') } value={email} onChange={(e) => setEmail(e.target.value)} autoFocus={authMode === "signin"} />
                                        <TextField margin="normal" required fullWidth label={ t('password') } type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        {authMode === "signin" && <FormControlLabel control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />} label={ t('auth.labelRememberMe') } />}
                                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>{authMode === "signin" ? t('auth.signIn') : t('auth.signUp')}</Button>
                                        {
                                            i18n.language === 'en' && (
                                                <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={async () => {
                                                    try {
                                                        const res = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/auth-google`, {}, { headers: { "Content-Type": "application/json" } });
                                                        const { url } = res.data;
                                                        if (url) window.location.href = url;
                                                        else setError(t('auth.failedGoogleSignIn'));
                                                    } catch (err: any) {
                                                        setError(t('auth.googleSignInFailed'));
                                                    }
                                                }}>{ t('auth.signInWithGoogle') }</Button>
                                            )
                                        }
                                        <Box sx={{ mt: 2, textAlign: "center" }}>
                                            <Link href="#" variant="body2" onClick={(e) => { e.preventDefault(); setAuthMode(authMode === "signin" ? "signup" : "signin"); setError(null); setEmailConfirmationRequired(false); setResendSuccess(null); setLastErrorRaw(null); }}>
                                                {authMode === "signin" ? t('auth.notHaveAccount') : t('auth.haveAccount')}
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
                                    <Typography component="h1" variant="h5" sx={{ textAlign: "center", mb: 2 }}>{authMode === "signin" ? t('auth.signIn') : t('auth.signUp')}</Typography>
                                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                                    {resendSuccess && <Alert severity="success" sx={{ mb: 2 }}>{resendSuccess}</Alert>}
                                    {emailConfirmationRequired && (
                                        <Box sx={{ mb: 2, textAlign: "center" }}>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                { t('auth.didntReceiveEmail') }
                                                {cooldownSeconds > 0 ? <Typography component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>{ t('auth.resendVerificationSeconds', { cooldownSeconds }) }</Typography> :
                                                    <Link href="#" onClick={(e) => { e.preventDefault(); handleResendVerificationEmail(); }} sx={{ textDecoration: "underline", color: "primary.main" }}>{ t('auth.resendVerification') }</Link>}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Box component="form" onSubmit={handleSubmit} noValidate>
                                        {authMode === "signup" && <>
                                            <TextField margin="normal" required fullWidth label={ t('auth.labelFirstName') } value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                            <TextField margin="normal" required fullWidth label={ t('auth.labelLastName') } value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                        </>}

                                        <TextField margin="normal" required fullWidth label={ t('auth.labelEmail') } value={email} onChange={(e) => setEmail(e.target.value)} autoFocus={authMode === "signin"} />
                                        <TextField margin="normal" required fullWidth label={ t('password') } type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        {authMode === "signin" && <FormControlLabel control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />} label={ t('auth.labelRememberMe') } />}
                                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>{authMode === "signin" ? t('auth.signIn') : t('auth.signUp')}</Button>
                                        {
                                            i18n.language === 'en' && (
                                                <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={async () => {
                                                    try {
                                                        const res = await axios.post(`${import.meta.env.VITE_API_GATEWAY_URL}/auth-google`, {}, { headers: { "Content-Type": "application/json" } });
                                                        const { url } = res.data;
                                                        if (url) window.location.href = url;
                                                        else setError(t('auth.failedGoogleSignIn'));
                                                    } catch (err: any) {
                                                        setError(t('auth.googleSignInFailed'));
                                                    }
                                                }}>{ t('auth.signInWithGoogle') }</Button>
                                            )
                                        }
                                        <Box sx={{ mt: 2, textAlign: "center" }}>
                                            <Link href="#" variant="body2" onClick={(e) => { e.preventDefault(); setAuthMode(authMode === "signin" ? "signup" : "signin"); setError(null); setEmailConfirmationRequired(false); setResendSuccess(null); setLastErrorRaw(null); }}>
                                                {authMode === "signin" ? t('auth.notHaveAccount') : t('auth.haveAccount')}
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
                                    aria-label={ t('auth.chat.aLabelOpenChat') }
                                >
                                    <KeyboardArrowUpIcon />
                                </IconButton>
                            </Paper>
                        )}

                        {mobileChatOpen && selectedAgent && (
                            <Paper
                                role="dialog"
                                aria-label={t('auth.chat.ariaLabel', { agentName: selectedAgent.name })}
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
                                    <IconButton onClick={() => setMobileAgentListOpen(true)} aria-label={t('auth.chat.openAgents')}><MenuIcon /></IconButton>
                                    <Typography variant="h6" sx={{ flex: 1, textAlign: "center" }}>{selectedAgent.name}</Typography>
                                    <IconButton onClick={() => setMobileChatOpen(false)} aria-label={t('auth.chat.closeChat')}><KeyboardArrowDownIcon /></IconButton>
                                </Box>
                                <Box ref={messageListRef} sx={{ flex: 1, p: 2, overflowY: "auto" }}>
                                    {currentMessages.map((m) => (
                                        <Box key={m.id} sx={{ display: "flex", justifyContent: m.direction === "outgoing" ? "flex-end" : "flex-start", mb: 1 }}>
                                            <Paper sx={{ p: 1, px: 2, borderRadius: 2, maxWidth: "80%", bgcolor: m.direction === "outgoing" ? "#eaf3ff" : "#f5f7fa" }}>
                                                {m.message && <ChatMessage text={m.message} />}
                                                {m.attachedFileName && (
                                                    <Box sx={{ mt: 1, display: "inline-flex", alignItems: "center", gap: 1 }}>
                                                        <DescriptionIcon sx={{ color: "#1976d2" }} />
                                                        <Typography sx={{ fontWeight: 600 }}>{m.attachedFileName}</Typography>
                                                    </Box>
                                                )}
                                            </Paper>
                                        </Box>
                                    ))}
                                    {isTypingByAgent[String(selectedAgent?.id ?? "")] && (
                                        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
                                            <TypingIndicator />
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                                    {attachedFileName && (
                                        <Box sx={{ mb: 1, p: 1, backgroundColor: "#f5f5f5", borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <DescriptionIcon color="primary" />
                                                <Box>
                                                    <Typography fontSize="0.9rem" fontWeight="medium" noWrap>{attachedFileName}</Typography>
                                                    <Typography fontSize="0.75rem" color="text.secondary">{ t('readySend') }</Typography>
                                                </Box>
                                            </Box>
                                            <IconButton size="small" onClick={removeAttachedFile}><CloseIcon fontSize="small" /></IconButton>
                                        </Box>
                                    )}
                                    <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx,.csv,.xls,.xlsx" onChange={handleFileSelected} style={{ display: "none" }} />
                                    <Paper component="form" onSubmit={async (e) => { e.preventDefault(); const el = (e.target as HTMLFormElement).elements.namedItem("msgMobile") as HTMLInputElement; sendChatMessage(el?.value); if (el) el.value = ""; }} sx={{ display: "flex", alignItems: "center", gap: 1, p: "6px 10px", borderRadius: "20px" }}>
                                        <IconButton size="small" onClick={() => fileInputRef.current?.click()}><AttachFileIcon fontSize="small" /></IconButton>
                                        <InputBase
                                            name="msgMobile"
                                            sx={{ ml: 1, flex: 1 }}
                                            placeholder={ t('pHolderWriteMsg') }
                                            disabled={isSendingByAgent[String(selectedAgent?.id ?? "")]}
                                        />
                                        <Divider sx={{ height: 28, mr: 1 }} orientation="vertical" />
                                        <IconButton
                                            type="submit"
                                            sx={{ p: "10px" }}
                                            disabled={isSendingByAgent[String(selectedAgent?.id ?? "")]}
                                        >
                                            <SendIcon />
                                        </IconButton>
                                    </Paper>
                                </Box>
                            </Paper>
                        )}

                        {mobileAgentListOpen && (
                            <>
                                <Box sx={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: AGENTS_BG_Z }} onClick={() => setMobileAgentListOpen(false)} />
                                <Paper sx={{ position: "fixed", left: 0, top: 0, height: `${viewportHeight}px`, width: "82%", zIndex: AGENTS_Z, display: "flex", flexDirection: "column" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                                        <Typography variant="h6">{ t('auth.agents.temporaryAgents') }</Typography>
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
