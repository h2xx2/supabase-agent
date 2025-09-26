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

const steps: StepType[] = [
    {
        selector: '[data-tour="welcome"]',
        content: (): React.ReactNode => (
            <div>
                <strong>Добро пожаловать в YouAgent.me!</strong>
                <div>Этот тур проведет вас через процесс создания агента. Нажмите "Далее", чтобы продолжить.</div>
            </div>
        ),
        position: 'center' as const,
    },
    {
        selector: '[data-tour="new-agent-button"]',
        content: 'Нажмите кнопку "New Agent", чтобы начать создание нового агента.',
        stepInteraction: true,
    },
    {
        selector: '[data-tour="blueprint-select"]',
        content: 'Выберите шаблон для запуска примеров агентов или нажмите "Next" для создания агента с нуля.',
        // убираем stepInteraction, чтобы можно было принудительно продвигать тур
        stepInteraction: true,
    },
    {
        selector: '#blueprint-menu',
        content: 'Это выпадающий список шаблонов. Выберите один из них или нажмите "Next" для создания агента с нуля.',
        observed: true,
        position: 'bottom' as const,
        stepInteraction: true, // тоже убираем
    },
    {
        selector: '[data-tour="name-input"]',
        content: 'Введите имя агента. Используйте только буквы, цифры, _ или -.',
    },
    {
        selector: '[data-tour="instructions-input"]',
        content: 'Напишите инструкции для агента: как он должен общаться и какие у него обязанности (мин. 40 символов).',
    },
    {
        selector: '[data-tour="actions-checkboxes"]',
        content: 'Если вашему агенту нужны действия (email / http), включите соответствующие флаги.',
    },
    {
        selector: '[data-tour="kb-section"]',
        content: 'Если агент должен ссылаться на документы — загрузите файл в Базу знаний (PDF или TXT).',
    },
    {
        selector: '[data-tour="add-agent-button"]',
        content: 'Нажмите "Добавить", чтобы создать агента.',
        stepInteraction: true,
    },
    {
        selector: '[data-tour="agent-card"]',
        content: 'Поздравляем! Агент создан. Далее — чат, деплой и интеграция.',
        observed: true, // <-- добавляем
    },
    {
        selector: '[data-tour="open-chat-button"]',
        content: 'Click the "Chat" button to instantly start chatting with your agent.',
    },
    {
        selector: '[data-tour="chat-dialog"]',
        content: 'Write your first message to the agent and click the "Send" button.',
    },
    {
        selector: '[data-tour="chat-close"]',
        content: 'Chat as long as you like. Then press the "Close" button to close the chat dialog.',
    },
    {
        selector: '[data-tour="deploy-button"]',
        content: 'To make your agent publicly available press the "Deploy" button.',
    },
    {
        selector: '[data-tour="public-link"]',
        content: 'Share the public link with your users. They can now also chat with your agent.',
    },
    {
        selector: '[data-tour="integration-script"]',
        content: 'You can also copy and paste the integration script into your website to make the agent widget available to your visitors.',
    },
    {
        selector: '[data-tour="congratulations"]',
        content: (
            <div>
                <strong>Поздравляем!</strong>
                <div>Вы освоили основы создания AI-агента на платформе YouAgent.me.</div>
            </div>
        ),
        position: 'center' as const,
    },
];

function Root() {
    const [isTourOpen, setIsTourOpen] = useState(true);
    const [blueprintInteracted, setBlueprintInteracted] = useState(false);
    const [skipBlueprint, setSkipBlueprint] = useState<(() => void) | null>(null);
    const [agentCreated, setAgentCreated] = useState(false);

    return (
        <React.StrictMode>
            <ThemeProvider theme={theme}>
                <CookiesProvider defaultSetOptions={cookieOptions}>
                    <TourProvider
                        steps={steps}
                        open={isTourOpen}
                        onClose={() => setIsTourOpen(false)}
                        disableInteraction={false}
                        showButtons={true}
                        showNavigation={true}
                        nextButton={({ currentStep, setCurrentStep, setIsOpen, stepsLength }) => {
                            const blockedSteps = [1];
                            if (blockedSteps.includes(currentStep)) {
                                return null;
                            }

                            if (currentStep === 8) {
                                if (!agentCreated) {
                                    return null;
                                }
                                return (
                                    <button
                                        onClick={() => {
                                            setCurrentStep(currentStep + 1);
                                        }}
                                    >
                                        Next
                                    </button>
                                );
                            }

                            if (currentStep === 2 || currentStep === 3) {
                                return (
                                    <button
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
                                <button onClick={() => (isLast ? setIsOpen(false) : setCurrentStep(currentStep + 1))}>
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
                    >
                        <App setAgentCreated={setAgentCreated} />
                    </TourProvider>
                </CookiesProvider>
            </ThemeProvider>
        </React.StrictMode>
    );
}

createRoot(document.getElementById('root')!).render(<Root />);