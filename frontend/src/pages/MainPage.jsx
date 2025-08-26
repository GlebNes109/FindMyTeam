import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    Link,
    Stack,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EventIcon from "@mui/icons-material/Event";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate } from "react-router-dom";
import {apiFetch, refreshAccessToken} from "../apiClient.js";
import {cyan, grey, teal} from "@mui/material/colors";

function MainPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));

    const [events, setEvents] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        apiFetch("/events")
            .then((res) => res.json())
            .then((data) => setEvents(data || []))
            .catch((err) => console.error("Ошибка загрузки событий:", err));
    }, [navigate]);

    useEffect(() => {
        refreshAccessToken()
            .then(() => setIsLoggedIn(true))
            .catch(() => setIsLoggedIn(false));
    }, []);

    // Общий стилевой Section - занимает высоту экрана, но не больше. при избытке контента прокрутки нет
    const sectionSx = {
        height: "100svh",
        maxHeight: "100svh",
        display: "grid",
        gridTemplateRows: "1fr",
        alignItems: "center",
        // overflowY: "auto",
        py: { xs: 6, md: 8 },
    };

    // Кнопки вплотную/ на xs — вертикально вплотную, на sm — горизонтально вплотную
    const AuthButtons = ({ loggedIn }) => (
        <Box
        >
            {!loggedIn ? ( <ButtonGroup variant="contained" aria-label="Basic button group">
                <Button sx={{width: 300}} variant="contained" onClick={() => navigate("/auth")}>Начать</Button>
            </ButtonGroup>
            ) : (
                <ButtonGroup variant="contained" aria-label="Authenticated user buttons">
                    <Button variant="contained" onClick={() => navigate("/home")}>Мой профиль</Button>
                    <Button variant="contained" onClick={() => navigate("/events")}>Доступные мероприятия</Button>
                </ButtonGroup> )}

        </Box>
    );

    return (
        <>
            <Toolbar />

            <Box
                sx={{
                    ...sectionSx,
                    px: 2,
                    position: "relative",
                    color: "white",
                    textAlign: "center",
                    overflow: "hidden",
                }}
            >
                {/* Видео фон */}
                <video
                    muted
                    playsInline
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        zIndex: 0,
                    }}
                    autoPlay
                    onEnded={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = e.currentTarget.duration; // фиксируемся на последнем кадре
                    }}
                    sx={{
                        display: { xs: "none", md: "block" },
                    }}
                >

                    <source src="/video_2.mp4" type="video/mp4" />
                </video>

                <video
                    muted
                    playsInline
                    autoPlay
                    loop
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        zIndex: 0,
                    }}
                    // показывается только на телефоне
                    sx={{
                        display: { xs: "block", md: "none" },
                    }}
                >
                    <source src="/video_mobile.mp4" type="video/mp4" />
                </video>
                <Container maxWidth="md" sx={{  position: "relative", zIndex: 1, display: "grid", placeItems: "center" }}>
                    <Box>
                        <Typography
                            variant={isXs ? "h4" : "h3"}
                            gutterBottom
                            sx={{
                                color: teal[100],
                                fontWeight: 800,
                                letterSpacing: ".02em",
                                textShadow:
                                    "0 0 5px rgba(0,229,255,.7), 0 0 24px rgba(0,229,255,.35)",
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

            {/* События */}
            <Box
                sx={{
                    py: 7,
                    bgcolor: "grey.900",
                    color: "white",
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            textShadow: "0 0 8px rgba(0,229,255,.35)",
                            mb: 4,
                        }}
                    >
                        Последние события
                    </Typography>

                    {events.length === 0 ? (
                        <Typography textAlign="center" color="grey.400">
                            Нет доступных событий
                        </Typography>
                    ) : (
                        <>
                            <Grid container spacing={3} justifyContent="center">
                                {events.slice(0, 4).map((event) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
                                        <Card
                                            onClick={() => navigate(`/event/${event.id}`)}
                                            sx={{
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                bgcolor: "background.paper",
                                                color: "text.primary",
                                                borderRadius: 2,
                                                transition: "transform .2s, box-shadow .2s",
                                                "&:hover": {
                                                    transform: "translateY(-4px)",
                                                    boxShadow: 6,
                                                },
                                                cursor: "pointer",
                                            }}
                                        >
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" gutterBottom fontWeight={700}>
                                                    {event.name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                        mb: 1,
                                                    }}
                                                >
                                                    {event.description}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                    <b>Дата начала:</b> {event.start_date}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <b>Дата окончания:</b> {event.end_date}
                                                </Typography>

                                                <Box mt={1}>
                                                    <Typography variant="subtitle2">Треки:</Typography>
                                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                                        {(event.event_tracks || []).map((track) => (
                                                            <Chip
                                                                key={track.id}
                                                                label={track.name}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ mb: 0.5 }}
                                                            />
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            </CardContent>

                                            <Box p={2}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/event/${event.id}/register`);
                                                    }}
                                                >
                                                    Я участвую
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            <Box mt={4} display="flex" justifyContent="center">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate("/events")}
                                    endIcon={<ArrowForwardIosIcon />}
                                >
                                    Смотреть все события
                                </Button>
                            </Box>
                        </>
                    )}
                </Container>
            </Box>

            {/* Как это работает*/}
            <Box
                sx={{
                    ...sectionSx,
                    bgcolor: "background.default",
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: 700, mb: 4 }}
                    >
                        Как это работает
                    </Typography>

                    <Grid container spacing={3} justifyContent="center">
                        {[
                            {
                                icon: <EventIcon />,
                                title: "1. Выбери событие",
                                text: "Просматривай список мероприятий и выбирай интересные тебе.",
                            },
                            {
                                icon: <GroupAddIcon />,
                                title: "2. Найди команду",
                                text: "Откликайся на вакансии или создай свою команду.",
                            },
                            {
                                icon: <EmojiEventsIcon />,
                                title: "3. Участвуй и побеждай",
                                text: "Работайте вместе и побеждайте на соревнованиях.",
                            },
                        ].map((step, idx) => (
                            <Grid item xs={12} sm={6} md={4} key={idx}>
                                <Stack
                                    alignItems="center"
                                    spacing={2}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        bgcolor: grey[800],
                                        border: (t) =>
                                            `1px solid ${t.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                                        height: "100%",
                                        textAlign: "center",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 52,
                                            height: 52,
                                            borderRadius: "50%",
                                            display: "grid",
                                            placeItems: "center",
                                            bgcolor: "primary.main",
                                            color: "primary.contrastText",
                                            boxShadow: (t) => `0 0 18px ${t.palette.primary.main}66`,
                                        }}
                                    >
                                        {step.icon}
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {step.title}
                                    </Typography>
                                    <Typography color="text.secondary">{step.text}</Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* FAQ */}
            <Box
                sx={{
                    ...sectionSx,
                    bgcolor: grey[700],
                }}
            >
                <Container>
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: 700, mb: 4 }}
                    >
                        Часто задаваемые вопросы
                    </Typography>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                            >
                                <HelpOutlineIcon color="primary" /> Как создать команду?
                            </Typography>
                            <Typography color="text.secondary">
                                На странице регистрации на мероприятие выберите роль «Тимлид». После этого вы сможете
                                создать команду, в которой вы будете тимлидом. Вакансии можно создать на этапе
                                создания команды или позже. Поддерживается markdown в описании вакансии.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                            >
                                <HelpOutlineIcon color="primary" /> Как откликнуться на вакансию?
                            </Typography>
                            <Typography color="text.secondary">
                                В таблице команд выберите нужную и перейдите на страницу с деталями. Там вы можете
                                откликнуться на вакансию. Нельзя откликнуться, если уже состоите в другой команде
                                или треки вакансии и ваш не совпадают.
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Footer*/}
            <Box sx={{ bgcolor: "grey.900", color: "white", py: 4 }}>
                <Container>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        spacing={2}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                        <Typography variant="body2">© 2025 FindMyTeam</Typography>
                        <Stack direction="row" spacing={2}>
                            <Link href="#" underline="hover" color="inherit">
                                О нас
                            </Link>
                            <Link href="#" underline="hover" color="inherit">
                                Контакты
                            </Link>
                            <Link href="#" underline="hover" color="inherit">
                                Политика конфиденциальности
                            </Link>
                        </Stack>
                    </Stack>
                </Container>
            </Box>
        </>
    );
}

export default MainPage;
