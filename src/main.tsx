import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CookiesProvider } from 'react-cookie';
import { type StepType, TourProvider } from '@reactour/tour';
import { I18nextProvider } from 'react-i18next';
import { i18n } from './utils/i18n/i18n.config';

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
                <strong>{ i18n.t('main.welcomeMessageTitle') }</strong>
                <div>{ i18n.t('main.welcomeMessageDescription') }</div>
            </div>
        ),
        position: 'center' as const,
    },
    {
        selector: '[data-tour="new-agent-button"]',
        content: i18n.t('main.newAgentButton'),
        stepInteraction: true,
    },
    {
        selector: '[data-tour="blueprint-select"]',
        content: i18n.t('main.blueprintSelect'),
        stepInteraction: true,
    },
    {
        selector: "[data-tour='blueprint-menu-list']",
        content: i18n.t('main.blueprintMenuList'),
        observed: true,
        position: 'bottom' as const,
        stepInteraction: true,
    },
    {
        selector: '[data-tour="name-input"]',
        content: i18n.t('main.nameInput'),
    },
    {
        selector: '[data-tour="instructions-input"]',
        content: i18n.t('main.instructionsInput'),
    },
    {
        selector: '[data-tour="actions-checkboxes"]',
        content: i18n.t('main.actionsCheckboxes'),
    },
    {
        selector: '[data-tour="kb-section"]',
        content: i18n.t('main.kbSection'),
    },
    {
        selector: '[data-tour="add-agent-button"]',
        content: i18n.t('main.addAgentButton'),
        stepInteraction: true,
    },
    {
        selector: '[data-tour="agent-card"]',
        content: i18n.t('main.agentCard'),
        observed: true,
    },
    {
        selector: '[data-tour="open-chat-button"]',
        content: i18n.t('main.openChatButton'),
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
        content: i18n.t('main.chatDialog'),
    },
    {
        selector: '[data-tour="chat-close"]',
        content: i18n.t('main.chatClose'),
    },
    {
        selector: '[data-tour="deploy-button"]',
        content: i18n.t('main.deployButton'),
    },
    {
        selector: '[data-tour="public-link"]',
        content: i18n.t('main.publicLink'),
    },
    {
        selector: '[data-tour="integration-script"]',
        content: i18n.t('main.integrationScript'),
    },
    {
        selector: '#root',
        content: (
            <div>
                <strong>{ i18n.t('main.congratulations') }</strong>
                <div>{ i18n.t('main.conclusionMessage') }</div>
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
            <I18nextProvider i18n={i18n}>
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
                                        {isLast ? i18n.t('main.buttonClose') : i18n.t('main.buttonNext')}
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
                                        { i18n.t('main.buttonPrev') }
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
            </I18nextProvider>
        </React.StrictMode>
    );
}


createRoot(document.getElementById('root')!).render(<Root />);