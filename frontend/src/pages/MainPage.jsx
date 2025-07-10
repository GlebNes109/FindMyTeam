import styles from "../styles/MainPage.module.css";
import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

import {
    ButtonGroup,
    Typography,
    Button,
    Container,
    Box,
    Grid,
    Card,
    CardContent,
    Chip,
    Stack, Toolbar,
    Link
} from "@mui/material";
import EventIcon from '@mui/icons-material/Event';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {grey} from "@mui/material/colors";
function MainPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
        fetch("http://localhost:8080/events")
            .then((res) => res.json())
            .then((data) => setEvents(data || []))
            .catch((err) => console.error("Ошибка загрузки событий:", err));
    }, [navigate]);

    return (
        <>
            <Toolbar/>
                <Box sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    textAlign: 'center',
                    backgroundImage: `url('/images/vite.svg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    color: 'white',
                    px: 2,
                    py: 8
                }}>
                    <Typography variant="h3" gutterBottom>Добро пожаловать в FindMyTeam</Typography>
                    <Typography variant="h6" mb={2}>
                        Начните собирать свою команду уже сегодня!
                    </Typography>
                    {!isLoggedIn ? (
                        <ButtonGroup variant="contained" aria-label="Basic button group">
                            <Button variant="outlined" onClick={() => navigate("/signin")}>Войти</Button>
                            <Button variant="contained" onClick={() => navigate("/signup")}>Зарегистрироваться</Button>
                        </ButtonGroup>
                    ) : (
                        <ButtonGroup variant="contained" aria-label="Authenticated user buttons">
                            <Button variant="contained" onClick={() => navigate("/home")}>Мой профиль</Button>
                            <Button variant="contained" onClick={() => navigate("/events")}>Доступные мероприятия</Button>
                        </ButtonGroup>
                    )}
                </Box>
            <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6, mt: 5, minHeight: '100vh' }}>
                <Container>

                    {events.length === 0 ? (
                        <Typography textAlign="center">Нет доступных событий</Typography>
                    ) : (
                        <>
                            <Grid container spacing={3} justifyContent="center">
                                {events.slice(0, 4).map((event) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
                                        <Card
                                            onClick={() => navigate(`/event/${event.id}`)}
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                bgcolor: 'background.paper',
                                                color: 'text.primary',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 6,
                                                },
                                                  cursor: 'pointer'
                                            }}
                                        >
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    {event.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {event.description}
                                                </Typography>
                                                <Typography mt={1}>
                                                    <b>Дата начала:</b> {event.start_date}
                                                </Typography>
                                                <Typography>
                                                    <b>Дата окончания:</b> {event.end_date}
                                                </Typography>
                                                <Box mt={1}>
                                                    <Typography variant="subtitle2">Треки:</Typography>
                                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                                        {event.event_tracks.map((track) => (
                                                            <Chip key={track.id} label={track.name} variant="outlined" />
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            </CardContent>
                                            <Box p={2}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={() => navigate(`/event/${event.id}/register`)}
                                                >
                                                    Я участвую
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            <Box mt={5} display="flex" justifyContent="center">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate('/events')}
                                >
                                    Смотреть все события
                                    <ArrowForwardIosIcon/>
                                </Button>
                            </Box>
                        </>
                    )}
                </Container>
            </Box>

            {/* блок как это работает */}
                <Box sx={{ minHeight: '100vh', py: 10, bgcolor: grey[800] }}>
                    <Container>
                        <Typography variant="h4" align="center" gutterBottom>Как это работает?</Typography>
                        <Grid container spacing={4} justifyContent="center" mt={3}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Stack alignItems="center" spacing={2}>
                                    <EventIcon fontSize="large" color="primary" />
                                    <Typography variant="h6">1. Выбери событие</Typography>
                                    <Typography align="center">Просматривай список мероприятий и выбирай интересные тебе</Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Stack alignItems="center" spacing={2}>
                                    <GroupAddIcon fontSize="large" color="primary" />
                                    <Typography variant="h6">2. Найди команду</Typography>
                                    <Typography align="center">Откликайся на вакансии или создай свою команду</Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Stack alignItems="center" spacing={2}>
                                    <EmojiEventsIcon fontSize="large" color="primary" />
                                    <Typography variant="h6">3. Участвуй и побеждай</Typography>
                                    <Typography align="center">Работайте вместе и побеждайте на соревнованиях</Typography>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* FAQ */}
                <Box sx={{ minHeight: '100vh', py: 10 }}>
                    <Container>
                        <Typography variant="h4" align="center" gutterBottom>Часто задаваемые вопросы</Typography>
                        <Grid container spacing={4} mt={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    <HelpOutlineIcon sx={{ mr: 1 }} />Как создать команду?
                                </Typography>
                                <Typography color="text.secondary">
                                    На странице регистрации на мероприятие выберите роль "Тимлид". После этого вы сможете создать команду, в которой вы будете тимлидом. Вакансии можно создать на этапе создания команды, или позже. Кстати, описание к вакансии можно писать в markdown формате :)
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    <HelpOutlineIcon sx={{ mr: 1 }} />Как откликнуться на вакансию?
                                </Typography>
                                <Typography color="text.secondary">
                                    В таблице команд выберите нужную и перейдите на страницу с деталями о команде. Там вы можете откликнутся на вакансию. На вакансию нельзя откликнуться, если вы уже состоите в другой команде или треки вакансии и ваш не совпадают.
                                </Typography>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* Footer */}
                <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4, mt: 5 }}>
                    <Container>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                            <Typography variant="body2">© 2025 FindMyTeam</Typography>
                            <Stack direction="row" spacing={2}>
                                <Link href="#" underline="hover" color="inherit">О нас</Link>
                                <Link href="#" underline="hover" color="inherit">Контакты</Link>
                                <Link href="#" underline="hover" color="inherit">Политика конфиденциальности</Link>
                            </Stack>
                        </Stack>
                    </Container>
                </Box>
        </>
    );
}

export default MainPage;
