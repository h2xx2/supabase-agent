import * as React from 'react';
import {Button, Dialog, DialogActions, DialogTitle, DialogContent, TextField} from "@mui/material";

interface ChangePasswordProps {
    user: any,
    setGlobalLoading: (state: any) => void
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ setGlobalLoading}) => {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // @ts-expect-error
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
        console.log("handleSubmit: formJson -", formJson);
        // const email = formJson.email;
        // console.log(email);
        setGlobalLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
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