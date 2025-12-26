import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../apiClient.js';

export function useParticipants(eventId, participantData, isTeamlead, eventData) {
    const [participants, setParticipants] = useState([]);
    const [pageParticipants, setPageParticipants] = useState(1);
    const [perPageParticipants, setPerPageParticipants] = useState(10);
    const [totalPagesParticipants, setTotalPagesParticipants] = useState(1);
    const [loaded, setLoaded] = useState(false);

    const myTeam = useMemo(() => {
        if (!eventData?.event_teams || !participantData) return null;
        return eventData.event_teams.find(team =>
            team.members?.some(member => member.id === participantData.id)
        ) || null;
    }, [eventData, participantData]);

    const loadParticipants = async () => {
        try {
            let baseUrl = `/events/${eventId}/participants?page=${pageParticipants}&per_page=${perPageParticipants}`;

            if (participantData && isTeamlead !== null) {
                const isRelevantSort = isTeamlead ? 'true' : 'false';
                const teamParam = isTeamlead && myTeam ? `&team_id=${myTeam.id}` : '';
                baseUrl += `&relevant_sort=${isRelevantSort}${teamParam}`;
            }

            const res = await apiFetch(baseUrl);
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);

            const res_json = await res.json();
            setParticipants(res_json.items);
            setTotalPagesParticipants(res_json.total_pages);
            setLoaded(true);
        } catch (error) {
            console.error("Ошибка при загрузке участников:", error);
        }
    };

    useEffect(() => {
        loadParticipants();
    }, [pageParticipants, perPageParticipants, participantData, isTeamlead, myTeam]);

    return {
        participants,
        setParticipants,
        pageParticipants,
        setPageParticipants,
        perPageParticipants,
        setPerPageParticipants,
        totalPagesParticipants,
        loadParticipants,
        loaded,
        myTeam
    };
}

