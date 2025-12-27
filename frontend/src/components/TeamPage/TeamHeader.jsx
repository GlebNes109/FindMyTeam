import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Divider,
    IconButton,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ReactMarkdown from "react-markdown";

function TeamHeader({ team, editMode, editTeam, setEditTeam, onSave, onEdit, isTeamLead }) {
    return (
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
                        <IconButton onClick={onSave}><SaveIcon /></IconButton>
                    ) : (
                        <IconButton onClick={onEdit}><EditIcon /></IconButton>
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
    );
}

export default TeamHeader;

