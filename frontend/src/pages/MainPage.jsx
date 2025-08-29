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
    Link, Skeleton,
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
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        setLoading(true);
        try {
        apiFetch("/events")
            .then((res) => res.json())
            .then((data) => setEvents(data || []))
            .catch((err) => console.error("Ошибка загрузки событий:", err))

        }
        finally {
            setLoading(false);
        }
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

    const renderSkeletonCard = () => (
        <Card sx={{ mt: 3, borderRadius: 3 }}>
            <CardContent>
                <Skeleton variant="text" width="60%" height={30} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="rectangular" width="100%" height={80} sx={{ mt: 2, borderRadius: 1 }} />
                <Skeleton variant="text" width="40%" sx={{ mt: 2 }} />
                <Skeleton variant="rectangular" width={120} height={36} sx={{ mt: 2, borderRadius: 2 }} />
            </CardContent>
        </Card>
    );

    return (
        <>
            <Toolbar />

            <Box
                sx={{
                    ...sectionSx,
                    position: "relative",
                    color: "white",
                    textAlign: "center",
                    overflow: "hidden",
                    height: "100vh",     // секция на всю высоту экрана
                }}
            >
                {/* Видео: десктоп */}
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,           // top:0 right:0 bottom:0 left:0
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

                {/* Видео: мобилка */}
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

                {/* Контент поверх видео */}
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 1,
                        display: "grid",
                        placeItems: "center",     // идеальное центрирование
                        px: 2,                    // боковые поля для мобайла
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

                                    // textShadow: "0 0 5px rgba(0,229,255,.7), 0 0 24px rgba(0,229,255,.35)",
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
                            // textShadow: "0 0 8px rgba(254, 221, 44,.35)",
                            mb: 4,
                        }}
                    >
                        Последние события
                    </Typography>

                    {loading ? (
                        <Stack spacing={3}>
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <Box key={idx}>{renderSkeletonCard()}</Box>
                            ))}
                        </Stack>
                    ) : events.length === 0 ? (
                        <Typography>Нет доступных событий</Typography>
                    ) : (
                        <>
                            <Grid container spacing={3} justifyContent="center"
                                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                            >
                                {events.slice(0, 4).map((event) => (
                                    <Grid item
                                          xs={12}
                                          sm={6}
                                          md={4}
                                          lg={3}
                                          key={event.id}
                                          sx={{ display: 'flex' }}>
                                        <Card
                                            onClick={() => navigate(`/event/${event.id}`)}
                                            sx={{
                                                width: "100%",
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
                                                flexGrow: 1,
                                            }}
                                        >
                                            <CardContent sx={{width:'100%'}}>
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
                                                    <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
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
                            <Stack
                                spacing={3}
                                sx={{ display: { xs: 'flex', sm: 'none' } }} // <-- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ
                            >
                                {events.slice(0, 4).map((event) => (
                                    <Card
                                        onClick={() => navigate(`/event/${event.id}`)}
                                        sx={{
                                            width: "100%",
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
                                            flexGrow: 1,
                                        }}
                                    >
                                        <CardContent sx={{width:'100%'}}>
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
                                                <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
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

                            ))}
                        </Stack>
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

            {/* Какие мероприятия мы поддерживаем */}
            <Box
                sx={{
                    ...sectionSx,
                    bgcolor: "background.paper",
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
                            width: { xs: "35%", sm: "240px" }, // меньше на мобилке
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
                        {[
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
                        ].map((event, idx) => (
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
                                    {/* Логотип */}
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
                                            //alt={event.title}
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
