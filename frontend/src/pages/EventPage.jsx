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
    Alert,
    Toolbar,
    Container,
    TableRow,
    TableCell,
    TableHead,
    TableBody,
    Table,
    useTheme,
    useMediaQuery,
    CircularProgress, InputLabel, MenuItem, FormControl, Select, Pagination, TableContainer
} from "@mui/material";
import ParticipantsList from "../components/ParticipantsList.jsx";
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import ReplyIcon from "@mui/icons-material/Reply";
import MailIcon from "@mui/icons-material/Mail";
import {apiFetch} from "../apiClient.js";
import ParticipantCard from "../components/ParticipantCard.jsx";
import {useToast} from "../components/ToastProvider.jsx";
import TeamVacancy from "../components/TeamVacancy.jsx";

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
    const [requestsError, setRequestsError] = useState(false);
    const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
    const [vacancies, setVacancies] = useState([]);
    const navigate = useNavigate()
    const [loadedTabs, setLoadedTabs] = useState({
        teams: false,
        participants: false,
        requests: false,
    });
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { showToast } = useToast();
    const isTeamlead = useMemo(() => {
        if (!participantData) return null;
        return participantData.event_role === "TEAMLEAD";
    }, [participantData]);
    const [pageParticipants, setPageParticipants] = useState(1);
    const [perPageParticipants, setPerPageParticipants] = useState(10);
    const [totalPagesParticipants, setTotalPagesParticipants] = useState(1);
    const [pageVacancies, setPageVacancies] = useState(1);
    const [perPageVacancies, setPerPageVacancies] = useState(10);
    const [totalPagesVacancies, setTotalPagesVacancies] = useState(1);

    const handleOpenVacancyModal = (participant) => {
        setSelectedParticipant(participant);
        setIsVacancyModalOpen(true);
    };

    const handleSendInvite = (vacancyId) => {
        CreateNewTeamRequest(vacancyId, selectedParticipant.id);
    };

    const loadEventAndTeams = async () => {
        if (!eventId) return;
        // const token = localStorage.getItem("token");

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

        try {
            // let res = null;
            let baseUrl = `/events/${eventId}/participants?page=${pageParticipants}&per_page=${perPageParticipants}`;

            if (participantData && isTeamlead !== null) {
                const isRelevantSort = isTeamlead ? 'true' : 'false';
                const teamParam = isTeamlead && myTeam ? `&team_id=${myTeam.id}` : '';
                baseUrl += `&relevant_sort=${isRelevantSort}${teamParam}`;
            }

            const res = await apiFetch(baseUrl);
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);

            const res_json = await res.json();

            let participants = res_json.items;
            setTotalPagesParticipants(res_json.total_pages);

            setEventData(prev => ({ ...prev, event_participants: participants }));
            setLoadedTabs(prev => ({ ...prev, participants: true }));

        } catch (error) {
            console.error("Ошибка при загрузке участников:", error);
        }
    };

    useEffect(() => {
        loadParticipants();
    }, [pageParticipants, perPageParticipants, participantData, isTeamlead]);

    useEffect(() => {
        loadVacancies();
    }, [pageVacancies, perPageVacancies, participantData, isTeamlead]);


    useEffect(() => {
        if (!participant_id) return;

        const fetchParticipantData = async () => {
            try {
                const res = await apiFetch(`/participants/${participant_id}`);
                if (res.status === 404) {
                    localStorage.removeItem("CurrentParticipantId");
                    setParticipantData(null);
                    return;
                }
                if (!res.ok) throw new Error("Не удалось получить участника");
                const data = await res.json();
                setParticipantData(data);
                localStorage.setItem("CurrentParticipantId", participant_id);
            } catch (error) {
                console.error("Ошибка при получении участника:", error);
                setParticipantData(null);
            }
        };

        fetchParticipantData();
    }, [participant_id]);

    const loadVacancies = async () => {
        try {
            let baseUrl = `/events/${eventId}/vacancies?page=${pageVacancies}&per_page=${perPageVacancies}`;

            if (participant_id) {
                const isRelevantSort = !!participant_id;
                baseUrl += `&relevant_sort=${isRelevantSort}&participant_id=${participant_id}`;
            }

            const res = await apiFetch(baseUrl);
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);

            const data = await res.json();
            setVacancies(data.items);
            setTotalPagesVacancies(data.total_pages);
            setLoadedTabs(prev => ({ ...prev, vacancies: true }));
        } catch (e) {
            console.error("Ошибка при загрузке вакансий:", e);
        }
    };


    const loadRequests = async () => {
        if (!participant_id) return;
        const incomingUrl = `/team_requests/${isTeamlead ? 'incoming' : 'outgoing'}?participant_id=${participant_id}`;
        const outgoingUrl = `/team_requests/${isTeamlead ? 'outgoing' : 'incoming'}?participant_id=${participant_id}`;
        try {
            const [incomingRes, outgoingRes] = await Promise.all([
                apiFetch(incomingUrl),
                apiFetch(outgoingUrl),
            ]);

            if (!incomingRes.ok || !outgoingRes.ok) throw new Error("Ошибка загрузки запросов");

            const [incoming, outgoing] = await Promise.all([
                incomingRes.json(),
                outgoingRes.json(),
            ]);

            setIncomingRequests(incoming || []);
            setOutgoingRequests(outgoing || []);
            setLoadedTabs(prev => ({ ...prev, responses: true, invites: true }));
        } catch (error) {
            console.error("Ошибка при загрузке заявок:", error);
            setRequestsError(true);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        if (tab === 'vacancies') {
            loadVacancies();
        }

        if (tab === 'teams') {
            loadEventAndTeams();
        }

        if (tab === 'participants') {
            loadParticipants();
        }

        if (tab === 'responses' || tab === 'invites') {
            loadRequests();
        }
    };

    /*функция для приглашения новых участников в свою команду - если participant который просматривает страницу является teamlead*/
    async function CreateNewTeamRequest(vacancy_id, participant_to_invite_id) {
        const res = await apiFetch('/team_requests', {
            method: 'POST',
            body: JSON.stringify({
                vacancy_id: vacancy_id,
                participant_id: participant_to_invite_id
            })
        });
        if (!res.ok) {
            if (res.status === 409) {
                showToast('error', 'Отклик или приглашение уже существует');
            }
            else if (res.status === 400) {
                showToast('error', 'Несоответствие трека вакансии и трека участника');
            }
            else {
                showToast('error', 'Неизвестная ошибка. Скоро все исправим.');
            }
        } else {
            showToast('success', 'Приглашение отправлено!');
        }
        }
    // console.log(eventData)

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

    async function AcceptRequest(request_id) {
        const res = await apiFetch(`/team_requests/${request_id}/accept`, {
            method: 'PUT',
        })
        if (!res.ok) {
            if (res.status === 409) {
                showToast('error', isTeamlead ? 'Этот пользователь уже в другой команде' : 'Вы уже в другой команде');
            }
            else if (res.status === 400) {
                showToast('error', 'Несоответствие трека вакансии и трека участника');
            }
            else {
                showToast('error', 'Неизвестная ошибка. Скоро все исправим.');
            }
        } else {
            showToast('success', 'Подтверждение успешно, теперь вы в команде!');
            setOutgoingRequests(prev => prev.filter(invite => invite.id !== request_id));
            setIncomingRequests(prev => prev.filter(invite => invite.id !== request_id));
        }
    }

    async function RejectRequest(request_id) {
        const res = await apiFetch(`/team_requests/${request_id}/reject`, {
            method: 'PUT',
        })
        if (!res.ok) {
            console.log(res.status, res.statusText);
            showToast('error', 'Неизвестная ошибка. Скоро все исправим.');
        } else {
            showToast('success', 'Отклонено');
            setOutgoingRequests(prev => prev.filter(invite => invite.id !== request_id));
            setIncomingRequests(prev => prev.filter(invite => invite.id !== request_id));
        }
    }

    if (!eventData) return (<Box
        sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
        }}
    >
        <CircularProgress />
    </Box>);

    const tabLabels = {
        teams: "Команды",
        vacancies: "Вакансии",
        participants: isTeamlead ? "Участники (можно пригласить)" : "Участники (просмотр)",
        responses: isTeamlead ? "Отклики в мою команду" : "Мои отклики",
        invites: isTeamlead ? "Мои приглашения" : "Приглашения мне",
    };

    const tabIcons = {
        teams: <GroupsIcon />,
        vacancies: <LiveHelpIcon />,
        participants: <PeopleIcon />,
        responses: <ReplyIcon />,
        invites: <MailIcon />,
    };

    const inTeam = myTeam ? true : false

    return (
        <>
            <Toolbar />
            <Container>
                <Box p={{ xs: 1, sm: 5 }}>
            <Typography variant="h4" mb={2}>{eventData.name}</Typography>
            <Typography mb={3}>{eventData.description}</Typography>

            <Tabs value={activeTab} onChange={(e, val) => handleTabChange(val)}
                  variant={isMobile ? "fullWidth" : "scrollable"}
                  scrollButtons="auto" sx={{ mb: 4, minHeight: 64,
                "& .MuiTab-root": {
                    minHeight: 64,
                    minWidth: "auto",
                    fontSize: { xs: "0.7rem", sm: "1rem" }},}}>
                {Object.entries(tabLabels).map(([key, label]) => (
                    <Tab
                        key={key}
                        value={key}
                        // label={label}
                        label={isMobile ? (activeTab === key && isMobile ? label : null) : label}
                        icon={isMobile ? (activeTab !== key ? tabIcons[key] : null) : tabIcons[key]}
                        iconPosition="start"
                    />
                ))}
            </Tabs>

            {activeTab === "vacancies" && (
                <Stack spacing={3}>
                    <Typography variant="h6">Вакансии</Typography>
                    <Divider sx={{ mb: 3 }}/>
                    {vacancies.length > 0 ? (
                        vacancies.map((vacancy, index) => (
                            <TeamVacancy
                                key={vacancy.id || index}
                                vacancy={vacancy}
                                index={index}
                                // onRemove={(info) => setConfirmRemoveVacancy({ open: true, ...info })}
                                participant={participantData}
                                inTeam={inTeam}
                                action={
                                    <>
                                        Команда&nbsp;
                                        <Link
                                            component={RouterLink}
                                            to={`/team/${vacancy.team_id}`}
                                            underline="hover"
                                        >
                                            {vacancy.team_name}
                                        </Link>
                                    </>
                                }
                            />
                        ))
                    ) : (
                        <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                            Вакансий нет
                        </Typography>
                    )}

                    <Box display="flex" flexDirection="column" justifyContent="space-between" alignItems="center" mt={2}>
                        {/* Кнопки переключения страниц */}

                        <Stack spacing={2} alignItems="center" mb={2}>
                            <Pagination
                                count={totalPagesVacancies}
                                page={pageVacancies}
                                onChange={(e, value) => setPageVacancies(value)}
                                color="primary"
                                size="medium"
                                // variant="contained"
                                shape="rounded"
                            />
                        </Stack>

                        {/* Селектор количества элементов */}
                        <Box display="flex" alignItems="center" gap={1}>
                            <FormControl size="small" sx={{ minWidth: 170 }}>
                                <InputLabel id="per-page-label">Элементов на странице</InputLabel>
                                <Select
                                    labelId="per-page-label"
                                    value={perPageVacancies}
                                    label="Элементов на странице"
                                    onChange={(e) => {
                                        setPerPageVacancies(Number(e.target.value));
                                    }}
                                >
                                    {[5, 10, 20, 30].map((n) => (
                                        <MenuItem key={n} value={n}>{n}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Box>
                    </Box>
                </Stack>
            )}

            {activeTab === "teams" && (
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

            )}

            {activeTab === "participants" && (
                eventData.event_participants.length === 0 ? (
                    <Typography color="text.secondary">Нет доступных участников</Typography>
                ) : (
                    <Box display="flex" flexDirection="column" gap={3}>
                        {/* сообщение, если команда есть, но вакансий нет */}
                        {isTeamlead && myVacancies.length === 0 && (
                            <Typography color="error" variant="body2">
                                Вы не можете приглашать участников — в вашей команде нет вакансий
                            </Typography>
                        )}
                        {eventData.event_participants.map((p, i) => {
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
                                        Вы не можете приглашать участников - в вашей команде нет вакансий
                                    </Button>
                                )
                            ) : null;

                            return (
                                <ParticipantsList key={i} participant={p} action={action} />
                            );
                        })}
                        <Box display="flex" flexDirection="column" justifyContent="space-between" alignItems="center" mt={2}>
                            {/* Кнопки переключения страниц */}

                            <Stack spacing={2} alignItems="center" mb={2}>
                                <Pagination
                                    count={totalPagesParticipants}
                                    page={pageParticipants}
                                    onChange={(e, value) => setPageParticipants(value)}
                                    color="primary"
                                    size="medium"
                                    // variant="contained"
                                    shape="rounded"
                                />
                            </Stack>

                            {/* Селектор количества элементов */}
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
                )
            )}

            {activeTab === "responses" && (
                <Box sx={{ mt: 3 }}>
                    {requestsError ? (
                            <Alert severity="error">Не удалось загрузить приглашения. Попробуйте позже.</Alert>
                    ) :
                        incomingRequests.length === 0 ? (
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
                                        primary={`Приглашение #${invite.id.slice(0, 6)}`}
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

            <ParticipantCard
                participantData={participantData}
                setParticipantData={setParticipantData}
                myTeam={myTeam}
                navigate={navigate}
                eventTracks={eventData.event_tracks}
                onUpdated={loadEventAndTeams} // чтобы обновляло данные после PATCH
                eventId={eventData.id}
            />

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
