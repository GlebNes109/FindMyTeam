import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Badge,
    Alert,
    Stack,
    Button,
    Link
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function ResponsesTab({ incomingRequests, isTeamlead, requestsError, onAccept, onReject }) {
    return (
        <Box sx={{ mt: 3 }}>
            {requestsError ? (
                <Alert severity="error">Не удалось загрузить приглашения. Попробуйте позже.</Alert>
            ) : incomingRequests.length === 0 ? (
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
                                            ) : (
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
                                                    onClick={() => onAccept(request.id)}
                                                >
                                                    Подтвердить
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="error"
                                                    onClick={() => onReject(request.id)}
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

export default ResponsesTab;

