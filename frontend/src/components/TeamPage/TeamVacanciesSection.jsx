import React from 'react';
import {
    Box,
    Button,
    Stack,
    Typography,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from "@mui/material";
import TeamVacancy from "../TeamVacancy.jsx";

function TeamVacanciesSection({ 
    vacancies, 
    isTeamLead, 
    participant, 
    inTeam, 
    showVacancyForm, 
    setShowVacancyForm,
    newVacancy,
    setNewVacancy,
    tracks,
    onSaveVacancy,
    onRemoveVacancy
}) {
    return (
        <>
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
                                onClick={onSaveVacancy}
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
                            onRemove={(info) => onRemoveVacancy({ open: true, ...info })}
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
        </>
    );
}

export default TeamVacanciesSection;

