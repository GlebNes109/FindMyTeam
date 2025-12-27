import React from 'react';
import {
    Box,
    Button
} from "@mui/material";

function TeamActions({ isTeamLead, inTeam, onDeleteTeam, onLeaveTeam }) {
    return (
        <Box mt={5} display="flex" gap={2}>
            {isTeamLead && (
                <Button color="error" variant="contained" onClick={onDeleteTeam}>
                    Удалить команду
                </Button>
            )}
            {inTeam && (
                <Button variant="outlined" color="warning" onClick={onLeaveTeam}>
                    Выйти из команды
                </Button>
            )}
        </Box>
    );
}

export default TeamActions;

