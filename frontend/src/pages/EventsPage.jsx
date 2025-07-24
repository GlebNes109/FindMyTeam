import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Box, Button, Card, CardContent, Chip, Container, Divider, Stack, Toolbar, Typography} from "@mui/material";
import {apiFetch} from "../apiClient.js";


function EventsPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]); // Хранение списка событий
    /*const [isModalOpen, setIsModalOpen] = useState(false);
    const [event_track, setEventTrack] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("");
    const [event_role, setEventRole] = useState("");*/


    useEffect(() => {
        apiFetch('/events', {
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => setEvents(data || [])) // список событий задется данными из api
            .catch(err => console.error('Ошибка загрузки событий:', err));
    }, [navigate]);

    return (
        <>
            <Toolbar />
        <Container sx={{ mt: 4 }}>
            {events.length === 0 ? (
                <Typography>Нет доступных событий</Typography>
            ) : (
                <Box>
                    <Typography variant="h5" gutterBottom>Все события</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Stack spacing={3}>
                        {events.map(event => (
                            <Card
                                key={event.id}
                                sx={{ cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6,
                                    },}}
                                onClick={() => navigate(`/event/${event.id}`)}
                            >
                                <CardContent>
                                    <Typography variant="h6">{event.name}</Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {event.description}
                                    </Typography>

                                    <Typography variant="body2" mt={1}>
                                        <strong>Дата начала:</strong> {event.start_date}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Дата окончания:</strong> {event.end_date}
                                    </Typography>

                                    <Box mt={2}>
                                        <Typography variant="subtitle2" gutterBottom>Треки:</Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {event.event_tracks.map(track => (
                                                <Chip key={track.id} label={track.name} variant="outlined" />
                                            ))}
                                        </Stack>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        sx={{ mt: 3 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/event/${event.id}/register`);
                                        }}
                                    >
                                        Я участвую
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            )}
        </Container>
            </>
    );
}

export default EventsPage;
