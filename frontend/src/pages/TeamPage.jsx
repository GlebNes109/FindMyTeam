import React, { useEffect, useState, useRef } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    Container,
    Divider,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Toolbar,
    Typography,
    FormControl,
    Dialog,
    DialogActions,
    DialogTitle, DialogContent, DialogContentText, Chip, CircularProgress
} from "@mui/material";
import { grey } from "@mui/material/colors";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ReactMarkdown from "react-markdown";
import { useParams, useLocation } from "react-router-dom";
import {apiFetch} from "../apiClient.js";
import ParticipantsList from "../components/ParticipantsList.jsx";
import {useToast} from "../components/ToastProvider.jsx";
import TeamVacancy from "../components/TeamVacancy.jsx";


function TeamPage() {
    const location = useLocation();
    const params = useParams();
    const [team, setTeam] = useState(location.state?.team || null);
    const [participant, setParticipant] = useState(null);
    const [event, setEvent] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editTeam, setEditTeam] = useState({ name: "", description: "" });
    const [vacancies, setVacancies] = useState([]);
    const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [tracks, setTracks] = useState([]);
    const [newVacancy, setNewVacancy] = useState({ event_track_id: "", description: "" });
    const [showVacancyForm, setShowVacancyForm] = useState(false);
    const [confirmRemoveVacancy, setConfirmRemoveVacancy] = useState({ open: false, index: null, id: null });
    const [confirmKickMember, setConfirmKickMember] = useState({ open: false, id: null });


    const isTeamLead = participant && team && participant.id === team.teamlead_id;
    const inTeam = team?.members?.some(member => member.id === participant?.id);

    const fetchTeam = async () => {
        const res = await apiFetch(`/teams/${params.teamId}`);
        const data = await res.json();
        setTeam(data);
        setVacancies(data.vacancies || []);
    };

    useEffect(() => {
        if (!team) {
            fetchTeam();
        }
    }, [params.teamId]);


    useEffect(() => {
        const id = localStorage.getItem("CurrentParticipantId");
        if (!id) return;
        apiFetch(`/participants/${id}`)
            .then(res => res.json())
            .then(setParticipant);
    }, []);

    useEffect(() => {
        if (team?.event_id) {
            apiFetch(`/events/${team.event_id}`)
                .then(res => res.json())
                .then(data => {
                    setEvent(data);
                    setTracks(data.event_tracks || []);
                });
        }
    }, [team?.event_id]);

    const removeVacancy = async (index, id) => {
        if (id) {
            await apiFetch(`/teams/vacancy/${id}`, { method: "DELETE" });
        }
        setVacancies(prev => prev.filter((_, i) => i !== index));
    };

    const saveTeamEdit = async () => {
        const res = await apiFetch(`/teams`, {
            method: "PATCH",
            body: JSON.stringify({
                id: team.id,
                name: editTeam.name,
                description: editTeam.description
            })
        });
        if (res.ok) {
            setTeam(prev => ({ ...prev, ...editTeam }));
            setEditMode(false);
        }
    };

    if (!team) {
        return (<Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
            }}
        >
            <CircularProgress />
        </Box>)
    }

    const handleSaveVacancy = async () => {
        console.log("Saving vacancy:", newVacancy);
        const res = await apiFetch(`/teams/${team.id}/vacancy`, {
            method: "POST",
            body: JSON.stringify(newVacancy),
        });
        if (res.ok) {
            // await fetchVacancies();
            await fetchTeam();
            setShowVacancyForm(false);
            setNewVacancy({ event_track_id: "", description: "" });
        } else {
            alert("Ошибка при добавлении вакансии");
        }
    };



    return (
        <>
            <Toolbar />
            <Container maxWidth="md" sx={{ py: 5 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, mb: 5, p: 5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        {editMode ? (
                            <TextField
                                variant="outlined"
                                label="Название команды"
                                fullWidth
                                value={editTeam.name}
                                onChange={(e) => setEditTeam(prev => ({ ...prev, name: e.target.value }))}
                            />
                        ) : (
                            <Typography variant="h4">Команда {team.name}</Typography>
                        )}
                        {isTeamLead && (
                            editMode ? (
                                <IconButton onClick={saveTeamEdit}><SaveIcon /></IconButton>
                            ) : (
                                <IconButton onClick={() => {
                                    setEditTeam({ name: team.name, description: team.description });
                                    setEditMode(true);
                                }}><EditIcon /></IconButton>
                            )
                        )}
                    </Stack>
                    <Divider sx={{ my: 3 }} />
                    {editMode ? (
                        <TextField
                            multiline
                            fullWidth
                            maxRows={10}
                            value={editTeam.description}
                            onChange={(e) => setEditTeam(prev => ({ ...prev, description: e.target.value }))}
                        />
                    ) : (
                        <Typography variant="subtitle1" color="text.secondary">
                            <ReactMarkdown>{team.description}</ReactMarkdown>
                        </Typography>
                    )}
                </Card>

                <Box mb={3}>
                    {isTeamLead && !showVacancyForm && (
                        <Button variant="outlined" onClick={() => setShowVacancyForm(true)}>
                            + Добавить вакансию
                        </Button>
                    )}
                    {isTeamLead && showVacancyForm && (
                        <Box mt={2} mb={4} p={3} border={1} borderRadius={2} borderColor="divider">
                            <Typography variant="h6" mb={2}>Новая вакансия</Typography>
                            <Stack spacing={2}>
                                <FormControl fullWidth>
                                    <InputLabel id="track-select-label">Трек</InputLabel>
                                    <Select
                                        labelId="track-select-label"
                                        value={newVacancy.event_track_id}
                                        label="Трек"
                                        onChange={(e) =>
                                            setNewVacancy(prev => ({ ...prev, event_track_id: e.target.value }))
                                        }
                                    >
                                        {tracks.map(track => (
                                            <MenuItem key={track.id} value={track.id}>
                                                {track.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Описание"
                                    multiline
                                    rows={4}
                                    value={newVacancy.description}
                                    onChange={(e) =>
                                        setNewVacancy(prev => ({ ...prev, description: e.target.value }))
                                    }
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => handleSaveVacancy()
                                    }
                                    disabled={!newVacancy.event_track_id || !newVacancy.description}
                                >
                                    Сохранить вакансию
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Box>

                <Stack spacing={3}>
                    <Typography variant="h6">Вакансии</Typography>
                    <Divider sx={{ mb: 3 }}/>
                    {vacancies.length > 0 ? (
                        vacancies.map((vacancy, index) => (
                            <TeamVacancy
                                key={vacancy.id || index}
                                vacancy={vacancy}
                                index={index}
                                onRemove={(info) => setConfirmRemoveVacancy({ open: true, ...info })}
                                isTeamLead={isTeamLead}
                                participant={participant}
                                inTeam={inTeam}
                            />
                        ))
                    ) : (
                        <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                            В команде сейчас нет вакансий
                        </Typography>
                    )}
                </Stack>

                <Box display="flex" flexDirection="column" gap={3} mt={4}>
                    <Typography variant="h6">Участники</Typography>
                    <Divider sx={{ mb: 3 }}/>
                    {team.members.map((member) => (
                        <ParticipantsList
                            key={member.id}
                            participant={member}
                            action={isTeamLead && participant.id !== member.id ? (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmKickMember({ open: true, id: member.id });
                                    }}
                                >
                                    Выгнать
                                </Button>

                            ) : null}
                        />
                    ))}
                </Box>

                <Box mt={5} display="flex" gap={2}>
                    {isTeamLead && (
                        <Button color="error" variant="contained" onClick={() => setOpenDeleteDialog(true)}>
                            Удалить команду
                        </Button>
                    )}
                    {inTeam && (
                        <Button variant="outlined" color="warning" onClick={() => setOpenLeaveDialog(true)}>
                            Выйти из команды
                        </Button>
                    )}

                </Box>

                <Dialog open={openLeaveDialog} onClose={() => setOpenLeaveDialog(false)}>
                    <DialogTitle>Подтверждение</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Вы действительно хотите выйти из команды?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenLeaveDialog(false)}>Отменить</Button>
                        <Button color="error" onClick={async () => {
                            await apiFetch(`/teams/${team.id}/leave/${participant.id}`, { method: "DELETE" });
                            window.location.href = "/";
                        }}>Выйти</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                    <DialogTitle>Удаление команды</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Это действие нельзя отменить. Вы уверены, что хотите удалить команду?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteDialog(false)}>Отменить</Button>
                        <Button color="error" onClick={async () => {
                            await apiFetch(`/teams/${team.id}`, { method: "DELETE" });
                            window.location.href = "/";
                        }}>Удалить</Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={confirmRemoveVacancy.open}
                    onClose={() => setConfirmRemoveVacancy({ open: false, index: null, id: null })}
                >
                    <DialogTitle>Удалить вакансию?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Это действие нельзя отменить. Удалить эту вакансию?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmRemoveVacancy({ open: false, index: null, id: null })}>
                            Отмена
                        </Button>
                        <Button
                            color="error"
                            onClick={async () => {
                                await removeVacancy(confirmRemoveVacancy.index, confirmRemoveVacancy.id);
                                setConfirmRemoveVacancy({ open: false, index: null, id: null });
                            }}
                        >
                            Удалить
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={confirmKickMember.open}
                    onClose={() => setConfirmKickMember({ open: false, id: null })}
                >
                    <DialogTitle>Исключить участника?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Участник будет удалён из команды. Продолжить?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmKickMember({ open: false, id: null })}>
                            Отмена
                        </Button>
                        <Button
                            color="error"
                            onClick={async () => {
                                await apiFetch(`/teams/${team.id}/members/${confirmKickMember.id}`, {
                                    method: "DELETE"
                                });
                                setTeam(prev => ({
                                    ...prev,
                                    members: prev.members.filter(m => m.id !== confirmKickMember.id)
                                }));
                                setConfirmKickMember({ open: false, id: null });
                            }}
                        >
                            Исключить
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </>
    );
}

export default TeamPage;
