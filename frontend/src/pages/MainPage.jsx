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
    Stack
} from "@mui/material";

function MainPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/events")
            .then((res) => res.json())
            .then((data) => setEvents(data || []))
            .catch((err) => console.error("Ошибка загрузки событий:", err));
    }, [navigate]);

    return (
            <Container sx={{ py: 5 }}>
                <Box textAlign="center" mb={4} className={styles['text-content']}>
                    <Typography variant="h3" gutterBottom>Добро пожаловать в FindMyTeam</Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        Здесь можно найти команду для олимпиад и проектов.
                    </Typography>
                    <ButtonGroup variant="contained" aria-label="Basic button group">
                        <Button variant="outlined" onClick={() => navigate("/signin")}>Войти</Button>
                        <Button variant="contained" onClick={() => navigate("/signup")}>Зарегистрироваться</Button>
                    </ButtonGroup>
                </Box>

                {events.length === 0 ? (
                    <Typography>Нет доступных событий</Typography>
                ) : (
                    <Box>
                        <Typography variant="h5" gutterBottom>Все события</Typography>
                        <Grid container spacing={3}>
                            {events.map((event) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6">{event.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">{event.description}</Typography>
                                            <Typography mt={1}><b>Дата начала:</b> {event.start_date}</Typography>
                                            <Typography><b>Дата окончания:</b> {event.end_date}</Typography>
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
                    </Box>
                )}
            </Container>
    );
}

export default MainPage;
