import React from 'react';
import {
    Box,
    Container,
    Grid,
    Stack,
    Typography
} from "@mui/material";

function SupportedEventsSection() {
    const events = [
        {
            logo: "prod.png",
            title: "",
            color: '#003f28',
            url: "https://prodcontest.ru/"
        },
        {
            logo: "dano.png",
            title: "",
            color: '#323332',
            url: "https://dano.hse.ru/"
        },
        {
            logo: "deadline.png",
            title: "",
            color: '#141414',
            url: "https://event.centraluniversity.ru/casecontest"
        },
    ];

    return (
        <Box
            sx={{
                py: 7,
                bgcolor: "background.papaer",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 2
                }}
            >
                <Box
                    component="img"
                    src="logo_yellow.png"
                    sx={{
                        width: { xs: "35%", sm: "240px" },
                        height: "auto"
                    }}
                />
            </Box>
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        mb: 4,
                        fontSize: {
                            xs: "1.5rem",
                            sm: "2rem",
                            md: "2.5rem",
                        },
                    }}
                >
                    Единый сервис для всех олимпиад и хакатонов
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                    {events.map((event, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                            <Stack
                                alignItems="center"
                                justifyContent="center"
                                spacing={2}
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    bgcolor: event.color,
                                    border: (t) =>
                                        `1px solid ${
                                            t.palette.mode === "dark"
                                                ? "rgba(255,255,255,0.08)"
                                                : "rgba(0,0,0,0.08)"} `,
                                    height: { xs: "140px", sm: "100%" },
                                    textAlign: "center",
                                }}
                            >
                                <Box
                                    component="a"
                                    href={event.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ display: "block", width: "100%" }}
                                >
                                    <Box
                                        component="img"
                                        src={event.logo}
                                        sx={{
                                            width: {xs: "100%", sm: 300},
                                            height: {sm: "auto", xs: "auto"}
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

export default SupportedEventsSection;

