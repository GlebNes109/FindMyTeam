import styles from "../styles/HomePage.module.css";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();
    const [data, setData] = useState("");

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

    if (!data) {
        return <p>Загрузка...</p>;
    }

    return (
        <div className={styles['main-content']}>
            <div className={styles['text-content']}>
                <h1>Личный кабинет</h1>
                {data.login}
            </div>
        </div>
    );
}

export default HomePage;