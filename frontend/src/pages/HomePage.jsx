import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Typography,
    Stack,
    Chip,
    Card,
    CardContent,
    Grid,
    Container,
    Badge, useTheme, Divider,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';

function HomePage() {
    const navigate = useNavigate();
    const [data, setData] = useState("");
    const [participants, setParticipants] = useState([]);
    const [EventDetails, setEventDetails] = useState([]); // Состояние для хранения событий
    const [isModalOpen, setIsModalOpen] = useState(false);
    const theme = useTheme();
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate('/signin');
            return;
        }

        fetch('http://localhost:8080/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        navigate('/signin');
                        return Promise.reject("не авторизован");
                    }
                }
                return response.json();
            })
            .then(setData)
            .catch(error => console.error('Ошибка HomePage:', error));

        fetch('http://localhost:8080/participants', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(async participants => {
                setParticipants(participants || []);

                const eventsMap = {};
                await Promise.all(participants.map(async (p) => {
                    try {
                        const res = await fetch(`http://localhost:8080/events/${p.event_id}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });
                        if (res.ok) {
                            const event = await res.json();
                            eventsMap[p.event_id] = event;
                        }
                    } catch (err) {
                        console.error(`Ошибка загрузки события ${p.event_id}:`, err);
                    }
                }));
                setEventDetails(eventsMap);
            })
            .catch(error => console.error('Ошибка загрузки участий:', error));

    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/signin");
    };

    const handleDelete = () => {
        if (window.confirm("Вы уверены, что хотите удалить аккаунт?")) {
            fetch("http://localhost:8080/users", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
                .then(() => {
                    localStorage.removeItem("token");
                    navigate("/signup");
                })
                .catch(error => console.error("Ошибка удаления:", error));
        }
    };

    if (!data) {
        return <p>Загрузка...</p>;
    }


    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box
                sx={{
                    mb: 5,
                    p: 4,
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    boxShadow: 3,
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" }, // столбец на мобильных, строка на десктопах
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    gap: 3,
                    borderLeft: `8px solid ${theme.palette.primary.main}`,
                }}
            >
                {/* Информация о пользователе */}
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                        Здравствуйте, {data?.login || 'Пользователь'}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Email: <strong>{data?.email || 'Не указан'}</strong>
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Telegram: <strong>{data?.tg_nickname || 'Не указан'}</strong>
                    </Typography>
                </Box>

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{
                        flexShrink: 0,
                        width: { xs: '100%', sm: 'auto' }
                    }}
                >
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => setIsModalOpen(true)}
                        sx={{ textTransform: 'none' }}
                    >
                        Редактировать профиль
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDelete}
                        sx={{ textTransform: 'none' }}
                    >
                        Удалить профиль
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        sx={{ textTransform: 'none' }}
                    >
                        Выйти
                    </Button>
                </Stack>
            </Box>

            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Ваши мероприятия
            </Typography>

            {participants.length === 0 ? (
                <Box
                    sx={{
                        p: 4,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 1,
                        textAlign: "center",
                        color: "text.secondary"
                    }}
                >
                    <Typography variant="h6">Вы пока не участвуете ни в одном мероприятии.</Typography>
                    <Typography variant="body1" mt={1}>
                        Вы можете выбрать мероприятия прямо сейчас!
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3 }}
                        onClick={() => navigate('/events')}
                    >
                        Найти мероприятия
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {participants.map((participant) => {
                        const event = EventDetails[participant.event_id];
                        if (!event) {
                            return (
                                <Grid item xs={12} sm={6} md={4} key={participant.id}>
                                    <Card sx={{ height: "100%", display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" color="text.primary">Загрузка данных мероприятия...</Typography>
                                            <Typography variant="body2" color="text.secondary">Пожалуйста, подождите.</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        }

                        // карточки мероприятия
                        return (
                            <Grid item xs={12} sm={6} md={4} key={participant.id}> {/* xs=12 для полной ширины на мобильных, sm=6 для двух колонок на планшетах md=4 для трех колонок на десктопах */}
                                <Card
                                    sx={{
                                        height: "100%",
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: "pointer",
                                        boxShadow: 3,
                                        transition: "transform 0.2s, box-shadow 0.2s",
                                        "&:hover": {
                                            boxShadow: 8,
                                            transform: "translateY(-5px)",
                                        },
                                        bgcolor: "background.paper",
                                    }}
                                    onClick={() =>
                                        navigate(`/event/${participant.event_id}`, {
                                            state: { participant_id: participant.id },
                                        })
                                    }
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            mb={1.5}
                                            flexWrap="wrap"
                                        >
                                            <Chip
                                                label={
                                                    participant.event_role === "PARTICIPANT"
                                                        ? "Участник"
                                                        : "Тимлид"
                                                }
                                                color={
                                                    participant.event_role === "PARTICIPANT"
                                                        ? "secondary"
                                                        : "primary"
                                                }
                                                size="small"
                                            />
                                            {participant.track && (
                                                <Chip
                                                    label={participant.track.name}
                                                    color="info"
                                                    size="small"
                                                />
                                            )}
                                        </Stack>

                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }} noWrap>
                                            {event.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" mb={2} sx={{
                                            display: '-webkit-box',
                                            overflow: 'hidden',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 3,
                                        }}>
                                            {event.description}
                                        </Typography>

                                        <Divider sx={{ my: 1.5 }} /> {/* Разделитель для дат */}

                                        <Typography variant="body2" color="text.primary">
                                            <strong>Начало:</strong> {event.start_date}
                                        </Typography>
                                        <Typography variant="body2" color="text.primary">
                                            <strong>Окончание:</strong> {event.end_date}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Container>
    );
}

export default HomePage;
