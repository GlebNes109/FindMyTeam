import React, { useEffect, useState } from "react";
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    ToggleButton,
    ToggleButtonGroup, Toolbar, Box, Divider, Stack, Chip, Skeleton
} from "@mui/material";
import {apiFetch} from "../apiClient.js";
import {useNavigate} from "react-router-dom";
import {grey} from "@mui/material/colors";

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [participations, setParticipations] = useState([]);
    const [filter, setFilter] = useState("all"); // all | mine | not_mine
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const eventsRes = await apiFetch("/events");
                const eventsData = await eventsRes.json();

                let partsData = [];
                try {
                    const partsRes = await apiFetch("/participants");
                    partsData = await partsRes.json();
                } catch (err) {
                    if (err.code === "UNABLE_TO_UPDATE_TOKEN" || err.status === 401) {
                        partsData = [];
                    } else {
                        console.error("Ошибка при загрузке участников:", err);
                    }
                }

                setEvents(eventsData);
                setParticipations(partsData);
            } catch (err) {
                console.error("Ошибка загрузки:", err);
            } finally {
                setLoading(false); // окончание загрузки
            }
        }
        fetchData();
    }, []);

    const handleFilterChange = (_, newFilter) => {
        if (newFilter !== null) setFilter(newFilter);
    };

    // Словарь для быстрого поиска участий
    const participationMap = participations.reduce((acc, p) => {
        acc[p.event_id] = p;
        return acc;
    }, {});

    const filteredEvents = events.filter((event) => {
        const isParticipating = !!participationMap[event.id];
        if (filter === "mine") return isParticipating;
        if (filter === "not_mine") return !isParticipating;
        return true; // all
    });

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
            <Toolbar/>
            <Container sx={{
                mt: 4,
                display: "flex",
                flexDirection: "column",
                minHeight: "80vh",
            }}>
                <Box
                >
                        <Typography variant="h5" gutterBottom>
                            Все события
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <ToggleButtonGroup
                            value={filter}
                            exclusive
                            onChange={handleFilterChange}
                            sx={{ mb: 3 }}
                        >
                            <ToggleButton value="all">Все</ToggleButton>
                            <ToggleButton value="mine">Мои</ToggleButton>
                            <ToggleButton value="not_mine">Остальные</ToggleButton>
                        </ToggleButtonGroup>
                </Box>

                <Stack spacing={3}>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, idx) => (
                                    <Box key={idx}>{renderSkeletonCard()}</Box>
                                ))
                            ) : filteredEvents.length === 0 ? (
                                <Typography>Нет доступных событий</Typography>
                            ) : (
                                filteredEvents.map((event) => {
                                    const participation = participationMap[event.id];
                                    const isParticipating = !!participation;

                                return (
                                    <Card
                                        key={event.id}
                                        sx={{
                                            cursor: "pointer",
                                            transition: "transform 0.2s, box-shadow 0.2s",
                                            "&:hover": {
                                                transform: "translateY(-4px)",
                                                boxShadow: 6,
                                            },
                                        }}
                                        onClick={() =>
                                            navigate(`/event/${event.id}`, {
                                                state: participation ? { participant_id: participation.id } : undefined
                                            })
                                        }

                                    >
                                        <CardContent>
                                            <Typography variant="h6">{event.name}</Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                gutterBottom
                                            >
                                                {event.description}
                                            </Typography>
                                            <Typography variant="body2" mt={1}>
                                                <strong>Дата начала:</strong> {event.start_date}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Дата окончания:</strong> {event.end_date}
                                            </Typography>

                                            <Box mt={2}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Треки:
                                                </Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                                                    {event.event_tracks.map((track) => (
                                                        <Chip
                                                            sx={{
                                                                backgroundColor: 'secondary.main',
                                                                color: "black",
                                                                border: 0,
                                                            }}
                                                            key={track.id}
                                                            label={track.name}
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Stack>
                                            </Box>

                                            {isParticipating ? (
                                                <Typography
                                                    sx={{
                                                        mt: 3,
                                                        p: 1,
                                                        bgcolor: grey[800],
                                                        borderRadius: 1,
                                                        textAlign: "center",
                                                        color: "white",
                                                        width: {
                                                            xs: "100%",
                                                            sm: 270,
                                                        }
                                                    }}
                                                >
                                                    Вы уже участвуете <br />
                                                    {participation.role === "TEAMLEAD"
                                                        ? "Тимлид"
                                                        : "Участник"}
                                                    {" • "}
                                                    {participation.track?.name}
                                                </Typography>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    sx={{ mt: 3,
                                                        width: {
                                                            xs: "100%",
                                                            sm: 270,
                                                        },}}

                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/event/${event.id}/register`);
                                                    }}
                                                >
                                                    Я участвую
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            }))}
                        </Stack>
            </Container>
        </>
    );
}