import React from "react";
import styles from "../styles/LoginRegisterPage.module.css"; // Подключаем стили

const RegistrationPage = () => {
    return (
        <div className={styles['main-content']}>
            <div className={styles['fields-content']}>
                <h2>Регистрация</h2>
                <input type="password" placeholder="Введите электронную почту" className={styles["input-field"]}/>
                <input type="text" placeholder="Введите логин" className={styles["input-field"]}/>
                <input type="password" placeholder="Введите пароль" className={styles["input-field"]}/>
                <input type="password" placeholder="Повторите пароль" className={styles["input-field"]}/>
                <button type="submit" className={styles["login-button"]}>Войти</button>
            </div>
        </div>
    );
};

export default RegistrationPage;