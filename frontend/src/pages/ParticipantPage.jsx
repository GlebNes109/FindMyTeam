import React, {useEffect, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Link,
    Divider,
    Stack,
    Typography,
    Toolbar,
    useTheme,
    Container
} from "@mui/material";
import {grey} from "@mui/material/colors";
import ReactMarkdown from "react-markdown";
import {useParams} from "react-router-dom";

function ParticipantPage() {
    const [participant, setParticipant] = useState(location.state?.team || null);
    const params = useParams();
    const theme = useTheme();
    useEffect(() => {
        if (!participant) {
            fetch(`http://localhost:8080/participants/${params.participantId}`)
                .then(res => res.json())
                .then(setParticipant);
        }
    }, [params.participantId]);

    if (!participant) {
        return (
            <Box p={4}>
                <Typography variant="h6">Загрузка ... </Typography>
            </Box>
        );
    }

    return (
        <>
            <Toolbar />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box
                    sx={{
                        mb: 5,
                        p: 4,
                        bgcolor: grey[900],
                        borderRadius: 3,
                        boxShadow: 3,
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", md: "center" },
                        gap: 3,
                        borderLeft: `8px solid ${grey[800]}`,
                    }}
                >
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            {participant.login}
                        </Typography>
                        <Stack direction="row" spacing={1} mb={2}>
                            <Chip label={participant.track.name} color="secondary" />
                        </Stack>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            Email: <strong>{participant.email}</strong>
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Telegram:&nbsp;
                            <Link
                                href={`https://t.me/${participant.tg_nickname?.replace(/^@/, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                            >
                                {participant.tg_nickname}
                            </Link>
                        </Typography>
                    </Box>
                </Box>

                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Резюме
                </Typography>
                <Card sx={{ bgcolor: grey[900], p: 4, borderRadius: 3 }}>
                    <CardContent>
                        <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                        >
                            <ReactMarkdown>{participant.resume || "—"}</ReactMarkdown>
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
}

export default ParticipantPage;