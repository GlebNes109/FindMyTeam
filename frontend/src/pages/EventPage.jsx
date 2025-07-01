import { useParams, useLocation } from 'react-router-dom';
import {useEffect, useMemo, useState} from 'react';
import SelectVacancyModal from "../components/SelectVacancyModel.jsx";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Stack,
    Tab,
    Tabs,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Badge,
    Alert, Toolbar, Container, TableRow, TableCell, TableHead, TableBody, Table,
} from "@mui/material";

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
    const [loadedTabs, setLoadedTabs] = useState({
        teams: false,
        participants: false,
        requests: false,
    });

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
                fetch(`http://localhost:8080/events/${eventId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`http://localhost:8080/events/${eventId}/teams`, {
                    headers: { Authorization: `Bearer ${token}` },
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
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`http://localhost:8080/events/${eventId}/participants`, {
                headers: { Authorization: `Bearer ${token}` },
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
                const res = await fetch(`http://localhost:8080/participants/${participant_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Не удалось получить участника");
                const data = await res.json();
                setParticipantData(data);
            } catch (error) {
                console.error("Ошибка при получении участника:", error);
            }
        };

        fetchParticipantData();
    }, [participant_id]);

    const loadRequests = async () => {
        if (!participant_id || loadedTabs.responses) return;
        const token = localStorage.getItem("token");
        const incomingUrl = `http://localhost:8080/team_requests/${isTeamlead ? 'incoming' : 'outgoing'}?participant_id=${participant_id}`;
        const outgoingUrl = `http://localhost:8080/team_requests/${isTeamlead ? 'outgoing' : 'incoming'}?participant_id=${participant_id}`;

        try {
            const [incomingRes, outgoingRes] = await Promise.all([
                fetch(incomingUrl, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(outgoingUrl, { headers: { Authorization: `Bearer ${token}` } }),
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
        const token = localStorage.getItem("token");
        const res = fetch('http://localhost:8080/team_requests', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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

    const myVacancies = useMemo(() => {
        if (!eventData?.event_teams || !participantData) return [];
        const myTeam = eventData.event_teams.find(team =>
            team.teamlead_id === participantData.id
        );
        console.log("fsd");
        console.log(myTeam);

        return myTeam?.vacancies || [];
    }, [eventData, participantData]);

    useEffect(() => {
        handleTabChange(activeTab);
    }, []);

    function AcceptRequest(request_id) {
        const token = localStorage.getItem("token");
        const res = fetch(`http://localhost:8080/team_requests/${request_id}/accept`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
    }

    function RejectRequest(request_id) {
        const token = localStorage.getItem("token");
        const res = fetch(`http://localhost:8080/team_requests/${request_id}/reject`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
                <Card variant="outlined" sx={{ mb: 4, bgcolor: "#303030"}}>
                    <CardContent>
                        <Table sx={{ minWidth: '100%' }}>
                        <TableHead sx={{ borderBottom: "1px solid #e0e0e0" }}>
                            <TableCell sx={{ fontWeight: "bold", color: "white" }}>Команда</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "white" }}>Участники</TableCell>
                        </TableHead>
                        <TableBody sx={{justify: "center" }}>
                            {eventData.event_teams.map((team, index) => (
                                <TableRow
                                    key={team.id}
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        borderBottom: index < eventData.event_teams.length - 1 ? "1px solid #424242" : "none",
                                    }}
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
                                                    sx={{ color: "white" }}
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
                    <Grid container spacing={3}>
                        {freeParticipants.map((p, i) => (
                            <Grid item xs={12} md={6} lg={4} key={i}>
                                <Card sx={{ bgcolor: "background.paper", height: "100%", display: "flex", flexDirection: "column" }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6">{p.login}</Typography>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Трек: {p.track.name}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                        >
                                            <strong>Резюме:</strong> {p.resume || "—"}
                                        </Typography>
                                    </CardContent>
                                    <Box sx={{ p: 2, pt: 0 }}>
                                        {isTeamlead ? (
                                            myVacancies.length > 0 ? (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleOpenVacancyModal(p)}
                                                    fullWidth
                                                >
                                                    Пригласить
                                                </Button>
                                            ) : (
                                                <Button variant="outlined" size="small" disabled fullWidth>
                                                    Нет вакансий
                                                </Button>
                                            )
                                        ) : (
                                            <Button variant="outlined" size="small" disabled fullWidth title="Вы не капитан">
                                                Недоступно
                                            </Button>
                                        )}
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
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
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Badge
                                                badgeContent={request.approved_by_teamlead ? "Одобрено" : "Ожидает"}
                                                color={request.approved_by_teamlead ? "success" : "warning"}
                                                sx={{ minWidth: 80 }}
                                            />
                                            {isTeamlead && !request.approved_by_teamlead && (
                                                <Stack direction="row" spacing={1}>
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
                                                </Stack>
                                            )}
                                        </Stack>
                                    }
                                >
                                    <ListItemText
                                        primary={`Запрос #${request.id.slice(0, 8)}`}
                                        secondary={
                                            <>
                                                <Typography variant="body2">Вакансия: {request.vacancy.id}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {isTeamlead
                                                        ? `От участника ${request.participant.login}`
                                                        : `Отправлено в команду`}
                                                </Typography>
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
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Badge
                                                badgeContent={invite.approved_by_participant ? "Принято" : "Ожидает"}
                                                color="primary"
                                                sx={{ minWidth: 60 }}
                                            />
                                        </Stack>
                                    }
                                >
                                    <ListItemText
                                        primary={`Запрос #${invite.id.slice(0, 8)}`}
                                        secondary={
                                            <>
                                                <Typography variant="body2">Вакансия: {invite.vacancy.id}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {isTeamlead
                                                        ? `Отправлено участнику ${invite.participant.login}`
                                                        : `Приглашение в команду ${invite.team.name}`}
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

            <Card sx={{ mt: 4, bgcolor: "background.paper" }}>
                <CardContent>
                    {participantData ? (
                        <>
                            <Typography variant="h6" mb={2}>
                                Вы участвуете в этом мероприятии
                            </Typography>
                            <Typography><strong>Роль:</strong> {participantData.event_role === "TEAMLEAD" ? "Тимлид" : "Участник"}</Typography>
                            <Typography><strong>Трек:</strong> {participantData.track.name}</Typography>
                            <Typography sx={{ whiteSpace: "pre-wrap" }}>
                                <strong>Резюме:</strong> {participantData.resume || "—"}
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
