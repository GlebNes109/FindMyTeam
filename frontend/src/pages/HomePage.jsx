import styles from "../styles/HomePage.module.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatchUserModal from "../components/PatchUserModal.jsx";

function HomePage() {
    const navigate = useNavigate();
    const [data, setData] = useState("");
    const [participants, setParticipants] = useState([]);
    const [EventDetails, setEventDetails] = useState([]); // Состояние для хранения событий
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate('/signin');
            return;
        }

        fetch('http://localhost:8080/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        navigate('/signin');
                        return Promise.reject("не авторизован");
                    }
                }
                return response.json();
            })
            .then(setData)
            .catch(error => console.error('Ошибка HomePage:', error));

        fetch('http://localhost:8080/participants', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(async participants => {
                setParticipants(participants || []);

                const eventsMap = {};
                await Promise.all(participants.map(async (p) => {
                    try {
                        const res = await fetch(`http://localhost:8080/events/${p.event_id}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });
                        if (res.ok) {
                            const event = await res.json();
                            eventsMap[p.event_id] = event;
                        }
                    } catch (err) {
                        console.error(`Ошибка загрузки события ${p.event_id}:`, err);
                    }
                }));
                setEventDetails(eventsMap);
            })
            .catch(error => console.error('Ошибка загрузки участий:', error));

    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/signin");
    };

    const handleDelete = () => {
        if (window.confirm("Вы уверены, что хотите удалить аккаунт?")) {
            fetch("http://localhost:8080/users", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
                .then(() => {
                    localStorage.removeItem("token");
                    navigate("/signup");
                })
                .catch(error => console.error("Ошибка удаления:", error));
        }
    };

    if (!data) {
        return <p>Загрузка...</p>;
    }

    return (
        <div className="container py-5">
            <div className={styles['user-info']}>
                <div className={styles['user-info-content-left']}>
                    <h2>Здравствуйте, {data.login}!</h2>
                    <p>Email: {data.email}</p>
                    <p>Telegram: {data.tg_nickname}</p>
                </div>
                <div className={styles['user-info-content-right']}>
                    <button onClick={handleLogout} className="btn btn-warning mb-2">Выйти</button>
                    <button onClick={handleDelete} className="btn btn-danger mb-2">Удалить профиль</button>
                    <button className="btn btn-primary" onClick={() => { setIsModalOpen(true) }}>Редактировать профиль</button>
                </div>
            </div>

            <h1>Ваши мероприятия</h1>

            {/* Секция с карточками мероприятий */}
            <div className="row g-4">
                {participants.length === 0 ? (
                    <p>Вы не участвуете в мероприятиях.</p>
                ) : (
                    participants.map(participant => {
                            const event = EventDetails[participant.event_id];

                            if (!event) {
                                return (
                                    <div key={participant.id} className="col-md-4">
                                        <div className="card h-100 shadow-sm bg-dark text-white border-2">
                                            <div className="card-body">
                                                <h5 className="card-title">Загрузка...</h5>
                                                <p className="card-text">Получение данных мероприятия</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={participant.id} className="col-md-4">
                                    <div
                                        className={`card h-100 shadow-sm bg-dark border-2 ${styles['card-clickable']}`}
                                        onClick={() => navigate(`/event/${participant.event_id}`, {
                                            state: { participant_id: participant.id }
                                        })}
                                    >
                                        <div className="card-body">
                                            <h5 className="card-title">{event.name}</h5>
                                            <span className="badge bg-secondary me-2">
                                            {participant.event_role === "PARTICIPANT" ? "Участник" : "Тимлид"}
                                        </span>
                                            <span className="badge bg-primary">
                                            {participant.track.name}
                                        </span>
                                            <p className="card-text">{event.description}</p>
                                            <p><b>Дата начала:</b> {event.start_date}</p>
                                            <p><b>Дата окончания:</b> {event.end_date}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
            </div>

            <PatchUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default HomePage;
