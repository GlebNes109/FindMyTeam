import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Toolbar, Typography} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

function RegistrationEventPage() {
    const [event_role, setEventRole] = useState("PARTICIPANT");
    const [event_track, setEventTrack] = useState("");
    const [resume, setResume] = useState("");
    const [team_name, setTeamName] = useState("");
    const [team_description, setTeamDescription] = useState("");
    const [vacancies, setVacancies] = useState([]);
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const { event_id } = useParams();
    useEffect(() => {
        fetch(`http://localhost:8080/events/${event_id}`)
            .then(res => res.json())
            .then(data => {
                setEvent(data);
                /*if (data.event_tracks?.length > 0 && !event_track) {
                    setEventTrack(data.event_tracks[0].id);
                }*/
            })
            .catch(err => console.error("Ошибка загрузки событий:", err));
    }, [event_track, event_id]);

    const addVacancy = () => {
        setVacancies([...vacancies, { event_track_id: "", description: "" }]);
    };

    const removeVacancy = (indexToRemove) => {
        setVacancies(vacancies.filter((_, index) => index !== indexToRemove));
    }

    const updateVacancy = (index, field, value) => {
        const updated = [...vacancies];
        updated[index][field] = value;
        setVacancies(updated);
    };

    function RegisterNewParticipant() {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        const requestBody = {
            event_id: event.id,
            event_role: event_role,
            track_id: event_track,
            resume: resume,
        };

        if (event_role === "TEAMLEAD") {
            requestBody.team = {
                name: team_name,
                description: team_description,
                vacancies: vacancies,
            };
        }

        fetch("http://localhost:8080/participants", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        navigate("/signin");
                        throw new Error("Ошибка регистрации");
                    } else if (response.status === 400) {
                        throw new Error("Ошибка регистрации");
                    }
                }
                return response.json();
            })
            .then((data) => {
                console.log("Успешно зарегистрирован:", data);
                navigate(`/event/${event.id}`);
            });
    }

    return (
        // на маленьких экранах 1 px, на средних - 15
        <>
            <Toolbar />
        <Box sx={{ px: { xs: 1, md: 15 }, py: 5 }}>
            <Typography variant="h5" mb={4}>
                Регистрация на мероприятие
            </Typography>

            <Box mb={3}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={10}
                    label="Расскажите о себе"
                    placeholder="Небольшое резюме, стек технологий и т.д."
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    inputProps={{ maxLength: 10000 }}
                    variant="outlined"
                />
            </Box>

            {event_role === "TEAMLEAD" && (
                <>
                    <Box mb={3}>
                        <TextField
                            fullWidth
                            label="Название команды"
                            placeholder="Название команды"
                            value={team_name}
                            onChange={(e) => setTeamName(e.target.value)}
                            variant="outlined"
                        />
                    </Box>

                    <Box mb={3}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={10}
                            label="Описание команды"
                            placeholder="Описание команды"
                            inputProps={{ maxLength: 10000 }}
                            value={team_description}
                            onChange={(e) => setTeamDescription(e.target.value)}
                            variant="outlined"
                        />
                    </Box>

                    <Box mb={3}>
                        <Button variant="outlined" onClick={addVacancy}>
                            + Добавить вакансию
                        </Button>
                    </Box>

                    {vacancies.map((vacancy, index) => (
                        <Box key={index} mb={3} p={2} borderRadius={2} sx={{ bgcolor: "grey.900", border: "1px solid", borderColor: "grey.800" }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Трек для вакансии</InputLabel>
                                <Select
                                    value={vacancy.event_track_id}
                                    onChange={(e) => updateVacancy(index, "event_track_id", e.target.value)}
                                    label="Трек для вакансии"
                                    variant="outlined"
                                     >
                                    <MenuItem value="">Выберите трек</MenuItem>
                                    {event?.event_tracks?.map((track) => (
                                        <MenuItem key={track.id} value={track.id}>
                                            {track.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                multiline
                                maxRows={10}
                                label="Описание вакансии"
                                placeholder="Описание вакансии"
                                value={vacancy.description}
                                onChange={(e) => updateVacancy(index, "description", e.target.value)}
                                variant="outlined"
                            />
                            <DeleteIcon
                                onClick={() => removeVacancy(index)}
                                sx={{ cursor: "pointer", color: "error.main", my: 2, mx: 2 }}
                            />
                        </Box>
                    ))}
                </>
            )}

            <Box mb={3}>
                <FormControl fullWidth>
                    <InputLabel>Роль</InputLabel>
                    <Select
                        value={event_role}
                        onChange={(e) => setEventRole(e.target.value)}
                        label="Роль"
                    >
                        <MenuItem value="PARTICIPANT">Участник</MenuItem>
                        <MenuItem value="TEAMLEAD">Капитан команды</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Box mb={4}>
                <FormControl fullWidth>
                    <InputLabel>Трек</InputLabel>
                    <Select
                        value={event_track}
                        onChange={(e) => setEventTrack(e.target.value)}
                        label="Трек"
                    >
                        <MenuItem value="">Выберите трек</MenuItem>
                        {event?.event_tracks?.map((track) => (
                            <MenuItem key={track.id} value={track.id}>
                                {track.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Button variant="contained" onClick={RegisterNewParticipant}>
                Подтвердить
            </Button>
        </Box>
        </>
    );
}

export default RegistrationEventPage;
