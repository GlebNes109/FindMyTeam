import {useParams, useLocation, useNavigate} from 'react-router-dom';
import React, {useEffect, useMemo, useState} from 'react';
import SelectVacancyModal from "../components/SelectVacancyModel.jsx";
import {
    Box,
    Tab,
    Tabs,
    Typography,
    Toolbar,
    Container,
    useTheme,
    useMediaQuery,
    CircularProgress
} from "@mui/material";
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import ReplyIcon from "@mui/icons-material/Reply";
import MailIcon from "@mui/icons-material/Mail";
import ParticipantCard from "../components/ParticipantCard.jsx";
import {useToast} from "../components/ToastProvider.jsx";
import {useEventData} from "../hooks/useEventData.js";
import {useParticipantData} from "../hooks/useParticipantData.js";
import {useVacancies} from "../hooks/useVacancies.js";
import {useParticipants} from "../hooks/useParticipants.js";
import {useRequests} from "../hooks/useRequests.js";
import TeamsTab from "../components/EventPage/TeamsTab.jsx";
import VacanciesTab from "../components/EventPage/VacanciesTab.jsx";
import ParticipantsTab from "../components/EventPage/ParticipantsTab.jsx";
import ResponsesTab from "../components/EventPage/ResponsesTab.jsx";
import InvitesTab from "../components/EventPage/InvitesTab.jsx";
import {createTeamRequest, acceptRequest, rejectRequest} from "../utils/requestHandlers.js";

function EventPage() {
    const { eventId } = useParams();
    const [activeTab, setActiveTab] = useState('teams');
    const location = useLocation();
    const participant_id = location.state?.participant_id;
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { showToast } = useToast();
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);

    const { eventData, setEventData, loadEventAndTeams } = useEventData(eventId);
    const { participantData, setParticipantData, isTeamlead } = useParticipantData(participant_id);
    const { 
        vacancies, 
        pageVacancies, 
        setPageVacancies, 
        perPageVacancies, 
        setPerPageVacancies, 
        totalPagesVacancies,
        loadVacancies
    } = useVacancies(eventId, participant_id);
    const {
        participants,
        setParticipants,
        pageParticipants,
        setPageParticipants,
        perPageParticipants,
        setPerPageParticipants,
        totalPagesParticipants,
        loadParticipants,
        myTeam
    } = useParticipants(eventId, participantData, isTeamlead, eventData);
    const {
        incomingRequests,
        outgoingRequests,
        requestsError,
        setIncomingRequests,
        setOutgoingRequests,
        loadRequests
    } = useRequests(participant_id, isTeamlead);

    const myVacancies = useMemo(() => {
        return myTeam?.vacancies || [];
    }, [myTeam]);

    const inTeam = myTeam ? true : false;

    useEffect(() => {
        if (activeTab === 'teams') {
            loadEventAndTeams();
        } else if (activeTab === 'vacancies') {
            loadVacancies();
        } else if (activeTab === 'participants') {
            loadParticipants();
        } else if (activeTab === 'responses' || activeTab === 'invites') {
            loadRequests();
        }
    }, [activeTab]);

    useEffect(() => {
        if (eventData) {
            setEventData(prev => ({ ...prev, event_participants: participants }));
        }
    }, [participants]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleOpenVacancyModal = (participant) => {
        setSelectedParticipant(participant);
        setIsVacancyModalOpen(true);
    };

    const handleSendInvite = (vacancyId) => {
        createTeamRequest(vacancyId, selectedParticipant.id, showToast);
    };

    const handleAcceptRequest = (requestId) => {
        acceptRequest(requestId, isTeamlead, showToast, setIncomingRequests, setOutgoingRequests);
    };

    const handleRejectRequest = (requestId) => {
        rejectRequest(requestId, showToast, setIncomingRequests, setOutgoingRequests);
    };

    if (!eventData) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "200px",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

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

    return (
        <>
            <Toolbar />
            <Container>
                <Box p={{ xs: 1, sm: 5 }}>
                    <Typography variant="h4" mb={2}>{eventData.name}</Typography>
                    <Typography mb={3}>{eventData.description}</Typography>

                    <Tabs 
                        value={activeTab} 
                        onChange={(e, val) => handleTabChange(val)}
                        variant={isMobile ? "fullWidth" : "scrollable"}
                        scrollButtons="auto" 
                        sx={{ 
                            mb: 4, 
                            minHeight: 64,
                            "& .MuiTab-root": {
                                minHeight: 64,
                                minWidth: "auto",
                                fontSize: { xs: "0.7rem", sm: "1rem" }
                            }
                        }}
                    >
                        {Object.entries(tabLabels).map(([key, label]) => (
                            <Tab
                                key={key}
                                value={key}
                                label={isMobile ? (activeTab === key && isMobile ? label : null) : label}
                                icon={isMobile ? (activeTab !== key ? tabIcons[key] : null) : tabIcons[key]}
                                iconPosition="start"
                            />
                        ))}
                    </Tabs>

                    {activeTab === "vacancies" && (
                        <VacanciesTab
                            vacancies={vacancies}
                            participantData={participantData}
                            inTeam={inTeam}
                            pageVacancies={pageVacancies}
                            setPageVacancies={setPageVacancies}
                            perPageVacancies={perPageVacancies}
                            setPerPageVacancies={setPerPageVacancies}
                            totalPagesVacancies={totalPagesVacancies}
                        />
                    )}

                    {activeTab === "teams" && (
                        <TeamsTab
                            eventData={eventData}
                            myTeam={myTeam}
                        />
                    )}

                    {activeTab === "participants" && (
                        <ParticipantsTab
                            participants={participants}
                            isTeamlead={isTeamlead}
                            myVacancies={myVacancies}
                            onInviteClick={handleOpenVacancyModal}
                            pageParticipants={pageParticipants}
                            setPageParticipants={setPageParticipants}
                            perPageParticipants={perPageParticipants}
                            setPerPageParticipants={setPerPageParticipants}
                            totalPagesParticipants={totalPagesParticipants}
                        />
                    )}

                    {activeTab === "responses" && (
                        <ResponsesTab
                            incomingRequests={incomingRequests}
                            isTeamlead={isTeamlead}
                            requestsError={requestsError}
                            onAccept={handleAcceptRequest}
                            onReject={handleRejectRequest}
                        />
                    )}

                    {activeTab === "invites" && (
                        <InvitesTab
                            outgoingRequests={outgoingRequests}
                            isTeamlead={isTeamlead}
                            onAccept={handleAcceptRequest}
                            onReject={handleRejectRequest}
                        />
                    )}

                    <ParticipantCard
                        participantData={participantData}
                        setParticipantData={setParticipantData}
                        myTeam={myTeam}
                        navigate={navigate}
                        eventTracks={eventData.event_tracks}
                        onUpdated={loadEventAndTeams}
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
