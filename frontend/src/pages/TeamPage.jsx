import {useLocation, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Collapse,
    Container,
    Divider,
    Grid,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import {blueGrey, cyan, deepPurple, grey, indigo, lightGreen, lime, teal} from '@mui/material/colors';
import ParticipantsList from "../components/ParticipantsList.jsx";
import {apiFetch} from "../apiClient.js";

function TeamVacancy({ vacancy, participant}) {
    const [expanded, setExpanded] = useState(false);

    const handleRespond = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await apiFetch("/team_requests", {
                method: "POST",
                body: JSON.stringify({
                    vacancy_id: vacancy.id,
                    participant_id: participant.id
                })
            });
            if (!res.ok) {
                alert("Ошибка при отправке отклика");
            } else {
                alert("Отклик отправлен!");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const canRespond = // может ли откликнуться
        participant &&
        participant.event_role === "PARTICIPANT" &&
        participant.track?.id === vacancy.track?.id;

    return (
        <Card
            sx={{
                borderRadius: 3,
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={1.5}
                    flexWrap="wrap"
                >
                    <Typography variant="h6">
                        Вакансия #{vacancy.id.slice(0, 6)}
                    </Typography>
                    <Chip label={vacancy.track.name} color="primary" />
                </Stack>
                <Divider sx={{ mb: 3 }}/>

                <Collapse in={expanded} collapsedSize={80}>
                    <Card sx={{ bgcolor: grey[900], p: 2, borderRadius: 3 }}>
                        <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                        >
                            <ReactMarkdown>{vacancy.description || "—"}</ReactMarkdown>
                        </Typography>
                    </Card>
                </Collapse>
                <Stack direction="row" spacing={2} mt={2}>
                    <Button size="small" onClick={() => setExpanded(!expanded)}>
                        {expanded ? "Свернуть" : "Развернуть"}
                    </Button>
                    {canRespond && (
                        <Button size="small" variant="contained" color="primary" onClick={handleRespond}>
                            Откликнуться
                        </Button>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

function TeamPage() {
    const location = useLocation();
    const params = useParams();
    const [team, setTeam] = useState(location.state?.team || null);
    const [participant, setParticipant] = useState(null);
    useEffect(() => {
        if (!team) {
            apiFetch(`/teams/${params.teamId}`)
                .then(res => res.json())
                .then(setTeam);
        }
    }, [params.teamId]);

    useEffect(() => {
        const id = localStorage.getItem("CurrentParticipantId");
        if (!id) return;
        apiFetch(`/participants/${id}`)
            .then(res => res.json())
            .then(setParticipant);
    }, []);


    if (!team) {
        return (
            <Box p={4}>
                <Typography variant="h6">Загрузка ... </Typography>
            </Box>
        );
    }

    return (
        <>
            <Toolbar />
        <Container maxWidth="md" sx={{ py: 5 }}>
            <Card variant={"outlined"} sx={{borderRadius: 3, mb:5, p:5}}>
            <Typography variant="h4" mb={3}> Команда {team.name}</Typography>
                <Divider sx={{ mb: 3 }}/>
            <Typography variant="subtitle1" color="text.secondary">
                <ReactMarkdown>{team.description}</ReactMarkdown>
            </Typography>
            </Card>
            <Box display="flex" flexDirection="column" gap={3} mb={3}>
                {team.vacancies.map((vacancy) => (
                    <TeamVacancy key={vacancy.id} vacancy={vacancy} participant={participant}/>
                ))}
            </Box>
            <Box display="flex" flexDirection="column" gap={3}>
                {team.members.map((member) => (
                    <ParticipantsList key={member.id} participant={member} />
                    ))}
            </Box>
        </Container>
            </>
            );
}

export default TeamPage;
