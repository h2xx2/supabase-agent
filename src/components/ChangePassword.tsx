import * as React from 'react';
import {Box, Button, Dialog, DialogActions, DialogTitle, DialogContent, TextField, Alert} from "@mui/material";
import axios from "axios";

interface ChangePasswordProps {
    user: any,
    setGlobalLoading: (state) => void
}

async function handleSignIn(email, password) {
    const response = await axios.post(
        `${import.meta.env.VITE_API_GATEWAY_URL}/signin`,
        {email, password},
        {headers: {"Content-Type": "application/json"}}
    );
    // console.log("handleSignIn: response -", response);
    const outerData = response.data;
    const data =
        typeof outerData.body === "string"
            ? JSON.parse(outerData.body)
            : outerData.body;

    const {user, token} = data;
    if (!user || !token) {
        throw new Error("Incorrect server response");
    }
}

async function handleChangePassword(password) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
}

const ChangePassword: React.FC<ChangePasswordProps> = ({user, setGlobalLoading}) => {
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
        const formData = new FormData(event.currentTarget);
        const {currentPassword, newPassword, confirmPassword} = Object.fromEntries((formData as any).entries());
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
            await handleSignIn(user.email, currentPassword);
        } catch (e) {
            setError("Incorrect current password");
            setGlobalLoading(false);
            return
        }

        try {
            await handleChangePassword(newPassword);
        } catch (e) {
            setError("Could not change password");
            setGlobalLoading(false);
            return
        }
        setGlobalLoading(false);
        handleClose();
    };

    return (
        <>
            <Button variant="outlined" onClick={handleClickOpen}>Change Password</Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    {/*<DialogContentText>*/}
                    {/*    To subscribe to this website, please enter your email address here. We*/}
                    {/*    will send updates occasionally.*/}
                    {/*</DialogContentText>*/}
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
}

export default ChangePassword;