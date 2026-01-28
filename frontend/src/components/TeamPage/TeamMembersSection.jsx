import React from 'react';
import {
    Box,
    Button,
    Divider,
    Stack,
    Typography
} from "@mui/material";
import ParticipantsList from "../ParticipantsList.jsx";

function TeamMembersSection({ team, participant, isTeamLead, onKickMember }) {
    return (
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
                                onKickMember(member.id);
                            }}
                        >
                            Выгнать
                        </Button>
                    ) : null}
                />
            ))}
        </Box>
    );
}

export default TeamMembersSection;

