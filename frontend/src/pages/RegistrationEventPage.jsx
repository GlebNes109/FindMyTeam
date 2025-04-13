import React, {useEffect, useState} from "react";
import styles from "../styles/RegistrationEventModal.module.css";
import {useNavigate, useParams} from "react-router-dom";

function RegistrationEventPage() {
    const [event_role, setEventRole] = useState("PARTICIPANT");
    const [event_track, setEventTrack] = useState("");
    const [resume, setResume] = useState("");
    const [team_name, setTeamName] = useState("");
    const [team_description, setTeamDescription] = useState("");
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const { event_id } = useParams();

    useEffect(() => {
        fetch(`http://localhost:8080/events/user/get_event/${event_id}`, {
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => setEvent(data))
            .catch(err => console.error('Ошибка загрузки событий:', err));

        if (event?.event_tracks?.length > 0 && !event_track) {
            setEventTrack(event.event_tracks[0].id);
        }
    }, [navigate, event, event_track]);

    function RegisterNewParticipant() {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/signin');
            return;
        }

        const requestBody = {
            event_id: event.id,
            event_role: event_role,
            track_id: event_track,
            resume: resume,
        };

        if (event_role === "TEAMLEAD") {
            requestBody.team = {
                name: team_name,
                description: team_description
            };
        }

        fetch("http://localhost:8080/events/user/registration", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody)
            ,
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        navigate('/signin');
                        throw new Error("Ошибка регистрации");
                    } else if (response.status === 400) {
                        throw new Error("Ошибка регистрации");
                    }
                }
                return response.json()

            })
            .then((data) => {
                console.log("Успешно зарегистрирован:", data);
                navigate(`/home/myevent/${event.id}`)
            })
    }

    return (
        <div className="container py-5">
            <h3 className="mb-4">Регистрация на мероприятие</h3>

            <div className="mb-3">
                <label htmlFor="resume" className="form-label">
                    Расскажите о себе
                </label>
                <textarea
                    className="form-control bg-dark border-secondary text-light"
                    id="resume"
                    rows="5"
                    maxLength="1000"
                    placeholder="Небольшое резюме, стек технологий и т.д."
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                />
            </div>

            {/* Командные поля — отображаются только для TEAMLEAD */}
            <div className={event_role === "TEAMLEAD" ? "" : "d-none"}>
                <div className="mb-3">
                    <label htmlFor="teamName" className="form-label">Название команды</label>
                    <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        id="teamName"
                        placeholder="Название команды"
                        value={team_name}
                        onChange={(e) => setTeamName(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="teamDescription" className="form-label">Описание команды</label>
                    <textarea
                        className="form-control bg-dark border-secondary text-light"
                        id="teamDescription"
                        rows="3"
                        maxLength="500"
                        placeholder="Описание команды"
                        value={team_description}
                        onChange={(e) => setTeamDescription(e.target.value)}
                    />
                </div>
            </div>

            <div className="mb-3">
                <label htmlFor="roleSelect" className="form-label">Роль</label>
                <select
                    id="roleSelect"
                    className="form-select bg-dark text-secondary border-secondary text-light"
                    value={event_role}
                    onChange={(e) => setEventRole(e.target.value)}
                >
                    <option value="PARTICIPANT">Участник</option>
                    <option value="TEAMLEAD">Капитан команды</option>
                </select>
            </div>

            <div className="mb-4">
                <label htmlFor="trackSelect" className="form-label">Трек</label>
                <select
                    id="trackSelect"
                    className="form-select bg-dark text-secondary border-secondary text-light"
                    value={event_track}
                    onChange={(e) => setEventTrack(e.target.value)}
                >
                    {event?.event_tracks?.map(track => (
                        <option key={track.id} value={track.id}>
                            {track.name}
                        </option>
                    ))}
                </select>
            </div>

            <button className="btn btn-primary" onClick={RegisterNewParticipant}>
                Подтвердить
            </button>
        </div>
    );
};

export default RegistrationEventPage;