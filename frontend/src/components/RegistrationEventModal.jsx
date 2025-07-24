import React, {useState} from "react";
import BaseModal from "./BaseModal.jsx";
import styles_modal from "../styles/RegistrationEventModal.module.css";
import {useNavigate} from "react-router-dom";
import {apiFetch} from "../apiClient.js";
/*import styles_basemodal from "../styles/BaseModal.module.css";*/

const RegistrationEventModal = ({ isOpen, onClose, event}) => {
    const [event_role, setEventRole] = useState("PARTICIPANT");
    const [event_track, setEventTrack] = useState("");
    const [resume, setResume] = useState("");
    const [team_name, setTeamName] = useState("");
    const [team_description, setTeamDescription] = useState("");
    const navigate = useNavigate();

    if (!event) return null;

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


        apiFetch("/events/user/registration", {

            method: "POST",
            body:JSON.stringify(requestBody)
            ,
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        navigate('/signin');
                        throw new Error("Ошибка регистрации");
                    }
                    else if (response.status === 400) {
                        throw new Error("Ошибка регистрации");
                    }
                }
                return response.json()

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
            <div className={`${styles_modal["team-fields"]} ${event_role === "TEAMLEAD" ? styles_modal["visible"] : ""}`}>
                <input
                    type="text"
                    placeholder="Название команды"
                    className={styles_modal["input-field"]}
                    value={team_name}
                    onChange={(e) => setTeamName(e.target.value)}
                />
                <textarea
                    placeholder="Описание команды"
                    className={styles_modal["large-textarea-modal"]}
                    rows="5"
                    maxLength="500"
                    value={team_description}
                    onChange={(e) => setTeamDescription(e.target.value)}
                ></textarea>
            </div>
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
