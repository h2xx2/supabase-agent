import * as React from 'react';
import { Alert, Box, Button, Grid, TextField, Typography } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import StatCard from "./StatCard";
// @ts-ignore
import StatCardProps from "./StatCard";
import ChangePassword from "./ChangePassword";
import Pricing from "./Pricing";
import {useState} from "react";

interface SettingsProps {
    callCount: any,
    deviceType: string,
    user: any,
    setGlobalLoading: (state: any) => void
}

const Settings: React.FC<SettingsProps> = ({ callCount, deviceType, user, setGlobalLoading }) => {
    const [error, setError] = React.useState<string | null>(null);
    const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);

    const settings = [
        {
            name: 'first_name',
            label: "First Name",
            defaultValue: user.first_name || '',
        },
        {
            name: 'last_name',
            label: "Last Name",
            defaultValue: user.last_name || '',
        },
        {
            name: 'date_of_birth',
            label: "Date of Birth (optional)",
        },
        {
            name: 'username',
            label: "Username",
            defaultValue: user.email,
            readOnly: true
        }
    ];

    // @ts-ignore
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

    const onChangeDate = (date: Date | null) => {
        setDateOfBirth(date ? date.toISOString().split("T")[0] : null);
    };

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        // @ts-ignore
        const formData = new FormData(event.currentTarget);
        const { first_name, last_name } = Object.fromEntries((formData as any).entries());
        if (!first_name?.trim() || !last_name?.trim()) {
            setError("Please fill first name and last name");
            return;
        }
        setGlobalLoading(true);
        const data = {
            email: user.email,  // Добавлено для Lambda
            first_name,
            last_name,
            date_of_birth: dateOfBirth
        };

        try {
            await axios.post(
                `${import.meta.env.VITE_API_GATEWAY_URL}/save-setting`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            setError("Failed to save settings. Please try again.");
            console.error("Save error:", error);
        } finally {
            setGlobalLoading(false);
        }
    }

    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
        <Box
            sx={{
                flexGrow: 1,
            }}
        >
            {error && (
                <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                    {error}
                </Alert>
            )}
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
                {settings.map(({ name, label, defaultValue, readOnly }, index) => (
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
                            {name.includes('date') ? (
                                <DatePicker
                                    selected={dateOfBirth ? new Date(dateOfBirth) : null}
                                    onChange={onChangeDate}
                                    dateFormat="yyyy-MM-dd"
                                    customInput={
                                        <TextField
                                            variant="standard"
                                            name={name}
                                            sx={{
                                                mb: 2,
                                                width: deviceType === "desktop" ? "70%" : "100%",
                                            }}
                                        />
                                    }
                                />
                            ) : (
                                <TextField
                                    variant="standard"
                                    sx={{
                                        mb: 2,
                                        width: deviceType === 'desktop' ? '70%' : '100%',
                                    }}
                                    name={name}
                                    defaultValue={defaultValue}
                                    slotProps={
                                        readOnly ? {
                                            input: {
                                                readOnly: true,
                                            },
                                        } : {}
                                    }
                                />
                            )}
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
                    <ChangePassword token={''} {...{user, setGlobalLoading}} />
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
                    <Grid key={index} size={deviceType === 'mobile' ? 12 : 6}>
                        <StatCard {...card} />
                    </Grid>
                ))}
            </Grid>

            <Pricing />
        </Box>
    );
}

export default Settings;