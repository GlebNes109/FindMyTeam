import styles from "../styles/HomePage.module.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatchUserModal from "../components/PatchUserModal.jsx";

function HomePage() {
    const navigate = useNavigate();
    const [data, setData] = useState("");
    const [events, setEvents] = useState([]); // Состояние для хранения событий
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            // если токен не был выдан - пусть идет на sign in вводить пароль
            navigate('/signin');
        }

        // Получаем данные пользователя
        fetch('http://localhost:8080/user/data', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        navigate('/signin');
                        Promise.reject("не авторизован");
                    }
                }
                return response.json();
            })
            .then(data => {
                setData(data);
            })
            .catch(error => console.error('Ошибка HomePage:', error));

        // Получаем события, в которых участвует пользователь
        fetch('http://localhost:8080/events/user/get_user_events', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then(events => setEvents(events || [])) // Устанавливаем события
            .catch(error => console.error('Ошибка загрузки событий:', error));

    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/signin");
    };

    const handleDelete = () => {
        if (window.confirm("Вы уверены, что хотите удалить аккаунт?")) {
            fetch("http://localhost:8080/user/delete", {
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
                {events.length === 0 ? (
                    <p>Вы не участвуете в мероприятиях.</p>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="col-md-4">
                            <div className={`card h-100 shadow-sm bg-dark border-2 ${styles['card-clickable']}`} onClick={() => navigate(`/home/myevent/${event.id}`, {
                                state: {
                                participant_id: event.participant_id
                            }})}>
                                <div className="card-body">
                                    <h5 className="card-title">{event.name}</h5>
                                    <span className="badge bg-secondary me-2"> {event.event_role === "PARTICIPANT" ? "Участник" : "Тимлид"}</span>
                                    <span className="badge bg-secondary me-2">{event.participant_track}</span>
                                    <p className="card-text">{event.description}</p>
                                    <p><b>Дата начала:</b> {event.start_date}</p>
                                    <p><b>Дата окончания:</b> {event.end_date}</p>
                                    {/*<div>
                                        <b>Треки:</b>
                                        {event.event_tracks.map(track => (
                                            <span key={track.id} className="badge bg-secondary me-2">{track.name}</span>
                                        ))}
                                    </div>*/}
                                </div>
                            </div>
                        </div>
                    ))
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
