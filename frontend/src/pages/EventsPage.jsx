import React, { useEffect, useState } from "react";
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Toolbar,
    Box,
    Divider,
    Stack,
    Chip,
    Skeleton,
    Checkbox,
    FormControlLabel,
    Paper
} from "@mui/material";
import {apiFetch} from "../apiClient.js";
import {useNavigate} from "react-router-dom";
import {grey} from "@mui/material/colors";

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [participations, setParticipations] = useState([]);
    const [showActive, setShowActive] = useState(true);
    const [showPast, setShowPast] = useState(false);
    const [showParticipating, setShowParticipating] = useState(true);
    const [showNotParticipating, setShowNotParticipating] = useState(true);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const eventsPromises = [];
                
                if (showActive) {
                    eventsPromises.push(
                        apiFetch("/events?is_active=true").then(res => res.json())
                    );
                }
                
                if (showPast) {
                    eventsPromises.push(
                        apiFetch("/events?is_active=false").then(res => res.json())
                    );
                }

                let eventsData = [];
                if (eventsPromises.length > 0) {
                    const results = await Promise.all(eventsPromises);
                    eventsData = results.flat();
                }

                let partsData = [];
                try {
                    const partsRes = await apiFetch("/participants", { suppressAuthFailure: true });
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
                setLoading(false);
            }
        }
        fetchData();
    }, [showActive, showPast]);

    const participationMap = participations.reduce((acc, p) => {
        acc[p.event_id] = p;
        return acc;
    }, {});

    const filteredEvents = events.filter((event) => {
        const isParticipating = !!participationMap[event.id];
        
        if (showParticipating && showNotParticipating) {

        } else if (showParticipating && !showNotParticipating) {
            if (!isParticipating) return false;
        } else if (!showParticipating && showNotParticipating) {
            if (isParticipating) return false;
        } else {
            return false;
        }
        
        return true;
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
                alignItems: "flex-start",
            }}>
                <Box sx={{ flexShrink: 0, width: "100%" }}>
                    <Typography variant="h5" gutterBottom>
                        Все события
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Paper
                        elevation={2}
                        sx={{
                            p: 2,
                            mb: 3,
                        }}
                    >
                        <Grid container spacing={4}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold", mb: 1 }}>
                                    Статус мероприятия
                                </Typography>
                                <Stack spacing={1}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={showActive}
                                                onChange={(e) => setShowActive(e.target.checked)}
                                            />
                                        }
                                        label="Показывать активные"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={showPast}
                                                onChange={(e) => setShowPast(e.target.checked)}
                                            />
                                        }
                                        label="Показывать прошедшие"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold", mb: 1 }}>
                                    Участие
                                </Typography>
                                <Stack spacing={1}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={showParticipating}
                                                onChange={(e) => setShowParticipating(e.target.checked)}
                                            />
                                        }
                                        label="Мероприятия в которых я участвую"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={showNotParticipating}
                                                onChange={(e) => setShowNotParticipating(e.target.checked)}
                                            />
                                        }
                                        label="Мероприятия в которых я не участвую"
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                <Stack spacing={3} sx={{ width: "100%", minHeight: "60vh", }}>
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
                                                    {participation.event_role === "TEAMLEAD"
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