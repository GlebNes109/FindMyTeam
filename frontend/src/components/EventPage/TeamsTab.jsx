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
        <Card variant="outlined" sx={{ mb: 4, bgcolor: "#303030", borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 0, sm: 2 } }}>
                <TableContainer sx={{ overflowX: "auto" }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold", color: "white", width: "60px" }}>№</TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "white" }}>Команда</TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "white" }}>Участники</TableCell>
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
                                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                                            transform: "scaleY(1.01)",
                                        },
                                        "&:active": {
                                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                                            transform: "scaleY(1.01)"
                                        },
                                        borderBottom: index < eventData.event_teams.length - 1 ? "1px solid #424242" : "none",
                                        backgroundColor: myTeam?.id === team.id ? "rgba(254, 221, 44, 0.1)" : "inherit",
                                        borderLeft: myTeam?.id === team.id ? "4px solid #fedd2c" : "none",
                                    }}
                                    onClick={() => navigate(`/team/${team.id}`)}
                                >
                                    <TableCell sx={{ color: "white" }}>{index + 1}</TableCell>
                                    <TableCell sx={{ fontWeight: "medium", color: "white" }}>{team.name}</TableCell>
                                    <TableCell sx={{ color: "white" }}>
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
                                                    sx={{ color: "black" }}
                                                />
                                            ))}
                                            {team.vacancies.map((vacancy, i) => (
                                                <Chip
                                                    key={i}
                                                    label={`Вакансия [${vacancy.track.name}]`}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{ color: "white", borderColor: "rgba(255, 255, 255, 0.4)" }}
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

