import Navbar from "../components/NavBar.jsx";
import styles from "../components/NavBar.module.css";
import React from "react";

function MainPage() {
    return (
        <div className={styles['main-content']}>
        <div className={styles['text-content']}>
            <h1>Добро пожаловать в FindMyTeam</h1>
            <p>Здесь можно найти команду для олимпиад и проектов.</p>
            <div>
                <button className={styles['btn-login-register']}>Войти</button>
            </div>
            <div><button className={styles['btn-login-register']}>Зарегистрироваться</button></div>
        </div>
        </div>
    );
}

export default MainPage;