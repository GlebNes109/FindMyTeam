import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from '../styles/MyEventPage.module.css';

function MyEventPage() {
    const { eventId } = useParams();
    const [eventData, setEventData] = useState(null);
    const [activeTab, setActiveTab] = useState('teams');
    const location = useLocation();
    const participant_id = location.state?.participant_id;
    const [participantData, setParticipantData] = useState(null);

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
    if (!eventData) return <div>Загрузка...</div>;

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
                {activeTab === 'responses' && <p>Отклики — пока пусто</p>}
                {activeTab === 'invites' && <p>Приглашения — пока пусто</p>}
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
