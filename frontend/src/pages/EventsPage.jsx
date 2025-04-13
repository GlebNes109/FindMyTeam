import styles from "../styles/EventsPage.module.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RegistrationEventModal from "../components/RegistrationEventModal.jsx";


function EventsPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]); // Хранение списка событий
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [event_track, setEventTrack] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("");
    const [event_role, setEventRole] = useState("");


    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate('/signin');
            return;
        }

        fetch('http://localhost:8080/events/user/get_all_events', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setEvents(data.events || [])) // Устанавливаем список событий
            .catch(err => console.error('Ошибка загрузки событий:', err));
    }, [navigate]);

    return (
        <div className={styles['main-content']}>
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
                            <button onClick={() => {setIsModalOpen(true); setSelectedEvent(event);}} className={styles.button}>Я учавствую</button>
                        </div>
                    ))}
                </div>
            )}
            <RegistrationEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                event={selectedEvent}
                event_role={event_role}
                event_track={event_track}
                setEventTrack={setEventTrack}
                setEventRole={setEventRole}
            />
        </div>
    );
}

export default EventsPage;
