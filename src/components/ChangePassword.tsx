import * as React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    TextField,
    Alert
} from "@mui/material";
import axios from "axios";

interface ChangePasswordProps {
    user: any,
    token: string, // нужен токен для авторизации
    setGlobalLoading: (state: any) => void
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ user, token, setGlobalLoading }) => {
    const [open, setOpen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleClickOpen = () => {
        setError(null);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        // @ts-expect-error
        const formData = new FormData(event.currentTarget);
        const { currentPassword, newPassword, confirmPassword } = Object.fromEntries((formData as any).entries());

        if (!currentPassword?.trim() || !newPassword?.trim() || !confirmPassword?.trim()) {
            setError("Please fill current password, new password and confirm password fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New password and confirm password should be the same");
            return;
        }

        setGlobalLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/change-password`,
                {
                    email: user?.email,
                    currentPassword,
                    newPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("Password change response:", response.data);
            setGlobalLoading(false);
            handleClose();
        } catch (e: any) {
            console.error("Password change failed:", e);
            setError(e.response?.data?.error || "Could not change password");
            setGlobalLoading(false);
        }
    };

    return (
        <>
            <Button variant="outlined" onClick={handleClickOpen}>Change Password</Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                            {error}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} id="change-password-form">
                        <TextField
                            required
                            margin="dense"
                            name="currentPassword"
                            label="Current Password"
                            type="password"
                            fullWidth
                            variant="standard"
                        />
                        <TextField
                            required
                            margin="dense"
                            name="newPassword"
                            label="New Password"
                            type="password"
                            fullWidth
                            variant="standard"
                        />
                        <TextField
                            required
                            margin="dense"
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            fullWidth
                            variant="standard"
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" form="change-password-form">
                        Change
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ChangePassword;
