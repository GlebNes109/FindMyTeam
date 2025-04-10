import React, {useState} from "react";
import BaseModal from "./BaseModal.jsx";
import styles_modal from "../styles/RegistrationEventModal.module.css";
import {useNavigate} from "react-router-dom";
/*import styles_basemodal from "../styles/BaseModal.module.css";*/

const RegistrationEventModal = ({ isOpen, onClose, event}) => {
    const [event_role, setEventRole] = useState("PARTICIPANT");
    const [event_track, setEventTrack] = useState("");
    const [resume, setResume] = useState("");
    const navigate = useNavigate();

    if (!event) return null;

    function RegisterNewParticipant() {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/signin');
            return;
        }
        fetch("http://localhost:8080/events/user/registration", {

            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                event_id: event.id,
                event_role: event_role,
                track_id: event_track,
                resume: resume,
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Ошибка регистрации");
                return res.json();
            })
            .then((data) => {
                console.log("Успешно зарегистрирован:", data);
                onClose(); // Закрыть модалку
            })
    }

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <h3>Регистрация на мероприятие</h3>
            <textarea
                className={styles_modal["large-textarea-modal"]}
                placeholder="Расскажите о себе (небольшое резюме, стек технологий и тд)"
                rows="10"
                maxLength="1000"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
            ></textarea>
            <div>
                <select className={styles_modal["multi-select"]} id="options" value={event_role} onChange={(e) => setEventRole(e.target.value)}>
                    <option value="PARTICIPANT">Участник</option>
                    <option value="TEAMLEAD">Капитан команды</option>
                </select>
            </div>
            <div>
                {event && (
                    <select className={styles_modal["multi-select"]} value={event_track} onChange={(e) => setEventTrack(e.target.value)}>
                        {event.event_tracks.map(track => (
                            <option key={track.id} value={track.id}>{track.name}</option>
                        ))}
                    </select>
                )}
            </div>
            <button className={styles_modal["submit-button"]} onClick={RegisterNewParticipant}>Подтвердить</button>
        </BaseModal>
    );
};

export default RegistrationEventModal;
