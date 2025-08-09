import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Stack,
    Button,
    IconButton,
    Divider,
    TextField,
    MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ReactMarkdown from "react-markdown";
import { apiFetch } from "../apiClient";

const ParticipantCard = ({ participantData, setParticipantData, myTeam, navigate, eventTracks }) => {
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({
        track_id: participantData?.track?.id || "",
        resume: participantData?.resume || ""
    });

    const handleSave = async () => {
        try {
            const res = await apiFetch(`/participants`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    id: participantData.id,
                    track_id: editData.track_id || null,
                    resume: editData.resume || null
                })
            });

            if (res.ok) {
                // Обновляем локальное состояние без перезагрузки
                setParticipantData(prev => ({
                    ...prev,
                    track: eventTracks.find(t => t.id === editData.track_id) || prev.track,
                    resume: editData.resume
                }));
                setEditMode(false);
            } else {
                console.error("Ошибка PATCH:", await res.text());
            }
        } catch (err) {
            console.error("Ошибка обновления участника:", err);
        }
    };

    if (!participantData) {
        return (
            <Card sx={{ mt: 4, bgcolor: "background.paper", borderRadius: 3 }} variant="outlined">
                <CardContent>
                    <Typography color="text.secondary">
                        Вы не зарегистрированы на это мероприятие. Если вы регистрировались, зайдите из личного кабинета.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ mt: 4, bgcolor: "background.paper", borderRadius: 3 }} variant="outlined">
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Вы участвуете в этом мероприятии
                    </Typography>
                    {myTeam && (
                        <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={() => navigate(`/team/${myTeam.id}`)}
                        >
                            Моя команда
                        </Button>
                    )}
                    <IconButton onClick={() => editMode ? handleSave() : setEditMode(true)}>
                        {editMode ? <SaveIcon /> : <EditIcon />}
                    </IconButton>
                </Stack>

                <Typography><strong>Роль:</strong> {participantData.event_role === "TEAMLEAD" ? "Тимлид" : "Участник"}</Typography>

                <Divider sx={{ my: 2 }} />

                {editMode ? (
                    <>
                        <TextField
                            select
                            label="Трек"
                            fullWidth
                            value={editData.track_id}
                            onChange={(e) => setEditData(prev => ({ ...prev, track_id: e.target.value }))}
                            sx={{ mb: 2 }}
                        >
                            {eventTracks.map(track => (
                                <MenuItem key={track.id} value={track.id}>
                                    {track.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Резюме"
                            multiline
                            fullWidth
                            maxRows={10}
                            value={editData.resume}
                            onChange={(e) => setEditData(prev => ({ ...prev, resume: e.target.value }))}
                        />
                    </>
                ) : (
                    <>
                        <Typography><strong>Трек:</strong> {participantData.track?.name}</Typography>
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>
                            <strong>Резюме:</strong>
                            <ReactMarkdown>{participantData.resume || "—"}</ReactMarkdown>
                        </Typography>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default ParticipantCard;

