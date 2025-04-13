import React, {useState} from "react";
import BaseModal from "./BaseModal.jsx";
import styles_modal from "../styles/PatchUserModal.module.css";
import {useNavigate} from "react-router-dom";
/*import styles_basemodal from "../styles/BaseModal.module.css";*/

const RegistrationEventModal = ({ isOpen, onClose}) => {
    const [formData, setFormData] = useState({
        login: "",
        password: "",
        email: "",
        tg_nickname: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = () => {
        fetch("http://localhost:8080/user/patch", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(formData)
        })
            .then(res => res.json())
            .then((data) => {
                console.log("Данные обновлены", data);
                onClose();
            })
            .catch(error => console.error("Ошибка обновления:", error));
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
                    <h3>Изменить данные</h3>
                    <input type="text" name="login" placeholder="Новый логин" className={`form-control ${styles_modal['input-dark']}`} onChange={handleChange} />
                    <input type="password" name="password" placeholder="Новый пароль" className={`form-control ${styles_modal['input-dark']}`} onChange={handleChange} />
                    <input type="email" name="email" placeholder="Новый email" className={`form-control ${styles_modal['input-dark']}`} onChange={handleChange} />
                    <input type="text" name="tg_nickname" placeholder="Новый Telegram" className={`form-control ${styles_modal['input-dark']}`} onChange={handleChange} />
                    <button onClick={handleUpdate} className="btn btn-primary">Сохранить</button>
        </BaseModal>
    );
};

export default RegistrationEventModal;