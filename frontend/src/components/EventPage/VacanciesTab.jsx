import React from 'react';
import {
    Box,
    Stack,
    Typography,
    Divider,
    Link,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Pagination
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import TeamVacancy from "../TeamVacancy.jsx";

function VacanciesTab({ vacancies, participantData, inTeam, pageVacancies, setPageVacancies, perPageVacancies, setPerPageVacancies, totalPagesVacancies }) {
    return (
        <Stack spacing={3}>
            <Typography variant="h6">Вакансии</Typography>
            <Divider sx={{ mb: 3 }}/>
            {vacancies.length > 0 ? (
                vacancies.map((vacancy, index) => (
                    <TeamVacancy
                        key={vacancy.id || index}
                        vacancy={vacancy}
                        index={index}
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
                <Stack spacing={2} alignItems="center" mb={2}>
                    <Pagination
                        count={totalPagesVacancies}
                        page={pageVacancies}
                        onChange={(e, value) => setPageVacancies(value)}
                        color="primary"
                        size="medium"
                        shape="rounded"
                    />
                </Stack>

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
    );
}

export default VacanciesTab;

