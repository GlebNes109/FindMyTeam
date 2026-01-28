import { useState, useEffect } from 'react';
import { apiFetch } from '../apiClient.js';

export function useEventData(eventId) {
    const [eventData, setEventData] = useState(null);
    const [loaded, setLoaded] = useState(false);

    const loadEventAndTeams = async () => {
        if (!eventId) return;

        try {
            const [eventRes, teamsRes] = await Promise.all([
                apiFetch(`/events/${eventId}`),
                apiFetch(`/events/${eventId}/teams`),
            ]);

            const [event, teams] = await Promise.all([
                eventRes.json(),
                teamsRes.json(),
            ]);

            setEventData(prev => ({ ...event, event_teams: teams, event_participants: prev?.event_participants || [] }));
            setLoaded(true);
        } catch (error) {
            console.error("Ошибка при загрузке event/teams:", error);
        }
    };

    useEffect(() => {
        loadEventAndTeams();
    }, [eventId]);

    return { eventData, setEventData, loadEventAndTeams, loaded };
}

