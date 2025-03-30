import React, {useState} from "react";
import styles from "../styles/LoginRegisterPage.module.css";
import {useNavigate} from "react-router-dom"; // Подключаем стили

const LoginForm = () => {
    const [password, setPassword] = useState("");
    const [login, setLogin] = useState("");
    const navigate = useNavigate();

    function LoginRequest() {
        fetch('http://localhost:8080/user/signin', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                login: login,
                password: password
            })
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        // console.log("неверный логин пароль))");
                        return Promise.reject("неверный логин пароль)))");
                    }
                }
                return response.json();
            })
            .then((data) => {
                localStorage.setItem("token", data.token);
                navigate('/homepage');
                // console.log("Токен в логине:", data.token);
            })
            .catch(error => console.error('Ошибка loginPage:', error));
    }

    return (
        <div className={styles['main-content']}>
            <div className={styles['fields-content']}>
            <h2>Вход в аккаунт</h2>
                <input type="text" placeholder="Введите логин" className={styles["input-field"]} value={login} onChange={(e) => setLogin(e.target.value)}/>
                <input type="password" placeholder="Введите пароль" className={styles["input-field"]} value={password} onChange={(e) => setPassword(e.target.value)}/>
                <button type="submit" className={styles["login-button"]} onClick={LoginRequest}>Войти</button>
            </div>
        </div>
    );
};

export default LoginForm;
