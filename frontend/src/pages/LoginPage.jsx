import React, {useState} from "react";
import styles from "../styles/LoginRegisterPage.module.css";
import {useNavigate} from "react-router-dom"; // Подключаем стили

const LoginPage = () => {
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
                navigate('/events');
                // console.log("Токен в логине:", data.token);
            })
            .catch(error => console.error('Ошибка loginPage:', error));
    }

    return (
        <div className={styles['main-content']}>
            <div className={styles['fields-content']}>
                <h2>Вход в аккаунт</h2>
                <input type="text" placeholder="Введите логин" className={`form-control ${styles['input-dark']}`} value={login}
                       onChange={(e) => setLogin(e.target.value)}/>
                <input type="password" placeholder="Введите пароль" className={`form-control ${styles['input-dark']}`} value={password}
                       onChange={(e) => setPassword(e.target.value)}/>
                <button type="submit"  className="btn btn-primary"  onClick={LoginRequest}>Войти</button>
                <button className={styles["link-button"]} onClick={() => navigate("/signup")}>еще нет аккаунта?
                    зарегистрируйтесь!</button>
            </div>
        </div>
    );
};

export default LoginPage;
