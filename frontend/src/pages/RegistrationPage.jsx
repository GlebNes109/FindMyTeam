import React, {useState} from "react";
import styles from "../styles/LoginRegisterPage.module.css"; // Подключаем стили


const RegistrationPage = () => {
    const [selectedOption, setSelectedOption] = useState(""); // Состояние для хранения выбранного варианта

    const handleChange = (event) => {
        setSelectedOption(event.target.value); // Обновляем состояние при выборе
    };

    return (
        <div className={styles['main-content']}>
            <div className={styles['fields-content']}>
                <h2>Регистрация</h2>
                <input type="password" placeholder="Введите электронную почту" className={styles["input-field"]}/>
                <input type="text" placeholder="Введите логин" className={styles["input-field"]}/>
                <input type="password" placeholder="Введите пароль" className={styles["input-field"]}/>
                <input type="password" placeholder="Повторите пароль" className={styles["input-field"]}/>
                <div>
                    <select className={styles["select"]} id="options" value={selectedOption} onChange={handleChange}>
                        <option value="">Выберите свою роль:</option>
                        <option value="option1">Капитан команды</option>
                        <option value="option2">Участник</option>
                    </select>
                </div>
                <button type="submit" className={styles["login-button"]}>Войти</button>
            </div>
        </div>
    );
};

export default RegistrationPage;