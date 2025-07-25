import {useParams, useLocation, useNavigate} from 'react-router-dom';
import { Link as RouterLink } from "react-router-dom";
import React, {useEffect, useMemo, useState} from 'react';
import SelectVacancyModal from "../components/SelectVacancyModel.jsx";
import ReactMarkdown from 'react-markdown';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Link,
    Stack,
    Tab,
    Tabs,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Badge,
    Alert, Toolbar, Container, TableRow, TableCell, TableHead, TableBody, Table, useTheme,
} from "@mui/material";
import {grey} from "@mui/material/colors";
import ParticipantsList from "../components/ParticipantsList.jsx";
import {getAccessToken} from "../tokenStore.js";
import {apiFetch} from "../apiClient.js";

function EventPage() {
    const { eventId } = useParams();
    // const { participant_id } = useParams();
    const [eventData, setEventData] = useState(null);
    const [activeTab, setActiveTab] = useState('teams');
    const location = useLocation();
    const participant_id = location.state?.participant_id;
    const [participantData, setParticipantData] = useState(null);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
    const navigate = useNavigate()
    const [loadedTabs, setLoadedTabs] = useState({
        teams: false,
        participants: false,
        requests: false,
    });
    const theme = useTheme();

    const isTeamlead = useMemo(() => {
        return participantData?.event_role === 'TEAMLEAD';
    }, [participantData]);

    const handleOpenVacancyModal = (participant) => {
        setSelectedParticipant(participant);
        setIsVacancyModalOpen(true);
    };

    const handleSendInvite = (vacancyId) => {
        CreateNewTeamRequest(vacancyId, selectedParticipant.id);
    };

    const loadEventAndTeams = async () => {
        if (!eventId || loadedTabs.teams) return;
        const token = localStorage.getItem("token");

        try {
            const [eventRes, teamsRes] = await Promise.all([
                apiFetch(`/events/${eventId}`, {
                }),
                apiFetch(`/events/${eventId}/teams`, {
                }),
            ]);

            const [event, teams] = await Promise.all([
                eventRes.json(),
                teamsRes.json(),
            ]);

            setEventData(prev => ({ ...event, event_teams: teams, event_participants: prev?.event_participants || [] }));
            setLoadedTabs(prev => ({ ...prev, teams: true }));
        } catch (error) {
            console.error("Ошибка при загрузке event/teams:", error);
        }
    };

    const loadParticipants = async () => {
        if (!eventId || loadedTabs.participants) return;

        try {
            const res = await apiFetch(`/events/${eventId}/participants`, {
            });
            const participants = await res.json();

            setEventData(prev => ({ ...prev, event_participants: participants }));
            setLoadedTabs(prev => ({ ...prev, participants: true }));
        } catch (error) {
            console.error("Ошибка при загрузке участников:", error);
        }
    };


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!participant_id) return;

        const fetchParticipantData = async () => {
            try {
                const res = await apiFetch(`/participants/${participant_id}`, );
                if (!res.ok) throw new Error("Не удалось получить участника");
                const data = await res.json();
                setParticipantData(data);
                localStorage.setItem("CurrentParticipantId", participant_id);
            } catch (error) {
                console.error("Ошибка при получении участника:", error);
            }
        };

        fetchParticipantData();
    }, [participant_id]);

    const loadRequests = async () => {
        if (!participant_id || loadedTabs.responses) return;
        const token = localStorage.getItem("token");
        const incomingUrl = `/team_requests/${isTeamlead ? 'incoming' : 'outgoing'}?participant_id=${participant_id}`;
        const outgoingUrl = `/team_requests/${isTeamlead ? 'outgoing' : 'incoming'}?participant_id=${participant_id}`;

        try {
            const [incomingRes, outgoingRes] = await Promise.all([
                apiFetch(incomingUrl),
                apiFetch(outgoingUrl),
            ]);

            const [incoming, outgoing] = await Promise.all([
                incomingRes.json(),
                outgoingRes.json(),
            ]);

            setIncomingRequests(incoming || []);
            setOutgoingRequests(outgoing || []);
            setLoadedTabs(prev => ({ ...prev, responses: true, invites: true }));
        } catch (error) {
            console.error("Ошибка при загрузке заявок:", error);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        if (tab === 'teams' && !loadedTabs.teams) {
            loadEventAndTeams();
        }

        if (tab === 'participants' && !loadedTabs.participants) {
            loadParticipants();
        }

        if (tab === 'responses' || tab === 'invites' && !loadedTabs.requests) {
            loadRequests();
        }
    };

    /*функция для приглашения новых участников в свою команду - если participant который просматривает страницу является teamlead*/
    function CreateNewTeamRequest(vacancy_id, participant_to_invite_id) {
        const res = apiFetch('/team_requests', {
            method: 'POST',
            body: JSON.stringify({
                vacancy_id: vacancy_id,
                participant_id: participant_to_invite_id
            })
        })
        }
    // console.log(eventData)
    const participantsInTeams = useMemo(() => {
        if (!eventData?.event_teams) return new Set();
        return new Set(
            eventData.event_teams.flatMap(team =>
                team.members?.map(m => m.id) || []
            )
        );
    }, [eventData]);

    const freeParticipants = useMemo(() => {
        if (!eventData?.event_participants) return [];
        return eventData.event_participants.filter(
            p => !participantsInTeams.has(p.id)
        );
    }, [eventData, participantsInTeams]);

    const myTeam = useMemo(() => {
        if (!eventData?.event_teams || !participantData) return null;
        return eventData.event_teams.find(team =>
            team.members?.some(member => member.id === participantData.id)
        ) || null;
        }, [eventData, participantData]);

    const myVacancies = useMemo(() => {
        return myTeam?.vacancies || [];
    }, [myTeam]);

    useEffect(() => {
        handleTabChange(activeTab);
    }, []);

    function AcceptRequest(request_id) {
        const res = apiFetch(`/team_requests/${request_id}/accept`, {
            method: 'PUT',
        })
    }

    function RejectRequest(request_id) {
        const res = apiFetch(`/team_requests/${request_id}/reject`, {
            method: 'PUT',
        })
    }

    if (!eventData) return <div className="container py-5"><p>Загрузка...</p></div>;

    const tabLabels = {
        teams: "Команды",
        participants: isTeamlead ? "Участники (можно пригласить)" : "Участники (просмотр)",
        responses: isTeamlead ? "Отклики в мою команду" : "Мои отклики",
        invites: isTeamlead ? "Мои приглашения" : "Приглашения мне",
    };

    return (
        <>
            <Toolbar />
            <Container>
        <Box p={5}>
            <Typography variant="h4" mb={2}>{eventData.name}</Typography>
            <Typography mb={3}>{eventData.description}</Typography>

            <Tabs value={activeTab} onChange={(e, val) => handleTabChange(val)} variant="scrollable" scrollButtons="auto" sx={{ mb: 4 }}>
                {Object.entries(tabLabels).map(([key, label]) => (
                    <Tab key={key} label={label} value={key} />
                ))}
            </Tabs>

            {activeTab === "teams" && (
                <Card variant="outlined" sx={{ mb: 4, bgcolor: "#303030" , borderRadius: 3}}>
                    <CardContent>
                        <Table sx={{ minWidth: '100%'}}>
                        <TableHead sx={{ borderBottom: "1px solid #e0e0e0" }}>
                            <TableCell sx={{ fontWeight: "bold", color: "white" }}>Команда</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "white" }}>Участники</TableCell>
                        </TableHead>
                        <TableBody sx={{justify: "center" }}>
                            {eventData.event_teams.map((team, index) => (
                                <TableRow
                                        key={team.id}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        borderBottom: index < eventData.event_teams.length - 1 ? "1px solid #424242" : "none",
                                        backgroundColor: myTeam?.id === team.id ? 'rgba(100, 255, 218, 0.1)' : 'inherit',
                                        borderLeft: myTeam?.id === team.id ? '4px solid #64ffda' : 'none',
                                    }}
                                    onClick={() => navigate(`/team/${team.id}`)}
                                >
                                    {/* первая колонка */}
                                    <TableCell component="th" scope="row" sx={{ fontWeight: "medium", color: "white" }}>
                                        {team.name}
                                    </TableCell>

                                    {/* вторая колонка */}
                                    <TableCell sx={{ color: "white" }}>
                                        <Stack direction="row" flexWrap="wrap" spacing={1}>
                                            {team.members.map((member, i) => (
                                                <Chip
                                                    key={i}
                                                    label={`${member.login} [${member.track.name}]`}
                                                    color={member.event_role === "PARTICIPANT" ? "primary" : "success"}
                                                    size="small"
                                                    sx={{ color: "white"}}
                                                />
                                            ))}
                                            {team.vacancies.map((vacancy, i) => (
                                                <Chip
                                                    key={i}
                                                    label={`Вакансия [${vacancy.track.name}]`}
                                                    color="default"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ color: "white", borderColor: "rgba(255, 255, 255, 0.4)" }} // Стиль для вакансий на темном фоне
                                                />
                                            ))}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {activeTab === "participants" && (
                freeParticipants.length === 0 ? (
                    <Typography color="text.secondary">Нет доступных участников</Typography>
                ) : (
                    <Box display="flex" flexDirection="column" gap={3}>
                        {freeParticipants.map((p, i) => {
                            const action = isTeamlead ? (
                                myVacancies.length > 0 ? (
                                    <Button
                                        variant="contained"
                                        sx={{ maxWidth: 200 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenVacancyModal(p)}}
                                        fullWidth
                                    >
                                        Пригласить
                                    </Button>
                                ) : (
                                    <Button variant="outlined" size="small" disabled fullWidth>
                                        Нет вакансий
                                    </Button>
                                )
                            ) : null;

                            return (
                                <ParticipantsList key={i} participant={p} action={action} />
                            );
                        })}
                        </Box>
                )
            )}

            {activeTab === "responses" && (
                <Box sx={{ mt: 3 }}>
                    {incomingRequests.length === 0 ? (
                        <Typography color="text.secondary">Отклики — пока пусто</Typography>
                    ) : (
                        <List>
                            {incomingRequests.map((request) => (
                                <ListItem
                                    key={request.id}
                                    divider
                                    secondaryAction={
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{marginRight: 3}}>
                                            <Badge
                                                badgeContent={request.approved_by_teamlead ? "Одобрено" : "Ожидает"}
                                                color={request.approved_by_teamlead ? "success" : "warning"}
                                            />
                                        </Stack>
                                    }
                                >
                                    <ListItemText
                                        primary={`Запрос #${request.id.slice(0, 8)}`}
                                        secondary={
                                            <>
                                                <Typography variant="body2">Вакансия: {request.vacancy.track.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {isTeamlead ? (
                                                        <>
                                                            От&nbsp;
                                                            <Link
                                                                component={RouterLink}
                                                                to={`/participant/${request.participant.id}`}
                                                                underline="hover"
                                                            >
                                                                {request.participant.login}
                                                            </Link>
                                                        </>
                                                    ): (
                                                        `Отправлено в команду ${request.team.name}`
                                                    )}
                                                </Typography>

                                                {isTeamlead && !request.approved_by_teamlead && (
                                                    <Box sx={{
                                                        mt: 1,
                                                        display: "flex",
                                                        gap: 1,
                                                    }}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        color="success"
                                                        onClick={() => AcceptRequest(request.id)}
                                                    >
                                                        Подтвердить
                                                    </Button>
                                                    <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="error"
                                                    onClick={() => RejectRequest(request.id)}
                                                    >
                                                Отклонить
                                                </Button>
                                                    </Box>
                                                )}
                                            </>
                                    }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            )}

            {activeTab === "invites" && (
                <Box sx={{ mt: 3 }}>
                    {outgoingRequests.length === 0 ? (
                        <Typography color="text.secondary">Приглашения — пока пусто</Typography>
                    ) : (
                        <List>
                            {outgoingRequests.map((invite) => (
                                <ListItem
                                    key={invite.id}
                                    divider
                                    secondaryAction={
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{marginRight: 3}}>
                                            <Badge
                                                badgeContent={invite.approved_by_participant ? "Принято" : "Ожидает"}
                                                color={invite.approved_by_participant ? "success" : "warning"}
                                            />
                                        </Stack>
                                    }
                                >
                                    <ListItemText
                                        primary={`Приглашение #${invite.id.slice(0, 8)}`}
                                        secondary={
                                            <>
                                                <Typography variant="body">На трек: {invite.vacancy.track.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {isTeamlead ? (
                                                        `Отправлено участнику ${invite.participant.login}`
                                                    ) : (
                                                        <>
                                                            Приглашение в команду&nbsp;
                                                            <Link
                                                                component={RouterLink}
                                                                to={`/team/${invite.team.id}`}
                                                                underline="hover"
                                                            >
                                                                {invite.team.name}
                                                            </Link>
                                                        </>
                                                    )}
                                                </Typography>


                                                {!isTeamlead && !invite.approved_by_participant && (
                                                    <Box sx={{
                                                        mt: 1,
                                                        display: "flex",
                                                        gap: 1,
                                                    }}>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            color="success"
                                                            onClick={() => AcceptRequest(invite.id)}
                                                        >
                                                            Подтвердить
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            color="error"
                                                            onClick={() => RejectRequest(invite.id)}
                                                        >
                                                            Отклонить
                                                        </Button>
                                                    </Box>
                                                )}
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            )}

            <Card sx={{ mt: 4, bgcolor: "background.paper", borderRadius: 3 }} variant={"outlined"}>
                <CardContent>
                    {participantData ? (
                        <>
                            <Stack direction="row" spacing={2} mb={2}>
                            <Typography variant="h6" mb={2}>
                                Вы участвуете в этом мероприятии
                            </Typography>
                            {myTeam ? (
                                <Button variant="contained"
                                        size="small"
                                        color="success"
                                        onClick={() => navigate(`/team/${myTeam.id}`)}
                                >Моя команда</Button>
                            ) : (null)
                            }
                            </Stack>
                            <Typography><strong>Роль:</strong> {participantData.event_role === "TEAMLEAD" ? "Тимлид" : "Участник"}</Typography>
                            <Typography><strong>Трек:</strong> {participantData.track.name}</Typography>
                            <Typography sx={{ whiteSpace: "pre-wrap" }}>
                                <strong>Резюме:</strong>
                                <ReactMarkdown>{participantData.resume || "—"}</ReactMarkdown>
                            </Typography>
                        </>
                    ) : (
                        <Typography color="text.secondary">Вы не зарегистрированы на это мероприятие</Typography>
                    )}
                </CardContent>
            </Card>

            <SelectVacancyModal
                isOpen={isVacancyModalOpen}
                onClose={() => setIsVacancyModalOpen(false)}
                vacancies={myVacancies}
                onSubmit={handleSendInvite}
                participant={selectedParticipant}
            />
        </Box>
            </Container>
        </>
            );
}

export default EventPage;
