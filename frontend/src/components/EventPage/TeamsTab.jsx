import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { useNavigate } from 'react-router-dom';

function TeamsTab({ eventData, myTeam }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Card variant="outlined" sx={{ mb: 4, bgcolor: "background.paper", borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 0, sm: 2 } }}>
                <TableContainer sx={{ overflowX: "auto" }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold", color: "text.primary", width: "60px" }}>№</TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>Команда</TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>Участники</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {eventData.event_teams?.map((team, index) => (
                                <TableRow
                                    key={team.id}
                                    hover
                                    sx={{
                                        cursor: "pointer",
                                        transition: "background-color 0.2s ease, transform 0.1s ease",
                                        "&:hover": {
                                            backgroundColor: theme.palette.action.hover,
                                            transform: "scaleY(1.01)",
                                        },
                                        "&:active": {
                                            backgroundColor: theme.palette.action.selected,
                                            transform: "scaleY(1.01)"
                                        },
                                        borderBottom: index < eventData.event_teams.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
                                        backgroundColor: myTeam?.id === team.id ? theme.palette.action.selected : "inherit",
                                        borderLeft: myTeam?.id === team.id ? `4px solid ${theme.palette.primary.main}` : "none",
                                    }}
                                    onClick={() => navigate(`/team/${team.id}`)}
                                >
                                    <TableCell sx={{ color: "text.primary" }}>{index + 1}</TableCell>
                                    <TableCell sx={{ fontWeight: "medium", color: "text.primary" }}>{team.name}</TableCell>
                                    <TableCell sx={{ color: "text.primary" }}>
                                        <Stack
                                            direction="row"
                                            flexWrap="wrap"
                                            sx={{
                                                gap: "4px",
                                                rowGap: 1,
                                            }}
                                        >
                                            {team.members.map((member, i) => (
                                                <Chip
                                                    key={i}
                                                    label={`${member.login} [${member.track.name}]`}
                                                    color={member.event_role === "PARTICIPANT" ? "primary" : "secondary"}
                                                    size="small"
                                                />
                                            ))}
                                            {team.vacancies.map((vacancy, i) => (
                                                <Chip
                                                    key={i}
                                                    label={`Вакансия [${vacancy.track.name}]`}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{ color: "text.primary", borderColor: theme.palette.divider }}
                                                />
                                            ))}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
}

export default TeamsTab;

