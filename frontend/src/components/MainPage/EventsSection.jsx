import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    Skeleton,
    Stack,
    Typography
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";
import { grey } from "@mui/material/colors";

function EventsSection({ events, loading, participationMap }) {
    const navigate = useNavigate();
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

    const EventCard = ({ event, isMobile = false }) => {
        const participation = participationMap[event.id];
        const isParticipating = !!participation;

        return (
            <Card
                onClick={() =>
                    navigate(`/event/${event.id}`, {
                        state: participation ? { participant_id: participation.id } : undefined
                    })
                }
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

                    <Box my={1.5}>
                        <Typography variant="subtitle2">Треки:</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                            {(event.event_tracks || []).map((track) => (
                                <Chip
                                    sx={{
                                        backgroundColor: 'secondary.main',
                                        border: 0,
                                        mb: 0.5,
                                        color: "black"
                                    }}
                                    key={track.id}
                                    label={track.name}
                                    size="small"
                                    variant="outlined"
                                />
                            ))}
                        </Stack>
                    </Box>
                    {isParticipating ? (
                        <Typography
                            sx={{
                                p: 1,
                                bgcolor: grey[800],
                                borderRadius: 1,
                                textAlign: "center",
                                color: "white",
                                width: "100%"
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
                            fullWidth
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
    };

    return (
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
                                    <EventCard event={event} />
                                </Grid>
                            ))}
                        </Grid>
                        <Stack
                            spacing={3}
                            sx={{ display: { xs: 'flex', sm: 'none' } }}
                        >
                            {events.slice(0, 4).map((event) => (
                                <EventCard key={event.id} event={event} isMobile={true} />
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
    );
}

export default EventsSection;

