import styles from "../styles/HomePage.module.css";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import UserAvatar from '../assets/avatar.jpeg';


function HomePage() {
    const navigate = useNavigate();
    const [data, setData] = useState("");

    const [formData, setFormData] = useState({
        login: "",
        password: "",
        email: "",
        tg_nickname: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            // если токен не был выдан - пусть идет на sign in вводить пароль
            navigate('/signin');
        }

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
                return response.json()
            })
            .then(data => {
                setData(data);
            })
            .catch(error => console.error('Ошибка HomePage:', error));

    }, [navigate]);

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
            })
            .catch(error => console.error("Ошибка обновления:", error));
    };

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
        <div className={styles['main-content']}>
            <div className={styles['user-info']}>
                <div className={styles['user-info-content-left']}>
                    <h2>Здравствуйте, {data.login}!</h2>
                <p>Email: {data.email}</p>
                <p>Telegram: {data.tg_nickname}</p>
                </div>
            <div className={styles['user-info-content-right']}>
                <button onClick={handleLogout} className={styles['button-exit']}>Выйти</button>
                <button onClick={handleDelete} className={styles['button-delete']}>Удалить профиль</button>
                <button onClick={handleUpdate} className={styles.button}>Редактировать профиль</button>
            </div>

            </div>
            <div>
            <h1>
                Ваши мероприятия
            </h1>
        </div>
            {/*<div className={styles.editSection}>
                <div className={styles['fields-content']}>
                    <h3>Изменить данные</h3>
                    <input type="text" name="login" placeholder="Новый логин" className={styles["input-field"]} onChange={handleChange} />
                <input type="password" name="password" placeholder="Новый пароль" className={styles["input-field"]} onChange={handleChange} />
                <input type="email" name="email" placeholder="Новый email" className={styles["input-field"]} onChange={handleChange} />
                <input type="text" name="tg_nickname" placeholder="Новый Telegram" className={styles["input-field"]} onChange={handleChange} />
                <button onClick={handleUpdate} className={styles.button}>Сохранить</button>
                </div>
            </div>*/}
        </div>
    );
}

export default HomePage;