import React, {useState} from "react";
import styles from "../styles/LoginRegisterPage.module.css";
import {useNavigate} from "react-router-dom";

const RegistrationPage = () => {
    const [email, setEmail] = useState("");
    const [tg_nickname, setTg_nickname] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    function RegisterRequest() {
        if (password !== confirmPassword) {
            console.log("Passwords don't match");
            return;
        }

        fetch('http://localhost:8080/user/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                login: login,
                password: password,
                email: email,
                tg_nickname: tg_nickname,
            })
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        setErrorMessage("Не все поля заполнены или некорректные значения");
                        return;
                    }
                    if (response.status === 409) {
                        setErrorMessage("Такой логин уже есть, возьмите другой");
                        return;
                    }
                }
                return response.json();
            })
            .then((data) => {
                // console.log("Токен:", data.token);
                localStorage.setItem("token", data.token);
                navigate('/events');})
            .catch(error => console.error('Ошибка:', error));
    }

    return (
        <div className={styles['main-content']}>
            <div className={styles['fields-content']}>
                <h2>Регистрация</h2>
                <input type="text" placeholder="Введите электронную почту" className={`form-control ${styles['input-dark']}`} value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input type="text" placeholder="Введите логин" className={`form-control ${styles['input-dark']}`} value={login} onChange={(e) => setLogin(e.target.value)}/>
                <input type="text" placeholder="Введите tg никнейм для связи" className={`form-control ${styles['input-dark']}`} value={tg_nickname} onChange={(e) => setTg_nickname(e.target.value)}/>
                <input type="password" placeholder="Введите пароль" className={`form-control ${styles['input-dark']}`} value={password} onChange={(e) => setPassword(e.target.value)}/>
                <input type="password" placeholder="Повторите пароль" className={`form-control ${styles['input-dark']}`} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                <button type="submit" className="btn btn-primary"  onClick={RegisterRequest}>Зарегистрироваться
                </button>
                <button className={styles["link-button"]} onClick={() => navigate("/signin")}>Уже есть аккаунт?</button>
                {errorMessage && (
                    <div className="alert alert-danger mt-3" role="alert">
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistrationPage;