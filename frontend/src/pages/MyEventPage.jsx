import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

function MyEventPage() {
    const { eventId } = useParams();
    const [eventData, setEventData] = useState(null);
    const [activeTab, setActiveTab] = useState('teams');
    const location = useLocation();
    const participant_id = location.state?.participant_id;
    const [participantData, setParticipantData] = useState(null);
    const [responsesData, setResponsesData] = useState(null);
    const [invitationsData, setInvitationsData] = useState(null);
    const isTeamlead = participantData?.event_role === 'TEAMLEAD';

    useEffect(() => {
        const token = localStorage.getItem('token');

        fetch(`http://localhost:8080/events/user/get_event/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setEventData(data))
            .catch(err => console.error(err));
    }, [eventId]);

    useEffect(() => {
        if (!participant_id) return;

        const token = localStorage.getItem('token');

        fetch(`http://localhost:8080/events/user/get_user_participation/${participant_id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setParticipantData(data))
            .catch(err => console.error("Ошибка загрузки участника:", err));
    }, [participant_id]);

    useEffect(() => {
        if (!participant_id) return;

        const token = localStorage.getItem('token');

        fetch(`http://localhost:8080/events/user/get_responses/${participant_id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setResponsesData(data))
            .catch(err => console.error("Ошибка загрузки участника:", err));
    }, [participant_id]);

    useEffect(() => {
        if (!participant_id) return;

        const token = localStorage.getItem('token');

        fetch(`http://localhost:8080/events/user/get_invitations/${participant_id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setInvitationsData(data))
            .catch(err => console.error("Ошибка загрузки участника:", err));
    }, [participant_id]);

    /*функция для приглашения новых участников в свою команду - если participant который просматривает страницу является teamlead*/
    function InviteNewParticipant(vacancy_id, participant_to_invite_id) {
        fetch('http://localhost:8080/events/user/invite', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                vacancy_id: vacancy_id,
                participant_id: participant_to_invite_id,
                teamlead_id: participant_id
            })
        })
        }

    if (!eventData) return <div className="container py-5"><p>Загрузка...</p></div>;
    const participantsInTeams = new Set(
        (eventData.event_teams || []).flatMap(team =>
            team.members?.map(m => m.participant_id) || []
        )
    );
    const freeParticipants = (eventData.event_participants || []).filter(
        p => !participantsInTeams.has(p.participant_id)
    );
    return (
        <div className="container py-5">
            <h2>{eventData.name}</h2>
            <p>{eventData.description}</p>
            <div>
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'teams' ? 'active' : ''}`} onClick={() => setActiveTab('teams')}>
                        Команды
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'participants' ? 'active' : ''}`}
                        onClick={() => setActiveTab('participants')}
                    >
                        {isTeamlead ? 'Участники (можно пригласить)' : 'Участники (просмотр)'}
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'responses' ? 'active' : ''}`} onClick={() => setActiveTab('responses')}>
                        Отклики
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'invites' ? 'active' : ''}`} onClick={() => setActiveTab('invites')}>
                        Приглашения
                    </button>
                </li>
            </ul>

            <div className="mt-4">
                {activeTab === 'teams' && (
                    <>
                        <table className="table table-striped table-dark">
                            <thead>
                            <tr>
                                <th>Команда</th>
                                <th>Участники</th>
                            </tr>
                            </thead>
                            <tbody>
                            {eventData.event_teams.map(team => (
                                <tr key={team.id}>
                                    <td>{team.name}</td>
                                    <td>
                                        {team.members.map((member, i) => (
                                            <span
                                                key={i}
                                                className={`badge me-2 mb-1 text-white ${member.event_role === 'PARTICIPANT' ? 'bg-primary' : 'bg-success'}`}
                                            >
                                            {member.login} [{member.track.name}]
                                        </span>
                                        ))}
                                        {team.vacancies.map((vacancy, i) => (
                                            <span key={i} className="badge bg-secondary me-2 mb-1">Вакансия [{vacancy.track.name}]</span>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                )}

                {activeTab === 'participants' && (
                    <>
                        {freeParticipants.length === 0 ? (
                            <p className="text-muted">Нет доступных участников</p>
                        ) : (
                            <table className="table table-bordered table-dark">
                                <thead>
                                <tr>
                                    <th>Логин</th>
                                    <th>Трек</th>
                                    <th>Резюме</th>
                                    <th>Действие</th>
                                </tr>
                                </thead>
                                <tbody>
                                {freeParticipants.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.login}</td>
                                        <td>{p.track.name}</td>
                                        <td>{p.resume}</td>
                                        <td>
                                            {isTeamlead ? (
                                                <button className="btn btn-success btn-sm" onClick={() => InviteNewParticipant(vacancy_id, p.id)}>Пригласить</button>
                                            ) : (
                                                <button className="btn btn-secondary btn-sm" disabled title="Вы не капитан">
                                                    Недоступно
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {activeTab === 'responses' && (
                    <div className="bg-black mt-3">
                        {responsesData.length === 0 ? (
                            <p className="text-muted">Отклики — пока пусто</p>
                        ) : (
                            <div className="list-group">
                                {responsesData.map((response) => (
                                    <div
                                        key={response.id}
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                        <div>
                                            <h5 className="mb-1">Отклик #{response.id.slice(0, 8)}</h5>
                                            <p className="mb-1">Вакансия: {response.vacancy_id.slice(0, 8)}</p>
                                            <small className="mb-1">Участник: {response.participant_id.slice(0, 8)}</small>
                                        </div>
                                        <span className={`badge ${response.approved_by_teamlead ? 'bg-success' : 'bg-warning'} rounded-pill`}>
                            {response.approved_by_teamlead ? 'Одобрено' : 'Ожидает'}
                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'invites' && (
                    <div className="mt-3">
                        {invitationsData.length === 0 ? (
                            <p className="text-muted">Приглашения — пока пусто</p>
                        ) : (
                            <div className="list-group">
                                {invitationsData.map((invite) => (
                                    <div
                                        key={invite.id}
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                        <div>
                                            <h5 className="mb-1">Приглашение #{invite.id.slice(0, 8)}</h5>
                                            <p className="mb-1">Вакансия: {invite.vacancy_id.slice(0, 8)}</p>
                                            {isTeamlead ? (
                                                <small>Отправлено участнику: {invite.participant_id.slice(0, 8)}</small>
                                            ) : (
                                                <small>Приглашено тимлидом</small>
                                            )}
                                        </div>
                                        <span className="badge bg-primary rounded-pill">
                            Ожидает ответа
                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
            </div>

            {/* Карточка снизу */}
            <div className="card mt-4 bg-dark text-light">
                <div className="card-body">
                    {participantData ? (
                        <>
                            <h5 className="card-title mb-3">Вы участвуете в этом мероприятии</h5>
                            <p><strong>Роль:</strong> {participantData.event_role === 'TEAMLEAD' ? 'Тимлид' : 'Участник'}</p>
                            <p><strong>Трек:</strong> {participantData.track.name}</p>
                            <p><strong>Резюме:</strong> {participantData.resume || '—'}</p>
                        </>
                    ) : (
                        <p className="text-muted">Вы не зарегистрированы на это мероприятие</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyEventPage;
