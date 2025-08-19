import { useState } from "react";
import {Typography, Container, Box, Tabs, Tab, Toolbar} from "@mui/material";
import SignInForm from "../components/SignInForm.jsx";
import SignUpForm from "../components/SignUpForm.jsx";
import {grey} from "@mui/material/colors";
import {setAccessToken} from "../tokenStore.js";
import {useNavigate} from "react-router-dom";


export default function AuthPage() {
    const [tab, setTab] = useState(0);
    const navigate = useNavigate()
    const handleChange = (_, newValue) => {
        setTab(newValue);
    };

    const params = new URLSearchParams(location.search);
    const redirectTo = params.get("redirect") || "/home";
    const handleSuccess = (accessToken) => {
        setAccessToken(accessToken);
        navigate(redirectTo, { replace: true });
    };

    return (
        <>
        <Toolbar/>
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    width: '100%',
                    mt: -8,
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                    bgcolor: grey[900],
                }}
            >


                <Tabs value={tab} onChange={handleChange} variant="fullWidth" sx={{ mb: 3 }}>
                    <Tab label="Вход" />
                    <Tab label="Регистрация" />
                </Tabs>

                {tab === 0 ? (
                    <SignInForm onSuccess={handleSuccess} />
                ) : (
                    <SignUpForm onSuccess={handleSuccess} />
                )}
            </Box>
        </Container>
            </>
    );
}
