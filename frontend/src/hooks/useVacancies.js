import { useState, useEffect } from 'react';
import { apiFetch } from '../apiClient.js';

export function useVacancies(eventId, participantId) {
    const [vacancies, setVacancies] = useState([]);
    const [pageVacancies, setPageVacancies] = useState(1);
    const [perPageVacancies, setPerPageVacancies] = useState(10);
    const [totalPagesVacancies, setTotalPagesVacancies] = useState(1);
    const [loaded, setLoaded] = useState(false);

    const loadVacancies = async () => {
        try {
            let baseUrl = `/events/${eventId}/vacancies?page=${pageVacancies}&per_page=${perPageVacancies}`;

            if (participantId) {
                const isRelevantSort = !!participantId;
                baseUrl += `&relevant_sort=${isRelevantSort}&participant_id=${participantId}`;
            }

            const res = await apiFetch(baseUrl);
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);

            const data = await res.json();
            setVacancies(data.items);
            setTotalPagesVacancies(data.total_pages);
            setLoaded(true);
        } catch (e) {
            console.error("Ошибка при загрузке вакансий:", e);
        }
    };

    useEffect(() => {
        loadVacancies();
    }, [pageVacancies, perPageVacancies, participantId, eventId]);

    return {
        vacancies,
        pageVacancies,
        setPageVacancies,
        perPageVacancies,
        setPerPageVacancies,
        totalPagesVacancies,
        loadVacancies,
        loaded
    };
}

