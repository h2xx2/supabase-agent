import TermsAndConditions from "./TermsAndConditions";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { useEffect, useState, type FC } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

interface TermsAndConditionAcceptanceDialogProps {
    isUserLoggedIn: boolean;
    user: any;
    onUpdateUser: (updatedProfile: any) => void;
    onDialogStateChange?: (isOpen: boolean) => void; // новое
}

const TermsAndConditionAcceptanceDialog: FC<TermsAndConditionAcceptanceDialogProps> = ({
                                                                                           isUserLoggedIn,
                                                                                           user,
                                                                                           onUpdateUser,
                                                                                           onDialogStateChange
                                                                                       }) => {
    const [isDialogOpened, setIsDialogOpened] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cookies] = useCookies(["authToken"]);

    useEffect(() => {
        const termsAccepted =
            user?.profile?.terms_and_conditions_of_use ??
            user?.terms_and_conditions_of_use ??
            user?.profileData?.terms_and_conditions_of_use;

        const shouldOpen = isUserLoggedIn && termsAccepted === false;
        setIsDialogOpened(shouldOpen);

        if (onDialogStateChange) {
            onDialogStateChange(shouldOpen);
        }
    }, [isUserLoggedIn, user, onDialogStateChange]);



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
            if (onDialogStateChange) onDialogStateChange(false);
        } catch (error) {
            console.error("Error saving conditions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = () => {
        setIsDialogOpened(false);
        if (onDialogStateChange) onDialogStateChange(false);
    };


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