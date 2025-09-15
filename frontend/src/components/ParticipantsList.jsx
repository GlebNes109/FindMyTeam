import React, {useEffect, useRef, useState} from "react";
import {Box, Button, Card, CardContent, Chip, Collapse, Link, Divider, Stack, Typography} from "@mui/material";
import {grey} from "@mui/material/colors";
import ReactMarkdown from "react-markdown";
import {useNavigate} from "react-router-dom";

function ParticipantsList({ participant, action}) {
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const contentRef = useRef(null);
    const collapsedSize = 150;
    const navigate = useNavigate();

    useEffect(() => {
        if (contentRef.current) {
            const height = contentRef.current.scrollHeight;
            setIsOverflowing(height > collapsedSize);
        }
    }, [participant.resume]);
    // console.log(participant)
    return (

        <Card onClick={() => navigate(`/participant/${participant.id}`)}
              sx={{ cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: 6,
                    },
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column" }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row"
                       spacing={1}
                       alignItems="center"
                       mb={1.5}
                       flexWrap="wrap">
                    <Typography variant="h6">{participant.login}</Typography>
                    <Chip label={participant.track.name} color={"secondary"}/>
                </Stack>
                {participant.tg_nickname && (
                    <Typography mb={2}>
                        Telegram:&nbsp;
                        <Link
                            href={`https://t.me/${participant.tg_nickname.replace(/^@/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                        >
                            {participant.tg_nickname}
                        </Link>
                    </Typography>
                )}
                {participant.email && (<Typography mb={2}>Email: {participant.email}</Typography>)}
                <Divider sx={{ mb: 3 }}/>
                <Collapse in={expanded} collapsedSize={collapsedSize}>
                    <Card sx={{ bgcolor: grey[900], p: 4, borderRadius: 3 }}>
                        <Box ref={contentRef} sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            <ReactMarkdown>{participant.resume || "—"}</ReactMarkdown>
                        </Box>
                    </Card>
                </Collapse>

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
            </CardContent>
            {action && (
                <Box sx={{ p: 2, pt: 0 }}>
                    {action}
                </Box>
            )}
        </Card>
    );
}

export default ParticipantsList;