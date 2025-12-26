import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Toolbar,
    CircularProgress
} from "@mui/material";
import { useParams, useLocation } from "react-router-dom";
import {apiFetch} from "../apiClient.js";
import TeamHeader from "../components/TeamPage/TeamHeader.jsx";
import TeamVacanciesSection from "../components/TeamPage/TeamVacanciesSection.jsx";
import TeamMembersSection from "../components/TeamPage/TeamMembersSection.jsx";
import TeamActions from "../components/TeamPage/TeamActions.jsx";
import TeamDialogs from "../components/TeamPage/TeamDialogs.jsx";

function TeamPage() {
    const location = useLocation();
    const params = useParams();
    const [team, setTeam] = useState(location.state?.team || null);
    const [participant, setParticipant] = useState(null);
    const [event, setEvent] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editTeam, setEditTeam] = useState({ name: "", description: "" });
    const [vacancies, setVacancies] = useState([]);
    const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [tracks, setTracks] = useState([]);
    const [newVacancy, setNewVacancy] = useState({ event_track_id: "", description: "" });
    const [showVacancyForm, setShowVacancyForm] = useState(false);
    const [confirmRemoveVacancy, setConfirmRemoveVacancy] = useState({ open: false, index: null, id: null });
    const [confirmKickMember, setConfirmKickMember] = useState({ open: false, id: null });

    const isTeamLead = participant && team && participant.id === team.teamlead_id;
    const inTeam = team?.members?.some(member => member.id === participant?.id);

    const fetchTeam = async () => {
        const res = await apiFetch(`/teams/${params.teamId}`);
        const data = await res.json();
        setTeam(data);
        setVacancies(data.vacancies || []);
    };

    useEffect(() => {
        if (!team) {
            fetchTeam();
        }
    }, [params.teamId]);

    useEffect(() => {
        const id = localStorage.getItem("CurrentParticipantId");
        if (!id) return;
        apiFetch(`/participants/${id}`)
            .then(res => res.json())
            .then(setParticipant);
    }, []);

    useEffect(() => {
        if (team?.event_id) {
            apiFetch(`/events/${team.event_id}`)
                .then(res => res.json())
                .then(data => {
                    setEvent(data);
                    setTracks(data.event_tracks || []);
                });
        }
    }, [team?.event_id]);

    const removeVacancy = async (index, id) => {
        if (id) {
            await apiFetch(`/teams/vacancy/${id}`, { method: "DELETE" });
        }
        setVacancies(prev => prev.filter((_, i) => i !== index));
    };

    const saveTeamEdit = async () => {
        const res = await apiFetch(`/teams`, {
            method: "PATCH",
            body: JSON.stringify({
                id: team.id,
                name: editTeam.name,
                description: editTeam.description
            })
        });
        if (res.ok) {
            setTeam(prev => ({ ...prev, ...editTeam }));
            setEditMode(false);
        }
    };

    const handleSaveVacancy = async () => {
        const res = await apiFetch(`/teams/${team.id}/vacancy`, {
            method: "POST",
            body: JSON.stringify(newVacancy),
        });
        if (res.ok) {
            await fetchTeam();
            setShowVacancyForm(false);
            setNewVacancy({ event_track_id: "", description: "" });
        } else {
            alert("Ошибка при добавлении вакансии");
        }
    };

    const handleRemoveVacancy = async () => {
        await removeVacancy(confirmRemoveVacancy.index, confirmRemoveVacancy.id);
        setConfirmRemoveVacancy({ open: false, index: null, id: null });
    };

    const handleKickMember = async () => {
        await apiFetch(`/teams/${team.id}/members/${confirmKickMember.id}`, {
            method: "DELETE"
        });
        setTeam(prev => ({
            ...prev,
            members: prev.members.filter(m => m.id !== confirmKickMember.id)
        }));
        setConfirmKickMember({ open: false, id: null });
    };

    const handleLeaveTeam = async () => {
        await apiFetch(`/teams/${team.id}/leave/${participant.id}`, { method: "DELETE" });
        window.location.href = "/";
    };

    const handleDeleteTeam = async () => {
        await apiFetch(`/teams/${team.id}`, { method: "DELETE" });
        window.location.href = "/";
    };

    if (!team) {
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

    return (
        <>
            <Toolbar />
            <Container maxWidth="md" sx={{ py: 5 }}>
                <TeamHeader
                    team={team}
                    editMode={editMode}
                    editTeam={editTeam}
                    setEditTeam={setEditTeam}
                    onSave={saveTeamEdit}
                    onEdit={() => {
                        setEditTeam({ name: team.name, description: team.description });
                        setEditMode(true);
                    }}
                    isTeamLead={isTeamLead}
                />

                <TeamVacanciesSection
                    vacancies={vacancies}
                    isTeamLead={isTeamLead}
                    participant={participant}
                    inTeam={inTeam}
                    showVacancyForm={showVacancyForm}
                    setShowVacancyForm={setShowVacancyForm}
                    newVacancy={newVacancy}
                    setNewVacancy={setNewVacancy}
                    tracks={tracks}
                    onSaveVacancy={handleSaveVacancy}
                    onRemoveVacancy={setConfirmRemoveVacancy}
                />

                <TeamMembersSection
                    team={team}
                    participant={participant}
                    isTeamLead={isTeamLead}
                    onKickMember={(id) => setConfirmKickMember({ open: true, id })}
                />

                <TeamActions
                    isTeamLead={isTeamLead}
                    inTeam={inTeam}
                    onDeleteTeam={() => setOpenDeleteDialog(true)}
                    onLeaveTeam={() => setOpenLeaveDialog(true)}
                />

                <TeamDialogs
                    openLeaveDialog={openLeaveDialog}
                    setOpenLeaveDialog={setOpenLeaveDialog}
                    openDeleteDialog={openDeleteDialog}
                    setOpenDeleteDialog={setOpenDeleteDialog}
                    confirmRemoveVacancy={confirmRemoveVacancy}
                    setConfirmRemoveVacancy={setConfirmRemoveVacancy}
                    confirmKickMember={confirmKickMember}
                    setConfirmKickMember={setConfirmKickMember}
                    onLeaveTeam={handleLeaveTeam}
                    onDeleteTeam={handleDeleteTeam}
                    onRemoveVacancy={handleRemoveVacancy}
                    onKickMember={handleKickMember}
                />
            </Container>
        </>
    );
}

export default TeamPage;
