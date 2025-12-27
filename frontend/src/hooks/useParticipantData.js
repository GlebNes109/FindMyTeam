import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../apiClient.js';

export function useParticipantData(participantId) {
    const [participantData, setParticipantData] = useState(null);

    useEffect(() => {
        if (!participantId) return;

        const fetchParticipantData = async () => {
            try {
                const res = await apiFetch(`/participants/${participantId}`);
                if (res.status === 404) {
                    localStorage.removeItem("CurrentParticipantId");
                    setParticipantData(null);
                    return;
                }
                if (!res.ok) throw new Error("Не удалось получить участника");
                const data = await res.json();
                setParticipantData(data);
                localStorage.setItem("CurrentParticipantId", participantId);
            } catch (error) {
                console.error("Ошибка при получении участника:", error);
                setParticipantData(null);
            }
        };

        fetchParticipantData();
    }, [participantId]);

    const isTeamlead = useMemo(() => {
        if (!participantData) return null;
        return participantData.event_role === "TEAMLEAD";
    }, [participantData]);

    return { participantData, setParticipantData, isTeamlead };
}

