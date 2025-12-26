import { apiFetch } from '../apiClient.js';

export async function createTeamRequest(vacancyId, participantToInviteId, showToast) {
    const res = await apiFetch('/team_requests', {
        method: 'POST',
        body: JSON.stringify({
            vacancy_id: vacancyId,
            participant_id: participantToInviteId
        })
    });
    if (!res.ok) {
        if (res.status === 409) {
            showToast('error', 'Отклик или приглашение уже существует');
        }
        else if (res.status === 400) {
            showToast('error', 'Несоответствие трека вакансии и трека участника');
        }
        else {
            showToast('error', 'Неизвестная ошибка. Скоро все исправим.');
        }
    } else {
        showToast('success', 'Приглашение отправлено!');
    }
}

export async function acceptRequest(requestId, isTeamlead, showToast, setIncomingRequests, setOutgoingRequests) {
    const res = await apiFetch(`/team_requests/${requestId}/accept`, {
        method: 'PUT',
    })
    if (!res.ok) {
        if (res.status === 409) {
            showToast('error', isTeamlead ? 'Этот пользователь уже в другой команде' : 'Вы уже в другой команде');
        }
        else if (res.status === 400) {
            showToast('error', 'Несоответствие трека вакансии и трека участника');
        }
        else {
            showToast('error', 'Неизвестная ошибка. Скоро все исправим.');
        }
    } else {
        showToast('success', 'Подтверждение успешно, теперь вы в команде!');
        setOutgoingRequests(prev => prev.filter(invite => invite.id !== requestId));
        setIncomingRequests(prev => prev.filter(invite => invite.id !== requestId));
    }
}

export async function rejectRequest(requestId, showToast, setIncomingRequests, setOutgoingRequests) {
    const res = await apiFetch(`/team_requests/${requestId}/reject`, {
        method: 'PUT',
    })
    if (!res.ok) {
        console.log(res.status, res.statusText);
        showToast('error', 'Неизвестная ошибка. Скоро все исправим.');
    } else {
        showToast('success', 'Отклонено');
        setOutgoingRequests(prev => prev.filter(invite => invite.id !== requestId));
        setIncomingRequests(prev => prev.filter(invite => invite.id !== requestId));
    }
}

