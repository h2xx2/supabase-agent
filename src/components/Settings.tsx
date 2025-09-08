import * as React from 'react';
import {Box, Button, Grid, TextField, Typography} from "@mui/material";
import StatCard from "./StatCard";
import StatCardProps from "./StatCard";
import ChangePassword from "./ChangePassword";
import Pricing from "./Pricing";

interface SettingsProps {
    callCount: any,
    deviceType: string,
    user: any,
    setGlobalLoading: (state) => void
}

const Settings: React.FC<SettingsProps> = ({callCount, deviceType,user, setGlobalLoading}) => {
    const settings = [
        {
            name: 'firstName',
            label: "First Name",
            defaultValue: user.email,
        },
        {
            name: 'lastName',
            label: "Last Name",
            defaultValue: user.email,
        },
        {
            name: 'username',
            label: "Username",
            defaultValue: user.email,
            readOnly: true
        }
    ];

    const statisticData: StatCardProps[] = [
        {
            title: 'Messages per month',
            value: callCount.month,
        },
        {
            title: 'Messages per year',
            value: callCount.year,
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
                {settings.map(({name, label, defaultValue, readOnly}, index) => (
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
                                    color: 'text.secondary',
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
                                defaultValue={defaultValue}
                                // disabled={disabled}
                                slotProps={readOnly ? {
                                        input: {
                                            readOnly: true,
                                        },
                                    } : {}
                                }
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
                            color: 'text.secondary',
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