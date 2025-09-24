import TermsAndConditions from "./TermsAndConditions";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { useEffect, useState, type FC } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

interface TermsAndConditionAcceptanceDialogProps {
    isUserLoggedIn: boolean;
    user: any; // Полный объект user, содержащий email и profile
    onUpdateUser: (updatedProfile: any) => void; // Обновление профиля
}

const TermsAndConditionAcceptanceDialog: FC<TermsAndConditionAcceptanceDialogProps> = ({
                                                                                           isUserLoggedIn,
                                                                                           user,
                                                                                           onUpdateUser
                                                                                       }) => {
    const [isDialogOpened, setIsDialogOpened] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cookies] = useCookies(["authToken"]);

    useEffect(() => {
        const termsAccepted =
            user?.profile?.terms_and_conditions_of_use ??
            user?.terms_and_conditions_of_use ??
            user?.profileData?.terms_and_conditions_of_use;

        if (isUserLoggedIn && termsAccepted === false) {
            setIsDialogOpened(true);
        } else {
            setIsDialogOpened(false);
        }
    }, [isUserLoggedIn, user]);


    const handleAccept = async () => {
        if (!user || !user.email) return;

        setLoading(true);
        try {
            const token = cookies["authToken"];
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/save-conditions`,
                { email: user.email, agreementConditions: true },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const updatedProfile =
                response.data.profile ?? response.data.user?.profile ?? response.data.user;

            onUpdateUser(updatedProfile);
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