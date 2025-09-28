import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CookiesProvider } from 'react-cookie';
import { type StepType, TourProvider } from '@reactour/tour';

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
        secondary: { main: '#f50057' },
    },
});

const cookieOptions = {
    maxAge: 60 * 60 * 24 * 7,
    secure: true,
};

const waitForElement = (selector: string, timeout = 10000): Promise<HTMLElement | null> => {
    return new Promise((resolve) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el as HTMLElement);

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                resolve(el as HTMLElement);
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
};

const steps: StepType[] = [
    {
        selector: '[data-tour="welcome"]',
        content: (): React.ReactNode => (
            <div>
                <strong>Welcome to YouAgent.me Agentic AI service.</strong>
                <div>This tour will guide you through the agent creation process. Click next to continue.</div>
            </div>
        ),
        position: 'center' as const,
    },
    {
        selector: '[data-tour="new-agent-button"]',
        content: 'Press “New Agent” button in order to start the new agent creation.',
        stepInteraction: true,
    },
    {
        selector: '[data-tour="blueprint-select"]',
        content: 'Choose the blueprint to run the agent examples or proceed from scratch by going straight to the next step. ',
        stepInteraction: true,
    },
    {
        selector: "[data-tour='blueprint-menu-list']",
        content: 'This is a drop-down list of templates. Select one of them or select "custom agent" to create an agent from scratch.',
        observed: true,
        position: 'bottom' as const,
        stepInteraction: true,
    },
    {
        selector: '[data-tour="name-input"]',
        content: 'Insert your agent name. Use Letters and Digits only, avoid special symbols.',
    },
    {
        selector: '[data-tour="instructions-input"]',
        content: 'Write the instructions to your agents how it must communicate with your users. Describe his duties in the same way as you would describe them to human.',
    },
    {
        selector: '[data-tour="actions-checkboxes"]',
        content: 'If your agent needs to send emails or make HTTP requests, set the corresponding checkbox to True. If no - go to the next step. ',
    },
    {
        selector: '[data-tour="kb-section"]',
        content: ' If your agent is to consult the user over the information from the document or table - please upload this document in the Knowledge base section. If no - go to the next step. ',
    },
    {
        selector: '[data-tour="add-agent-button"]',
        content: 'Click Add to complete your Agent creation.',
        stepInteraction: true,
    },
    {
        selector: '[data-tour="agent-card"]',
        content: 'Congratulations! Your first Agent is ready. Click Next to learn what you can do with it.',
        observed: true,
    },
    {
        selector: '[data-tour="open-chat-button"]',
        content: 'Click “Chat” button to instantly start chatting with your agent.',
        stepInteraction: true,
        position: 'bottom' as const,
        action: async () => {
            const button = await waitForElement('[data-tour="open-chat-button"]');
            if (button) {
                button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                console.log('Chat button found:', button);
            } else {
                console.log('Chat button not found within timeout');
            }
        },
    },
    {
        selector: '[data-tour="chat-dialog"]',
        content: 'Write your first message to the agent and Click “Send button”.',
    },
    {
        selector: '[data-tour="chat-close"]',
        content: 'Chat as long as you like. Then press “Close” button to close the chat dialog.',
    },
    {
        selector: '[data-tour="deploy-button"]',
        content: 'To make your agent publicly available press the Deploy button.',
    },
    {
        selector: '[data-tour="public-link"]',
        content: 'Share the public link with your users. They can now also chat with your agent.',
    },
    {
        selector: '[data-tour="integration-script"]',
        content: 'You can also copy and paste the integration script into your Website, to make the agent widget to be available for your visitors.',
    },
    {
        selector: '#root',
        content: (
            <div>
                <strong>Congratulations!</strong>
                <div>You have learned the basics of AI Agents creation with YouAgent.me platform. Hope you enjoyed it! If you have any more questions - please feel free to contact our support.</div>
            </div>
        ),
        position: 'center' as const,
    },
];

function Root() {
    const [isTourOpen, setIsTourOpen] = useState(localStorage.getItem('tourCompleted') !== 'true');
    const [blueprintInteracted, setBlueprintInteracted] = useState(false);
    const [skipBlueprint, setSkipBlueprint] = useState<(() => void) | null>(null);
    const [agentCreated, setAgentCreated] = useState(false);
    const [chatOpened, setChatOpened] = useState(false);
    const [agentDeployed, setAgentDeployed] = useState(false);
    const [firstTourRun, setFirstTourRun] = useState(localStorage.getItem('tourCompleted') !== 'true');

    const buttonStyle = {
        backgroundColor: '#1976d2',
        color: '#fff',
        border: 'none',
        borderRadius: '20px',
        padding: '6px 16px',
        cursor: 'pointer',
    };

    // Централизованная функция закрытия тура — используем её в onClose и в кнопке Close
    const closeTour = () => {
        try {
            setIsTourOpen(false);
            setFirstTourRun(false);
            localStorage.setItem('tourCompleted', 'true');
        } catch (e) {
            console.warn('Error closing tour and saving state', e);
        }
    };

    return (
        <React.StrictMode>
            <ThemeProvider theme={theme}>
                <CookiesProvider defaultSetOptions={cookieOptions}>
                    <TourProvider
                        steps={steps}
                        open={isTourOpen}
                        // используем closeTour здесь
                        onClose={() => {
                            closeTour();
                        }}
                        disableInteraction={false}
                        showButtons={true}
                        showNavigation={true}
                        nextButton={({ currentStep, setCurrentStep, setIsOpen, stepsLength }) => {
                            const blockedSteps = [1]; // your original blocked steps
                            if (blockedSteps.includes(currentStep)) {
                                return null;
                            }

                            // нельзя нажать Next пока агент не создан (step index 8)
                            if (currentStep === 8 && !agentCreated && firstTourRun) {
                                return null; // блокируем Next только если первый запуск
                            }
                            if (currentStep === 10 && !chatOpened && firstTourRun) {
                                return null;
                            }
                            // step index 12 (chat-close) — Next всегда заблокирован, только крестик
                            if (currentStep === 12) {
                                return null;
                            }

                            // step index 13 (deploy-button) — Next заблокирован пока деплой не завершён
                            if (currentStep === 13 && !agentDeployed && firstTourRun) {
                                return null;
                            }

                            if (currentStep === 2 || currentStep === 3) {
                                return (
                                    <button
                                        style={buttonStyle}
                                        onClick={() => {
                                            if (!blueprintInteracted && skipBlueprint) {
                                                skipBlueprint();
                                            } else {
                                                setCurrentStep(4);
                                            }
                                        }}
                                    >
                                        Next
                                    </button>
                                );
                            }

                            const isLast = currentStep === stepsLength - 1;
                            return (
                                <button
                                    style={buttonStyle}
                                    onClick={() => {
                                        if (isLast) {
                                            // вместо просто setIsOpen(false) — используем centralized close
                                            // note: всё ещё можно вызвать setIsOpen(false) чтобы закрыть тур UI, но важно синхронно обновить локальное состояние и localStorage
                                            try {
                                                // закрываем UI тура через контекстную функцию (если нужно)
                                                setIsOpen(false);
                                            } catch (e) {
                                                // игнорируем если setIsOpen недоступна
                                            }
                                            // гарантируем, что наш локальный state и localStorage установлены
                                            closeTour();
                                        } else {
                                            setCurrentStep(currentStep + 1);
                                        }
                                    }}
                                >
                                    {isLast ? 'Close' : 'Next'}
                                </button>
                            );
                        }}
                        prevButton={({ currentStep, setCurrentStep }) => {
                            if (currentStep === 0) {
                                return null;
                            }

                            if (currentStep === 4) {
                                return (
                                    <button
                                        style={buttonStyle}
                                        onClick={() => {
                                            setCurrentStep(2);
                                        }}
                                    >
                                        Prev
                                    </button>
                                );
                            }

                            return (
                                <button
                                    style={buttonStyle}
                                    onClick={() => {
                                        if (currentStep > 0) {
                                            setCurrentStep(currentStep - 1);
                                        }
                                    }}
                                >
                                    Prev
                                </button>
                            );
                        }}
                        setBlueprintInteracted={(value: boolean) => setBlueprintInteracted(value)}
                        setSkipBlueprint={(fn: () => void) => setSkipBlueprint(() => fn)}
                        setAgentCreated={(value: boolean) => setAgentCreated(value)}
                        setChatOpened={(value: boolean) => setChatOpened(value)}
                        setAgentDeployed={(value: boolean) => setAgentDeployed(value)}
                    >
                        <App
                            setChatOpened={setChatOpened}
                            setAgentDeployed={setAgentDeployed}
                        />
                    </TourProvider>
                </CookiesProvider>
            </ThemeProvider>
        </React.StrictMode>
    );
}


createRoot(document.getElementById('root')!).render(<Root />);