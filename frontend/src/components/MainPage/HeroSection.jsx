import React from 'react';
import {
    Box,
    Button,
    ButtonGroup,
    Container,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from "react-router-dom";

function HeroSection({ isLoggedIn }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));

    const AuthButtons = ({ loggedIn }) => (
        <Box>
            {!loggedIn ? (
                <ButtonGroup variant="contained" aria-label="Basic button group">
                    <Button variant="outlined" sx={{width: {sm: "120px" }}} onClick={() => navigate("/auth")}>Войти</Button>
                    <Button variant="contained" onClick={() => navigate("/events")}>Доступные мероприятия</Button>
                </ButtonGroup>
            ) : (
                <ButtonGroup variant="contained" aria-label="Authenticated user buttons">
                    <Button variant="contained" onClick={() => navigate("/home")}>Мой профиль</Button>
                    <Button variant="contained" onClick={() => navigate("/events")}>Доступные мероприятия</Button>
                </ButtonGroup>
            )}
        </Box>
    );

    const sectionSx = {
        height: "100svh",
        maxHeight: "100svh",
        display: "grid",
        gridTemplateRows: "1fr",
        alignItems: "center",
        py: { xs: 6, md: 8 },
    };

    return (
        <>
            <Box
                sx={{
                    ...sectionSx,
                    position: "relative",
                    color: "white",
                    textAlign: "center",
                    overflow: "hidden",
                    height: "100vh",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 0,
                        display: { xs: "none", md: "block" },
                        pointerEvents: "none",
                    }}
                >
                    <video
                        muted
                        playsInline
                        autoPlay
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    >
                        <source src="/video_2.mp4" type="video/mp4" />
                    </video>
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 0,
                        display: { xs: "block", md: "none" },
                        pointerEvents: "none",
                    }}
                >
                    <video
                        muted
                        playsInline
                        autoPlay
                        loop
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    >
                        <source src="/video_mobile.mp4" type="video/mp4" />
                    </video>
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 1,
                        display: "grid",
                        placeItems: "center",
                        px: 2,
                    }}
                >
                    <Container maxWidth="md">
                        <Box sx={{ textAlign: "center" }}>
                            <Typography
                                variant={isXs ? "h4" : "h3"}
                                gutterBottom
                                sx={{
                                    color: "primary.main",
                                    fontWeight: 800,
                                    letterSpacing: ".02em",
                                }}
                            >
                                Добро пожаловать в FindMyTeam
                            </Typography>

                            <Typography
                                variant={isXs ? "body1" : "h6"}
                                mb={3}
                                sx={{
                                    color: "rgba(255,255,255,0.9)",
                                    textShadow: "0 0 6px rgba(0,0,0,.45)",
                                }}
                            >
                                Начните собирать свою команду уже сегодня!
                            </Typography>

                            <AuthButtons loggedIn={isLoggedIn} />
                        </Box>
                    </Container>
                </Box>
            </Box>
            <Box
                sx={{
                    position: "absolute",
                    bottom: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 2,
                    color: "white",
                    filter: "drop-shadow(0 0 12px rgba(0,0,0,0.8))",
                    opacity: 0.9,
                    animation: "bounce 2s infinite",
                }}
            >
                <KeyboardArrowDownIcon sx={{ fontSize: 80 }} />
            </Box>
            <style>
                {`
                    @keyframes bounce {
                        0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
                        40% { transform: translateX(-50%) translateY(12px); }
                        60% { transform: translateX(-50%) translateY(6px); }
                    }
                `}
            </style>
        </>
    );
}

export default HeroSection;

