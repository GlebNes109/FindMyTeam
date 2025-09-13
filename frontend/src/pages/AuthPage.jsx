import { useState } from "react";
import {Typography, Container, Box, Tabs, Tab, Toolbar, SvgIcon, Button} from "@mui/material";
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
    function GoogleIcon(props) {
        return (
            <SvgIcon {...props}>
                <path d="M21.35 11.1h-9.17v2.9h5.27c-.23 1.2-1.47 3.52-5.27 3.52-3.17 0-5.75-2.62-5.75-5.85s2.58-5.85 5.75-5.85c1.81 0 3.03.78 3.73 1.45l2.54-2.45C18.28 3.25 15.82 2 12.18 2 6.59 2 2 6.59 2 12s4.59 10 10.18 10c5.92 0 9.82-4.15 9.82-9.95 0-.66-.07-1.15-.65-1.95z" />
            </SvgIcon>
        );
    }

    const loginWithGoogle = () => {
        window.location.href = `/api/users/auth/google/login`
        };

    return (
        <>
        <Toolbar/>
        <Container maxWidth="sm" sx={{ minHeight: '100%', display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    width: '100%',
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
                    <Button
                        variant="contained"
                        startIcon={<GoogleIcon />}
                        fullWidth
                        onClick={loginWithGoogle}
                        sx={{
                            textTransform: 'none',
                            my: 2
                        }}
                    >
                        Войти через Google
                    </Button>
            </Box>
        </Container>
            </>
    );
}
