import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Badge,
    Stack,
    Button,
    Link
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function InvitesTab({ outgoingRequests, isTeamlead, onAccept, onReject }) {
    return (
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
                                                    onClick={() => onAccept(invite.id)}
                                                >
                                                    Подтвердить
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="error"
                                                    onClick={() => onReject(invite.id)}
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
    );
}

export default InvitesTab;

