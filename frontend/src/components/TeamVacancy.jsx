import React, {useEffect, useRef, useState} from "react";
import {useToast} from "./ToastProvider.jsx";
import {apiFetch} from "../apiClient.js";
import {Box, Button, Card, CardContent, Chip, Collapse, Divider, IconButton, Stack, Typography} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {grey} from "@mui/material/colors";
import ReactMarkdown from "react-markdown";

const TeamVacancy = ({ vacancy, index, participant, onRemove, isTeamLead , inTeam, action}) =>  {
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const contentRef = useRef(null);
    const collapsedSize = 150;
    const { showToast } = useToast();


    useEffect(() => {
        if (contentRef.current) {
            const height = contentRef.current.scrollHeight;
            setIsOverflowing(height > collapsedSize);
        }
    }, [vacancy.description]);
    const handleRespond = async () => {
        try {
            const res = await apiFetch("/team_requests", {
                method: "POST",
                body: JSON.stringify({
                    vacancy_id: vacancy.id,
                    participant_id: participant.id
                })
            });
            if (!res.ok) {
                if (res.status === 409) {
                    showToast('error', 'Отклик или приглашение уже существует');
                }
                else {
                    showToast('error', 'Неизвестная ошибка. Скоро все исправим.');
                }
            } else {
                showToast('success', 'Отклик отправлен!');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const canRespond = // может ли откликнуться
        (!inTeam) &&
        participant &&
        participant.event_role === "PARTICIPANT" &&
        participant.track?.id === vacancy.track?.id;

    return (
        <Card
            sx={{
                borderRadius: 3,
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                position: "relative"
            }}
        >

            {isTeamLead && (
                <IconButton
                    aria-label="Удалить"
                    onClick={() => onRemove({ index, id: vacancy.id })}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            )}
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
                {action && (
                    <Box sx={{ pb: 2 }}>
                        {action}
                    </Box>
                )}

                <Divider sx={{ mb: 3 }}/>

                {isOverflowing ? (
                    <Collapse in={expanded} collapsedSize={collapsedSize}>
                    <Card sx={{ bgcolor: grey[900], p: 4, borderRadius: 3 }}>
                        <Box ref={contentRef} sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            <ReactMarkdown>{vacancy.description || "—"}</ReactMarkdown>
                        </Box>
                    </Card>
                </Collapse>) : (
                    <Card sx={{ bgcolor: grey[900], p: 4, borderRadius: 3 }}>
                    <Box ref={contentRef} sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    <ReactMarkdown>{vacancy.description || "—"}</ReactMarkdown>
                    </Box>
                    </Card>
                    )}

                {isOverflowing && (
                    <Button
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={(e) => {e.stopPropagation();
                            setExpanded(!expanded)}}
                    >
                        {expanded ? "Свернуть" : "Развернуть"}
                    </Button>
                )}
                <Stack direction="row" spacing={2} mt={2}>
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

export default TeamVacancy;