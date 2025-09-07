import * as React from 'react';
import {Box, Button, Grid, TextField, Typography} from "@mui/material";
import StatCard from "./StatCard";
import StatCardProps from "./StatCard";
import ChangePassword from "./ChangePassword";
import Pricing from "./Pricing";

interface SettingsProps {
    deviceType: string,
    user: any,
    setGlobalLoading: (state) => void
}

const Settings: React.FC<SettingsProps> = ({deviceType,user, setGlobalLoading}) => {
    const [firstName, setFirstName] = React.useState<string>(user.email);
    const [lastName, setLastName] = React.useState<string>(user.email);
    const [username, setUsername] = React.useState<string>(user.email);

    const settings = [
        {
            name: 'firstName',
            label: "First Name",
            value: firstName,
            onChange: (e) => {setFirstName(e.target.value)}
        },
        {
            name: 'lastName',
            label: "Last Name",
            value: lastName,
            onChange: (e) => {setLastName(e.target.value)}
        },
        {
            name: 'username',
            label: "Username",
            value: username,
            onChange: (e) => {setUsername(e.target.value)}
        }
    ];

    const statisticData: StatCardProps[] = [
        {
            title: 'Messages per month',
            value: 120,
        },
        {
            title: 'Messages per year',
            value: 560,
        },
    ];

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log('save settings', user);
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
        console.log("save: formJson -", formJson);
        setGlobalLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setGlobalLoading(false);
    }

    return (
        <Box
            sx={{
                flexGrow: 1,
                // m: '0 2',
                // p: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 3 : 4,
                // width: deviceType === 'mobile' ? '100%' : '75%',
            }}

        >
            <form onSubmit={save}
                  id="save-settings-form"
                  noValidate
                  autoComplete="off"
            >
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center'
                }}>
                    <Button
                        variant="contained"
                        color='secondary'
                        type="submit"
                        form='save-settings-form'
                    >Save</Button>
                </Box>
                {settings.map(({name, label, value, onChange}, index) => (
                    <Box key={index} sx={{
                        display: 'flex',
                        ...(deviceType === 'desktop' ? {
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        } : {
                            flexDirection: 'column',
                            justifyContent: 'flex-start'
                        })
                    }}>
                        <Box sx={{
                            width: deviceType === 'desktop' ? '50%' : '100%',
                            textAlign: 'left',
                        }}>
                            <Typography
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.125rem' : '1.25rem',
                                }}
                            >
                                {label}
                            </Typography>
                        </Box>
                        <Box sx={{
                            width: deviceType === 'desktop' ? '50%' : '100%',
                            textAlign: deviceType === 'desktop' ? 'right' : 'center'
                        }}>
                            <TextField
                                variant="standard"
                                sx={{
                                    mb: 2,
                                    width: deviceType === 'desktop' ? '70%' : '100%',
                                }}
                                name={name}
                                value={value}
                                onChange={onChange}
                            />
                        </Box>
                    </Box>
                ))}
            </form>
            <Box sx={{
                display: 'flex',
                ...(deviceType === 'desktop' ? {
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                } : {
                    flexDirection: 'column',
                    justifyContent: 'center'
                })
            }}>
                <Box sx={{
                    p: 'auto',
                    width: '50%',
                    textAlign: 'left',
                }}>
                    <Typography
                        sx={{
                            fontWeight: 'bold',
                            fontSize: deviceType === 'mobile' ? '1rem' : deviceType === 'tablet' ? '1.125rem' : '1.25rem',
                        }}
                    >
                        Password
                    </Typography>
                </Box>
                <Box sx={{
                    width: '50%',
                    textAlign: deviceType === 'desktop' ? 'right' : 'center',
                }}>
                    <ChangePassword {...{user, setGlobalLoading}} />
                </Box>
            </Box>

            <Grid
                container
                spacing={2}
                columns={12}
                sx={{
                    mt: 2,
                    justifyContent: 'center'
                }}
            >
                {statisticData.map((card, index) => (
                    <Grid key={index} size={ deviceType === 'mobile' ? 12 : 6 }>
                        <StatCard {...card} />
                    </Grid>
                ))}
            </Grid>

            <Pricing />
        </Box>
    );
}

export default Settings;