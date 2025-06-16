import styles from "../styles/MainPage.module.css";
import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";


function MainPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/events', {
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => setEvents(data || [])) // Устанавливаем список событий
            .catch(err => console.error('Ошибка загрузки событий:', err));
    }, [navigate]);

    return (
        <div className="container py-5">
        <div className={styles['text-content']}>
            <h1>Добро пожаловать в FindMyTeam</h1>
            <p>Здесь можно найти команду для олимпиад и проектов.</p>
            <button className="btn btn-outline-primary" onClick={() => navigate("/signin")}>Войти </button>
            <button className="btn btn-primary" onClick={() => navigate("/signup")}>Зарегистрироваться</button>
        </div>
            {events.length === 0 ? (
                <p>Нет доступных событий</p>
            ) : (
                <div className={styles.cardsList}>
                    <div className={styles.header}>
                        <h3>Все события</h3>
                    </div>
                    {events.map(event => (
                        <div key={event.id} className={styles.eventCard}>
                            <h4>{event.name}</h4>
                            <p>{event.description}</p>
                            <p><b>Дата начала:</b> {event.start_date}</p>
                            <p><b>Дата окончания:</b> {event.end_date}</p>
                            <div className={styles.eventTracks}>
                                <b>Треки:</b>
                                {event.event_tracks.map(track => (
                                    <span key={track.id} className={styles.track}>{track.name}</span>
                                ))}
                            </div>
                            <button onClick={() => {navigate(`/home/myevent/${event.id}/register`)}} className="btn btn-primary mt-3">Я учавствую</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MainPage;