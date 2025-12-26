import React from 'react';
import {
    Box,
    Stack,
    Typography,
    Divider,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Pagination
} from "@mui/material";
import ParticipantsList from "../ParticipantsList.jsx";

function ParticipantsTab({ participants, isTeamlead, myVacancies, onInviteClick, pageParticipants, setPageParticipants, perPageParticipants, setPerPageParticipants, totalPagesParticipants }) {
    return (
        <Stack spacing={3}>
            <Typography variant="h6">Участники</Typography>
            <Divider sx={{ mb: 3 }} />
            {participants.length === 0 ? (
                <Typography color="text.secondary">Нет доступных участников</Typography>
            ) : (
                <Box display="flex" flexDirection="column" gap={3}>
                    {isTeamlead && myVacancies.length === 0 && (
                        <Typography color="error" variant="body2">
                            Вы не можете приглашать участников — в вашей команде нет вакансий
                        </Typography>
                    )}
                    {participants.map((p, i) => {
                        const action = isTeamlead ? (
                            myVacancies.length > 0 ? (
                                <Button
                                    variant="contained"
                                    sx={{ maxWidth: 200 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onInviteClick(p);
                                    }}
                                    fullWidth
                                >
                                    Пригласить
                                </Button>
                            ) : (
                                <Button variant="outlined" size="small" disabled fullWidth>
                                    Вы не можете приглашать участников - в вашей команде нет вакансий
                                </Button>
                            )
                        ) : null;

                        return (
                            <ParticipantsList key={i} participant={p} action={action} />
                        );
                    })}
                    <Box display="flex" flexDirection="column" justifyContent="space-between" alignItems="center" mt={2}>
                        <Stack spacing={2} alignItems="center" mb={2}>
                            <Pagination
                                count={totalPagesParticipants}
                                page={pageParticipants}
                                onChange={(e, value) => setPageParticipants(value)}
                                color="primary"
                                size="medium"
                                shape="rounded"
                            />
                        </Stack>

                        <Box display="flex" alignItems="center" gap={1}>
                            <FormControl size="small" sx={{ minWidth: 170 }}>
                                <InputLabel id="per-page-label">Элементов на странице</InputLabel>
                                <Select
                                    labelId="per-page-label"
                                    value={perPageParticipants}
                                    label="Элементов на странице"
                                    onChange={(e) => {
                                        setPerPageParticipants(Number(e.target.value));
                                        setPageParticipants(1);
                                    }}
                                >
                                    {[5, 10, 20, 30].map((n) => (
                                        <MenuItem key={n} value={n}>{n}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </Box>
            )}
        </Stack>
    );
}

export default ParticipantsTab;

