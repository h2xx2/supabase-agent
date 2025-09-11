import TermsAndConditions from "./TermsAndConditions";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { useEffect, useState, FC } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

interface TermsAndConditionAcceptanceDialogProps {
    isUserLoggedIn: boolean;
    userProfile: any; // Профиль пользователя с terms_and_conditions_of_use
    onUpdateUser: (updatedUser: any) => void; // Обновление локального пользователя
}

const TermsAndConditionAcceptanceDialog: FC<TermsAndConditionAcceptanceDialogProps> = ({
                                                                                           isUserLoggedIn,
                                                                                           userProfile,
                                                                                           onUpdateUser
                                                                                       }) => {
    const [isDialogOpened, setIsDialogOpened] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cookies] = useCookies(["authToken"]);

    useEffect(() => {
        // Показываем диалог, если пользователь залогинен и terms_and_conditions_of_use === false
        if (isUserLoggedIn && userProfile && !userProfile.terms_and_conditions_of_use) {
            setIsDialogOpened(true);
        } else {
            setIsDialogOpened(false);
        }
    }, [isUserLoggedIn, userProfile]);

    const handleAccept = async () => {
        if (!userProfile) return;

        setLoading(true);
        try {
            const token = cookies["authToken"];
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/save-conditions`,
                { email: userProfile.email, agreementConditions: true },
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );

            // Обновляем локальное состояние user на основе ответа сервера
            const updatedUser = response.data.profile; // Используем профиль из ответа
            onUpdateUser(updatedUser);

            setIsDialogOpened(false);
        } catch (error) {
            console.error("Ошибка при сохранении условий:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = () => setIsDialogOpened(false);

    return (
        <Dialog open={isDialogOpened} onClose={handleDecline} maxWidth="lg">
            <DialogContent>
                <TermsAndConditions />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleAccept} disabled={loading} color="success" variant="contained">
                    Accept
                </Button>
                <Button onClick={handleDecline} disabled={loading} color="error" variant="contained">
                    Decline
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default TermsAndConditionAcceptanceDialog;