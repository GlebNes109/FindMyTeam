import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from '../styles/MyEventPage.module.css';

function MyEventPage() {
    const { eventId } = useParams();
    const [eventData, setEventData] = useState(null);
    const [activeTab, setActiveTab] = useState('teams');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch(`http://localhost:8080/events/user/get_event/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setEventData(data))
            .catch(err => console.error(err));
    }, [eventId]);

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
            <div className="card mt-4 bg-dark">
                <div className="card-body">Карточка (пока не реализована)</div>
            </div>
        </div>
    );
}

export default MyEventPage;
