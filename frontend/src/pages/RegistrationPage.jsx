import React, {useState} from "react";
import styles from "../styles/LoginRegisterPage.module.css";

const RegistrationPage = () => {
    const [role, setRole] = useState(""); // Состояние для хранения выбранного варианта
    const [email, setEmail] = useState("");
    const [tg_nickname, setTg_nickname] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    /*function handle_change_role(e) {
        if (e.target.value === "Капитан команды") {
            setRole("TEAM_CAPTAIN");
        } else {
            setRole("USER");
        }
    }*/

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
                role: role
            })
        })
            .then(data => data.json())
            .then((data) => {
                // console.log("Токен:", data.token);
                localStorage.setItem("token", data.token);})
                // navigate("/")
            .catch(error => console.error('Ошибка:', error));
    }

    return (
        <div className={styles['main-content']}>
            <div className={styles['fields-content']}>
                <h2>Регистрация</h2>
                <input type="text" placeholder="Введите электронную почту" className={styles["input-field"]} value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input type="text" placeholder="Введите логин" className={styles["input-field"]} value={login} onChange={(e) => setLogin(e.target.value)}/>
                <input type="text" placeholder="Введите tg никнейм для связи" className={styles["input-field"]} value={tg_nickname} onChange={(e) => setTg_nickname(e.target.value)}/>
                <input type="password" placeholder="Введите пароль" className={styles["input-field"]} value={password} onChange={(e) => setPassword(e.target.value)}/>
                <input type="password" placeholder="Повторите пароль" className={styles["input-field"]} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                <div>
                    <select className={styles["select"]} id="options" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="USER">Участник</option>
                        <option value="TEAM_CAPTAIN">Капитан команды</option>
                    </select>
                </div>
                <button type="submit" className={styles["login-button"]} onClick={RegisterRequest}>Зарегистрироваться
                </button>
            </div>
        </div>
    );
};

export default RegistrationPage;