import { useState } from 'react';
import { apiFetch } from '../apiClient.js';

export function useRequests(participantId, isTeamlead) {
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [requestsError, setRequestsError] = useState(false);
    const [loaded, setLoaded] = useState({ responses: false, invites: false });

    const loadRequests = async () => {
        if (!participantId) return;
        const incomingUrl = `/team_requests/${isTeamlead ? 'incoming' : 'outgoing'}?participant_id=${participantId}`;
        const outgoingUrl = `/team_requests/${isTeamlead ? 'outgoing' : 'incoming'}?participant_id=${participantId}`;
        try {
            const [incomingRes, outgoingRes] = await Promise.all([
                apiFetch(incomingUrl),
                apiFetch(outgoingUrl),
            ]);

            if (!incomingRes.ok || !outgoingRes.ok) throw new Error("Ошибка загрузки запросов");

            const [incoming, outgoing] = await Promise.all([
                incomingRes.json(),
                outgoingRes.json(),
            ]);

            setIncomingRequests(incoming || []);
            setOutgoingRequests(outgoing || []);
            setLoaded({ responses: true, invites: true });
        } catch (error) {
            console.error("Ошибка при загрузке заявок:", error);
            setRequestsError(true);
        }
    };

    return {
        incomingRequests,
        outgoingRequests,
        requestsError,
        setIncomingRequests,
        setOutgoingRequests,
        loadRequests,
        loaded
    };
}

