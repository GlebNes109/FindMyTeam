import { useParams, useLocation } from 'react-router-dom';
import {useEffect, useMemo, useState} from 'react';
import SelectVacancyModal from "../components/SelectVacancyModel.jsx";

function EventPage() {
    const { eventId } = useParams();
    // const { participant_id } = useParams();
    const [eventData, setEventData] = useState(null);
    const [activeTab, setActiveTab] = useState('teams');
    const location = useLocation();
    const participant_id = location.state?.participant_id;
    const [participantData, setParticipantData] = useState(null);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
    const [loadedTabs, setLoadedTabs] = useState({
        teams: false,
        participants: false,
        requests: false,
    });

    const isTeamlead = useMemo(() => {
        return participantData?.event_role === 'TEAMLEAD';
    }, [participantData]);

    const handleOpenVacancyModal = (participant) => {
        setSelectedParticipant(participant);
        setIsVacancyModalOpen(true);
    };

    const handleSendInvite = (vacancyId) => {
        CreateNewTeamRequest(vacancyId, selectedParticipant.id);
    };

    const loadEventAndTeams = async () => {
        if (!eventId || loadedTabs.teams) return;
        const token = localStorage.getItem("token");

        try {
            const [eventRes, teamsRes] = await Promise.all([
                fetch(`http://localhost:8080/events/${eventId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`http://localhost:8080/events/${eventId}/teams`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const [event, teams] = await Promise.all([
                eventRes.json(),
                teamsRes.json(),
            ]);

            setEventData(prev => ({ ...event, event_teams: teams, event_participants: prev?.event_participants || [] }));
            setLoadedTabs(prev => ({ ...prev, teams: true }));
        } catch (error) {
            console.error("Ошибка при загрузке event/teams:", error);
        }
    };

    const loadParticipants = async () => {
        if (!eventId || loadedTabs.participants) return;
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`http://localhost:8080/events/${eventId}/participants`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const participants = await res.json();

            setEventData(prev => ({ ...prev, event_participants: participants }));
            setLoadedTabs(prev => ({ ...prev, participants: true }));
        } catch (error) {
            console.error("Ошибка при загрузке участников:", error);
        }
    };


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!participant_id) return;

        const fetchParticipantData = async () => {
            try {
                const res = await fetch(`http://localhost:8080/participants/${participant_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Не удалось получить участника");
                const data = await res.json();
                setParticipantData(data);
            } catch (error) {
                console.error("Ошибка при получении участника:", error);
            }
        };

        fetchParticipantData();
    }, [participant_id]);

    const loadRequests = async () => {
        if (!participant_id || loadedTabs.responses) return;
        const token = localStorage.getItem("token");
        const incomingUrl = `http://localhost:8080/team_requests/${isTeamlead ? 'incoming' : 'outgoing'}?participant_id=${participant_id}`;
        const outgoingUrl = `http://localhost:8080/team_requests/${isTeamlead ? 'outgoing' : 'incoming'}?participant_id=${participant_id}`;

        try {
            const [incomingRes, outgoingRes] = await Promise.all([
                fetch(incomingUrl, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(outgoingUrl, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            const [incoming, outgoing] = await Promise.all([
                incomingRes.json(),
                outgoingRes.json(),
            ]);

            setIncomingRequests(incoming || []);
            setOutgoingRequests(outgoing || []);
            setLoadedTabs(prev => ({ ...prev, responses: true, invites: true }));
        } catch (error) {
            console.error("Ошибка при загрузке заявок:", error);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        if (tab === 'teams' && !loadedTabs.teams) {
            loadEventAndTeams();
        }

        if (tab === 'participants' && !loadedTabs.participants) {
            loadParticipants();
        }

        if (tab === 'responses' || tab === 'invites' && !loadedTabs.requests) {
            loadRequests();
        }
    };

    /*функция для приглашения новых участников в свою команду - если participant который просматривает страницу является teamlead*/
    function CreateNewTeamRequest(vacancy_id, participant_to_invite_id) {
        const token = localStorage.getItem("token");
        const res = fetch('http://localhost:8080/team_requests', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                vacancy_id: vacancy_id,
                participant_id: participant_to_invite_id
            })
        })
        }
    // console.log(eventData)
    const participantsInTeams = useMemo(() => {
        if (!eventData?.event_teams) return new Set();
        return new Set(
            eventData.event_teams.flatMap(team =>
                team.members?.map(m => m.id) || []
            )
        );
    }, [eventData]);

    const freeParticipants = useMemo(() => {
        if (!eventData?.event_participants) return [];
        return eventData.event_participants.filter(
            p => !participantsInTeams.has(p.id)
        );
    }, [eventData, participantsInTeams]);

    const myVacancies = useMemo(() => {
        if (!eventData?.event_teams || !participantData) return [];
        const myTeam = eventData.event_teams.find(team =>
            team.teamlead_id === participantData.id
        );
        console.log("fsd");
        console.log(myTeam);

        return myTeam?.vacancies || [];
    }, [eventData, participantData]);

    useEffect(() => {
        handleTabChange(activeTab);
    }, []);

    function AcceptRequest(request_id) {
        const token = localStorage.getItem("token");
        const res = fetch(`http://localhost:8080/team_requests/${request_id}/accept`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
    }

    if (!eventData) return <div className="container py-5"><p>Загрузка...</p></div>;
    return (
        <div className="container py-5">
            <h2>{eventData.name}</h2>
            <p>{eventData.description}</p>
            <div>
                <ul className="nav nav-tabs">
                    {['teams', 'participants', 'responses', 'invites'].map(tab => (
                        <li className="nav-item" key={tab}>
                            <button
                                className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => handleTabChange(tab)}
                            >
                                {{
                                    teams: 'Команды',
                                    participants: isTeamlead ? 'Участники (можно пригласить)' : 'Участники (просмотр)',
                                    responses: isTeamlead ? 'Отклики в мою команду' : 'Мои отклики',
                                    invites: isTeamlead ? 'Мои приглашения' : 'Приглашения мне'
                                }[tab]}
                            </button>
                        </li>
                    ))}
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
                                                myVacancies.length > 0 ? (
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleOpenVacancyModal(p)}
                                                    >
                                                        Пригласить
                                                    </button>

                                                ) : (
                                                    <button className="btn btn-secondary btn-sm" disabled>Нет вакансий</button>
                                                )
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
                            {incomingRequests.length === 0 ? (
                                <p className="text-muted">Отклики — пока пусто</p>
                            ) : (
                                <div className="list-group">
                                    {incomingRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <h5 className="mb-1">Запрос #{request.id.slice(0, 8)}</h5>
                                                <p className="mb-1">Вакансия: {request.vacancy_id.slice(0, 8)}</p>
                                                <small className="mb-1">
                                                    {isTeamlead
                                                        ? `От участника: ${request.participant_id.slice(0, 8)}`
                                                        : `Отправлено в команду`}
                                                </small>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
              <span
                  className={`badge ${request.approved_by_teamlead ? 'bg-success' : 'bg-warning'} rounded-pill`}
              >
                {request.approved_by_teamlead ? 'Одобрено' : 'Ожидает'}
              </span>
                                                {/* Кнопка "Подтвердить", только если это входящий запрос */}
                                                {isTeamlead && !request.approved_by_teamlead && (
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => AcceptRequest(request.id)}
                                                    >
                                                        Подтвердить
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}


                    {activeTab === 'invites' && (
                        <div className="mt-3">
                            {outgoingRequests.length === 0 ? (
                                <p className="text-muted">Приглашения — пока пусто</p>
                            ) : (
                                <div className="list-group">
                                    {outgoingRequests.map((invite) => (
                                        <div
                                            key={invite.id}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <h5 className="mb-1">Запрос #{invite.id.slice(0, 8)}</h5>
                                                <p className="mb-1">Вакансия: {invite.vacancy_id.slice(0, 8)}</p>
                                                {isTeamlead ? (
                                                    <small>Отправлено участнику: {invite.participant_id.slice(0, 8)}</small>
                                                ) : (
                                                    <small>Приглашено командой</small>
                                                )}
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-primary rounded-pill">
                {invite.approved_by_participant ? 'Принято' : 'Ожидает'}
              </span>
                                                {/* Только участник может подтвердить приглашение */}
                                                {!isTeamlead && !invite.approved_by_participant && (
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => AcceptRequest(invite.id)}
                                                    >
                                                        Подтвердить
                                                    </button>
                                                )}
                                            </div>
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
            <SelectVacancyModal
                isOpen={isVacancyModalOpen}
                onClose={() => setIsVacancyModalOpen(false)}
                vacancies={myVacancies}
                onSubmit={handleSendInvite}
                participant={selectedParticipant}
            />
        </div>
    );
}

export default EventPage;
