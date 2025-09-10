import TermsAndConditions from "./TermsAndConditions";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {useEffect, useState, FC} from "react";

interface TermsAndConditionAcceptanceDialogProps {
    isUserLoggedIn: boolean
}

const TermsAndConditionAcceptanceDialog: FC<TermsAndConditionAcceptanceDialogProps> = ({isUserLoggedIn}) => {
    const [alreadyShown, setAlreadyShown] = useState(false);
    const [isDialogOpened, setIsDialogOpened] = useState(false);

    useEffect(() => {
        if (!alreadyShown && isUserLoggedIn) {
            setIsDialogOpened(true);
            setAlreadyShown(true);
        }
    }, [isUserLoggedIn]);

    const handleClose = () => {
        setIsDialogOpened(false);
    };

    return <Dialog open={isDialogOpened} onClose={handleClose} >
        <DialogContent>
            <TermsAndConditions />
        </DialogContent>
        <DialogActions>
            <Button variant="contained" color='success' onClick={handleClose}>Accept</Button>
            <Button variant="contained" color='error' onClick={handleClose}>Decline</Button>
        </DialogActions>
    </Dialog>;
}

export default TermsAndConditionAcceptanceDialog;
